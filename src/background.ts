import GitlabClient from "./service/GitlabClient";
import { defaultConfiguration, UserConfiguration } from "./config/UserConfiguration";
import GitlabEvent, { sortEvents } from "./service/GitlabEvent";
import { AppState, createDefaultAppState } from "./state/AppState";
import GitlabProject from "./service/GitlabProject";
import SavedProjectData from "./config/SavedProjectData";
import Notification from "./util/Notification";
import ChromeStorage from "./util/chrome/ChromeStorage";
import ChromeAlarms from "./util/chrome/ChromeAlarms";
import MockChromeAlarms from "./mock/MockChromeAlarms";
import InMemoryChromeStorage from "./util/chrome/InMemoryChromeStorage";

export default class Background {
  protected static configKey = 'config';
  protected static storage = !Background.isLocalMode() ? new ChromeStorage() : new InMemoryChromeStorage();
  protected static alarms = !Background.isLocalMode() ? new ChromeAlarms() : new MockChromeAlarms();

  public static async init() {
    Background.subscribeToEvents();
    Background.setAlarms();
    const userConfig = await Background.getUserConfig();
    await Background.refreshAll();
  }

  protected static async refreshProjectData(userConfig: UserConfiguration, client: GitlabClient) {
    try {
      const existingData = await this.storage.getLocal(null);
      const appState = existingData.appState as AppState;
      const projectIdsToRemove = new Set<string>(Object.keys(existingData).filter(k => existingData[k]?.pollEvents && k.startsWith('project.')));
      const dataToWrite: {[key: string]: SavedProjectData} = {};
      await Promise.all(userConfig.groups.map(async (group) => {
        return client.getGroupProjects(group, {}).then((projects: GitlabProject[]) => {
          projects.forEach(project => {
            projectIdsToRemove.delete(`project.${project.id}`);
            dataToWrite[`project.${project.id}`] = {
              id: project.id,
              path_with_namespace: project.path_with_namespace,
              avatar_url: project.avatar_url,
              pollEvents: true,
              mergeRequestsToTrack: []
            } as SavedProjectData
          });
        })
      }));

      const user = await client.getCurrentUser();
      const mergeRequestsToTrack = await client.getMergeRequestEventsForMyApproval(appState?.lastEventPoll, user.id);
      const projectMrs: {[key: number]: number[]} = {};
      mergeRequestsToTrack.forEach(mr => {
        const projectId = mr.project_id;
        if (!projectMrs[projectId]) {
          projectMrs[projectId] = [];
        }
        if (mr.target_id) {
          projectMrs[projectId].push(mr.target_id);
        }
      });

      await Promise.all(mergeRequestsToTrack.map(async mr => {
        const projectKey = `project.${mr.project_id}`;
        const project = await client.getProjectById(mr.project_id.toString(), {});
        console.log({mr: project.path_with_namespace});
        if (!dataToWrite[projectKey]) {
          dataToWrite[`project.${mr.project_id}`] = {
            id: project.id,
            path_with_namespace: project.path_with_namespace,
            avatar_url: project.avatar_url,
            pollEvents: false,
            mergeRequestsToTrack: projectMrs[project.id] ?? []
          }
        }
      }));

      await this.storage.setLocal(dataToWrite);

      // Clear out old project cache data
      await this.storage.removeLocal(Array.from(projectIdsToRemove));
    } catch (err) {
      console.error(err);
    }
  }

  protected static async getUserConfig() {
    const result = await this.storage.getSync([Background.configKey]);
    let userConfig = (result?.config as UserConfiguration);
    if (!userConfig) {
      userConfig = defaultConfiguration;
      this.storage.setSync({
        config: userConfig
      });
    }

    return userConfig;
  }

  protected static async getEvents(gitlabClient: GitlabClient) {
    const eventPromises: Promise<GitlabEvent[]>[] = [];
  
    const appState = await Background.getAppState();
    const localStorage = await this.storage.getLocal(null);
    const existingEvents = (localStorage.events ?? []) as GitlabEvent[];
    const existingEventIds = new Set<string>(existingEvents.map(ev => ev.created_at));

    const projects: SavedProjectData[] = Object.keys(localStorage).filter(key => key.startsWith('project.')).map(key => localStorage[key]);
    var projectIds = new Set<string>(projects.filter(project => project.pollEvents).map(project => `${project.id}`));

    const afterDate = new Date(appState.lastEventPoll);
    afterDate.setDate(afterDate.getDate() - 3);

    projectIds.forEach(projectId => {
      try {
        eventPromises.push(gitlabClient.getProjectEvents(projectId, {
          after: `${afterDate.getFullYear()}-${afterDate.getMonth() + 1}-${afterDate.getDate()}`
        }));
      } catch (err) {
        console.error(err);
      }
    });

    var mrProjectIds = new Set<string>(projects.filter(project => project.mergeRequestsToTrack && project.mergeRequestsToTrack.length > 0).map(p => `${p.id}`));
    mrProjectIds.forEach(projectId => {
      try {
        eventPromises.push(Background.getMergeRequestEvents(projectId, projects, gitlabClient, afterDate));
      } catch (err) {
        console.error(err);
      }
    });
    
    const allEventResults = (await Promise.all(eventPromises)).flat();

    // Filter out any that we already have
    const newEvents = allEventResults.filter(ev => !existingEventIds.has(ev.created_at));
    if (!this.isLocalMode() && newEvents.length > 0) {
      chrome.browserAction.setBadgeText({
        text: `${newEvents.length}`
      });

      Notification.createEvents(projects, newEvents);
    }

    newEvents.push(...existingEvents.filter(ev => projectIds.has(`${ev.project_id}`) || mrProjectIds.has(`${ev.project_id}`)));
    sortEvents(newEvents);
    
    this.storage.setLocal({events: newEvents});
    Background.setAppState({
      ...appState,
      lastEventPoll: new Date().toISOString()
    });
  }

  protected static async getMergeRequestEvents(projectId: string, projects: SavedProjectData[], gitlabClient: GitlabClient, afterDate: Date): Promise<GitlabEvent[]> {
      const rawEvents = await gitlabClient.getProjectEvents(projectId, {
        target_type: 'merge_request',
        after: `${afterDate.getFullYear()}-${afterDate.getMonth() + 1}-${afterDate.getDate()}`
      })
      const relevantEvents = rawEvents.filter(ev =>
        projects.find(p => `${p.id}` === projectId)?.mergeRequestsToTrack.includes(ev.target_id ?? 0)
      );
      return relevantEvents;
  }

  protected static async handleRefreshEvent() {
    await Background.refreshAll();
  }

  protected static async handleConfigUpdate() {
    await Background.refreshAll();
  }

  protected static async refreshAll() {
    const userConfig = await Background.getUserConfig();
    const client = Background.createClient(userConfig);
    try {
      await Background.refreshProjectData(userConfig, client);
      await Background.getEvents(Background.createClient(userConfig));
      Background.setErrorMessages([]);
    } catch (err) {
      console.error("Error refreshing Gitlab data", err);
      Background.setErrorMessages([`Unable to refresh Gitlab data. Check Gitlab host and credentials in the Options menu. ${err.message}`]);
    }
  }

  protected static setAlarms() {
    this.alarms.create("refreshEvents", {
      when: 0,
      periodInMinutes: 1
    });
    this.alarms.addListener(Background.handleAlarms);
  }

  protected static subscribeToEvents() {
    if (!this.isLocalMode()) {
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type === "config_update") {
          Background.handleRefreshEvent();
        }

        sendResponse();
      });
    }
  }

  protected static handleAlarms(alarm: any) {
    console.log(`handled: ${alarm.name}`);
    switch(alarm.name) {
      case "refreshEvents":
        Background.handleRefreshEvent();
        break;
    }
  }

  protected static async getAppState(): Promise<AppState> {
    const result = await this.storage.getLocal(['appState']);
    return result?.appState ?? createDefaultAppState();
  }

  protected static async setAppState(appState: AppState) {
    await this.storage.setLocal({
      appState
    });
  }

  protected static createClient(userConfig: UserConfiguration) {
    return new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
  }

  protected static async setErrorMessages(errorMessages: string[]) {
    const appState = await Background.getAppState();
    await Background.setAppState({
      ...appState,
      errorMessages: errorMessages
    });
  }

  protected static isLocalMode() {
    return (typeof chrome === 'undefined');
  }
}

Background.init();

/*
setTimeout(() => {
  setTimeout(() => console.log("running..."), 10000);
}, 10000);
*/