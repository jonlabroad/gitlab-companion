import GitlabClient from "./service/GitlabClient";
import { defaultConfiguration, UserConfiguration } from "./config/UserConfiguration";
import GitlabUtil from "./util/gitlab/GitlabUtil";
import GitlabEvent, { sortEvents } from "./service/GitlabEvent";
import { AppState, createDefaultAppState } from "./state/AppState";
import GitlabProject from "./service/GitlabProject";
import SavedProjectData from "./config/SavedProjectData";

export default class Background {
  protected static configKey = 'config';

  public static init() {
    Background.getUserConfig(function(userConfig: UserConfiguration) {
      const client = Background.createClient(userConfig);
      Background.refreshProjectData(userConfig, client, function() {
        Background.setAlarms();
      });
    });
  }

  protected static refreshProjectData(userConfig: UserConfiguration, client: GitlabClient, callback: () => void) {
    chrome.storage.sync.get(null, function(existingData) {
      const projectIdsToRemove = new Set<string>(Object.keys(existingData).filter(k => k.startsWith('project.')));
      const dataToWrite: {[key: string]: Object} = {};
      Promise.all(userConfig.groups.map(async (group) => {
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
      })).then(() => {
        chrome.storage.sync.set(dataToWrite, callback);

        // Clear out old project cache data
        console.log(projectIdsToRemove);
        chrome.storage.sync.remove(Array.from(projectIdsToRemove));
      });
    })
  }

  protected static getUserConfig(callback: (config: UserConfiguration) => void) {
    chrome.storage.sync.get([Background.configKey], function(result: {[key: string]: Object}) {
      let userConfig = (result?.config as UserConfiguration);
      if (!userConfig) {
        userConfig = defaultConfiguration;
        chrome.storage.sync.set({
          config: userConfig
        });
      }

      callback(userConfig);
    });
  }

  protected static async getEvents(gitlabClient: GitlabClient) {
    const eventPromises: Promise<GitlabEvent[]>[] = [];
  
    Background.getAppState((appState: AppState) => {
      chrome.storage.sync.get(null, async function(items) {

        chrome.storage.local.get(['events'], async function(results: {[key: string]: GitlabEvent[]}) {
          const existingEvents = results.events ?? [] as GitlabEvent[];
          const existingEventIds = new Set<string>(existingEvents.map(ev => ev.created_at));

          var projectIds = new Set<string>(Object.keys(items)
            .filter(key => key.startsWith('project.'))
            .map(projectKey => projectKey.replace('project.', '')));
    
          projectIds.forEach(projectId => {
            try {
              const afterDate = new Date(appState.lastEventPoll);
              afterDate.setDate(afterDate.getDate() - 1);
              eventPromises.push(gitlabClient.getProjectEvents(projectId, {
                after: `${afterDate.getFullYear()}-${afterDate.getMonth()}-${afterDate.getDate()}`
              }));
            } catch (err) {
              console.error(err);
            }
          });
      
          const eventResults = (await Promise.all(eventPromises)).flat();
          console.log({eventResults});

          // Filter out any that we already have
          const newEvents = eventResults.filter(ev => !existingEventIds.has(ev.created_at));
          if (newEvents.length > 0) {
            console.log(`NEW EVENTS: ${newEvents.length}`);
          }
          console.log(existingEvents);
          newEvents.push(...existingEvents.filter(ev => projectIds.has(`${ev.project_id}`)));
          sortEvents(newEvents);
          
          chrome.storage.local.set({events: newEvents});
        });
      });
    });
  }

  protected static handleRefreshEvent() {
    console.log("REFRESH EVENT RCVD");
    Background.getUserConfig((userConfig: UserConfiguration) => {
      const client = Background.createClient(userConfig);
      Background.refreshProjectData(userConfig, client, function() {
        Background.getEvents(Background.createClient(userConfig));
      });
    })
  }

  protected static handleConfigUpdate() {
    Background.getUserConfig((userConfig: UserConfiguration) => {
      const client = Background.createClient(userConfig);
      Background.refreshProjectData(userConfig, client, function() {
        Background.getEvents(Background.createClient(userConfig));
      });
    })
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
      if (request.type === "config_update") {
        console.log("CONFIG UPDATE");
        Background.handleRefreshEvent();
      }

      sendResponse();
    });
    chrome.alarms.onAlarm.addListener(Background.handleAlarms);
  }

  protected static handleAlarms(alarm: any) {
    switch(alarm.name) {
      case "refreshEvents":
      Background.handleRefreshEvent();
      break;
    }
  }

  protected static getAppState(callback: (appState: AppState) => void) {
    chrome.storage.sync.get(['appState'], function(result: {[key: string]: AppState}) {
      callback(result?.appState ?? createDefaultAppState());
    });
  }

  protected static setAppState(appState: AppState) {
    chrome.storage.sync.set({
      appState
    });
  }

  protected static createClient(userConfig: UserConfiguration) {
    return new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
  }
}

Background.init();