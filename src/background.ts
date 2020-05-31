import GitlabClient from "./service/GitlabClient";
import { defaultConfiguration, UserConfiguration } from "./config/UserConfiguration";
import GitlabUtil from "./util/gitlab/GitlabUtil";
import GitlabEvent, { sortEvents } from "./service/GitlabEvent";
import { AppState, createDefaultAppState } from "./state/AppState";
import GitlabProject from "./service/GitlabProject";
import SavedProjectData from "./config/SavedProjectData";
import Notification from "./util/Notification";
import ChromeStorage from "./util/chrome/ChromeStorage";

export default class Background {
  protected static configKey = 'config';

  public static async init() {
    Background.subscribeToEvents();
    Background.setAlarms();
    const userConfig = await Background.getUserConfig();
    const client = Background.createClient(userConfig);
    await Background.refreshProjectData(userConfig, client);
  }

  protected static async refreshProjectData(userConfig: UserConfiguration, client: GitlabClient) {
    try {
      const existingData = await ChromeStorage.getLocal(null);
      const projectIdsToRemove = new Set<string>(Object.keys(existingData).filter(k => k.startsWith('project.')));
      const dataToWrite: {[key: string]: Object} = {};
      await Promise.all(userConfig.groups.map(async (group) => {
        return client.getGroupProjects(group, {}).then((projects: GitlabProject[]) => {
          projects.forEach(project => {
            projectIdsToRemove.delete(`project.${project.id}`);
            dataToWrite[`project.${project.id}`] = {
              id: project.id,
              path_with_namespace: project.path_with_namespace,
              avatar_url: project.avatar_url
            } as SavedProjectData
          });
        })
      }));
      await ChromeStorage.setLocal(dataToWrite);

      // Clear out old project cache data
      await ChromeStorage.removeLocal(Array.from(projectIdsToRemove));
    } catch (err) {
      console.error(err);
    }
  }

  protected static async getUserConfig() {
    const result = await ChromeStorage.getSync([Background.configKey]);
    let userConfig = (result?.config as UserConfiguration);
    if (!userConfig) {
      userConfig = defaultConfiguration;
      ChromeStorage.setSync({
        config: userConfig
      });
    }

    return userConfig;
  }

  protected static async getEvents(gitlabClient: GitlabClient) {
    const eventPromises: Promise<GitlabEvent[]>[] = [];
  
    const appState = await Background.getAppState();
    const localStorage = await ChromeStorage.getLocal(null);
    const existingEvents = (localStorage.events ?? []) as GitlabEvent[];
    const existingEventIds = new Set<string>(existingEvents.map(ev => ev.created_at));

    const projects: SavedProjectData[] = Object.keys(localStorage).filter(key => key.startsWith('project.')).map(key => localStorage[key]);
    var projectIds = new Set<string>(projects.map(project => `${project.id}`));
  
    projectIds.forEach(projectId => {
      try {
        const afterDate = new Date(appState.lastEventPoll);
        afterDate.setDate(afterDate.getDate() - 3);
        eventPromises.push(gitlabClient.getProjectEvents(projectId, {
          after: `${afterDate.getFullYear()}-${afterDate.getMonth()}-${afterDate.getDate()}`
        }));
      } catch (err) {
        console.error(err);
      }
    });
    
    const allEventResults = (await Promise.all(eventPromises)).flat();

    // Filter out any that we already have
    const newEvents = allEventResults.filter(ev => !existingEventIds.has(ev.created_at));
    if (newEvents.length > 0) {
      chrome.browserAction.setBadgeText({
        text: `${newEvents.length}`
      });

      Notification.createEvents(projects, newEvents);
    }

    newEvents.push(...existingEvents.filter(ev => projectIds.has(`${ev.project_id}`)));
    sortEvents(newEvents);
    
    ChromeStorage.setLocal({events: newEvents});
    Background.setAppState({
      ...appState,
      lastEventPoll: new Date().toISOString()
    });
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
    await Background.refreshProjectData(userConfig, client);
    await Background.getEvents(Background.createClient(userConfig));
  }

  protected static setAlarms() {
    chrome.alarms.create("refreshEvents", {
      when: 0,
      periodInMinutes: 1
    });
    chrome.alarms.onAlarm.addListener(Background.handleAlarms);
  }

  protected static subscribeToEvents() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      console.log({message: request});
      if (request.type === "config_update") {
        console.log("CONFIG UPDATE");
        Background.handleRefreshEvent();
      }

      sendResponse();
    });
    chrome.alarms.onAlarm.addListener(Background.handleAlarms);
  }

  protected static handleAlarms(alarm: any) {
    console.log({alarm});
    switch(alarm.name) {
      case "refreshEvents":
        Background.handleRefreshEvent();
        break;
    }
  }

  protected static async getAppState(): Promise<AppState> {
    const result = await ChromeStorage.getLocal(['appState']);
    return result?.appState ?? createDefaultAppState();
  }

  protected static async setAppState(appState: AppState) {
    await ChromeStorage.setLocal({
      appState
    });
  }

  protected static createClient(userConfig: UserConfiguration) {
    return new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
  }
}

Background.init();