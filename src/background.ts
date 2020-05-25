import GitlabClient from "./service/GitlabClient";
import { defaultConfiguration, UserConfiguration } from "./config/UserConfiguration";
import { groupProjects } from "./service/__generated__/groupProjects";
import GitlabUtil from "./util/gitlab/GitlabUtil";
import GitlabEvent, { sortEvents } from "./service/GitlabEvent";
import { AppState, createDefaultAppState } from "./state/AppState";

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
    userConfig.groups.forEach(group => {
      client.getGroupProjects(group).then((projects: groupProjects) => {

        projects.group?.projects.nodes?.forEach(project => {
          chrome.storage.sync.set({
            [`project.${GitlabUtil.parseId(project?.id ?? "")}`]: project
          });
        });
      })
      callback();
    });
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

          var projectIds = Object.keys(items)
          .filter(key => key.startsWith('project.'))
          .map(projectKey => projectKey.replace('project.', ''));
    
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

          // Filter out any that we already have
          const newEvents = eventResults.filter(ev => !existingEventIds.has(ev.created_at));
          if (newEvents.length > 0) {
            console.log(`NEW EVENTS: ${newEvents.length}`);
          }
          newEvents.push(...existingEvents);
          sortEvents(newEvents);
          
          chrome.storage.local.set({events: newEvents});
        });
      });
    });
  }

  protected static handleRefreshEvent() {
    Background.getUserConfig((userConfig: UserConfiguration) => {
      Background.getEvents(Background.createClient(userConfig));
    })
  }

  protected static setAlarms() {
    console.log("SET ALARMS");
    chrome.alarms.create("refreshEvents", {
      when: 0,
      periodInMinutes: 1
    });
    chrome.alarms.onAlarm.addListener(Background.handleAlarms);
  }

  protected static handleAlarms(alarm: any) {
    console.log({alarm: alarm})
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