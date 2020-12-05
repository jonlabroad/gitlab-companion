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
import EventsProvider from "./data/EventsProvider";
import ProjectProvider from "./data/ProjectProvider";
import RunUtil from "./util/RunUtil";
import MergeRequestProvider from "./data/MergeRequestProvider";
import { GitlabMergeRequest } from "./service/GitlabMergeRequest";
import SavedMrData from "./config/SavedMrData";

export default class Background {
  protected static configKey = 'config';
  protected static storage = !Background.isLocalMode() ? new ChromeStorage() : new InMemoryChromeStorage();
  protected static alarms = !Background.isLocalMode() ? new ChromeAlarms() : new MockChromeAlarms();

  public static async init() {
    Background.subscribeToEvents();
    Background.setAlarms();
    await Background.refreshAll();
  }

  protected static async refreshProjectData(userConfig: UserConfiguration, client: GitlabClient) {
    try {
      const projectProvider = new ProjectProvider(userConfig, this.storage);
      const dataToWrite = projectProvider.getAllProjects();

      await this.storage.setLocal(dataToWrite);

      const existingData = await this.storage.getLocal(null);
      const projectIdsToRemove = new Set<string>(Object.keys(existingData).filter(k => existingData[k]?.pollEvents && k.startsWith('project.')));
      
      Object.keys(dataToWrite).forEach(projectKey => projectIdsToRemove.delete(projectKey));

      // Clear out old project cache data
      //await this.storage.removeLocal(Array.from(projectIdsToRemove));
    } catch (err) {
      console.error(`Error refreshing project data`, err);
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
    const appState = await Background.getAppState();
    const userConfig = await Background.getUserConfig();
    const eventProvider = new EventsProvider(userConfig, this.storage);

    const newEvents = await eventProvider.getEvents(gitlabClient, appState);

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

  protected static async getMergeRequests(userConfig: UserConfiguration) {
    const provider = new MergeRequestProvider(userConfig, this.storage);
    await provider.getAndSaveAll();
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
      await Background.getMergeRequests(userConfig);
      Background.setErrorMessages([]);

      const appState = await Background.getAppState();
      const pollDate = new Date();
      pollDate.setDate(pollDate.getDate() - 7);
      Background.setAppState({
        ...appState,
        lastEventPoll: pollDate.toISOString()
      });
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
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.type === "config_update") {
          Background.handleRefreshEvent();
        }

        sendResponse();
      });
    }
  }

  protected static handleAlarms(alarm: any) {
    console.log(`handled: ${alarm.name}`);
    switch (alarm.name) {
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
    return RunUtil.isLocalMode();
  }
}

Background.init();

/*
setTimeout(() => {
  setTimeout(() => console.log("running..."), 10000);
}, 10000);
*/