import { UserConfiguration } from "../config/UserConfiguration";
import GitlabClient from "../service/GitlabClient";
import GitlabEvent, { sortEvents } from "../service/GitlabEvent";
import SavedProjectData from "../config/SavedProjectData";
import ChromeStorage from "../util/chrome/ChromeStorage";
import { AppState } from "../state/AppState";
import Notification from "../util/Notification";
import RunUtil from "../util/RunUtil";
import IChromeStorage from "../util/chrome/IChromeStorage";

export default class EventsProvider {
    client: GitlabClient
    config: UserConfiguration
    storage: IChromeStorage

    constructor(userConfig: UserConfiguration, storage: IChromeStorage) {
        this.config = userConfig;
        this.client = new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
        this.storage = storage;
    }

    public async getEvents(gitlabClient: GitlabClient, appState?: AppState) {
        const eventPromises: Promise<GitlabEvent[]>[] = [];

        const localStorage = await this.storage.getLocal(null);
        const existingEvents = (localStorage.events ?? []) as GitlabEvent[];
        const existingEventIds = new Set<string>(existingEvents.map(ev => ev.created_at));

        const projects: SavedProjectData[] = Object.keys(localStorage).filter(key => key.startsWith('project.')).map(key => localStorage[key]);
        var projectIds = new Set<string>(projects.filter(project => project.pollEvents).map(project => `${project.id}`));

        if (!appState) {
            const lastPollDate = new Date();
            lastPollDate.setDate(lastPollDate.getDate() - 7);
            appState = {
                lastEventPoll: lastPollDate.toISOString(),
                errorMessages: []
            }
        }

        const afterDate = appState.lastEventPoll ? new Date(appState.lastEventPoll) : new Date();
        afterDate.setDate(afterDate.getDate() - 7);

        projectIds.forEach(projectId => {
            eventPromises.push(this.getProjectEvents(projectId, afterDate));
        });

        var mrProjectIds = new Set<string>(projects.filter(project => project.mergeRequestsToTrack && project.mergeRequestsToTrack.length > 0).map(p => `${p.id}`));
        mrProjectIds.forEach(projectId => {
            eventPromises.push(this.getMergeRequestEvents(projectId, projects, gitlabClient, afterDate));
        });

        const allEventResults = sortEvents((await Promise.all(eventPromises)).flat());

        // Filter out any that we already have
        const newEvents = allEventResults.filter(ev => !existingEventIds.has(ev.created_at));

        sortEvents(newEvents);

        if (!RunUtil.isLocalMode()) {
            if (chrome?.browserAction && newEvents.length > 0) {
                chrome.browserAction.setBadgeText({
                    text: `${newEvents.length}`
                });
    
                Notification.createEvents(projects, newEvents);
            }
        }
    
        this.storage.setLocal({
            events: sortEvents([...existingEvents, ...newEvents])
        });

        return newEvents;
    }

    protected async getMergeRequestEvents(
        projectId: string,
        projects: SavedProjectData[],
        gitlabClient: GitlabClient,
        afterDate: Date
    ) : Promise<GitlabEvent[]> {
        try {
            const rawEvents = await gitlabClient.getProjectEvents(projectId, {
                target_type: 'merge_request',
                after: this.getPollDateString(afterDate)
            })
            const relevantEvents = rawEvents.filter(ev =>
                projects.find(p => `${p.id}` === projectId)?.mergeRequestsToTrack.includes(ev.target_id ?? 0)
            );
            return relevantEvents;
        } catch (err) {
            console.error(`Error while getting merge request events`, err);
        }

        return [];
    }

    protected async getProjectEvents(
        projectId: string,
        lastPollDate: Date
    ): Promise<GitlabEvent[]> {
        try {
            return this.client.getProjectEvents(projectId, {
                after: this.getPollDateString(lastPollDate)
            });
        } catch (err) {
            console.error(err);
        }

        return [];
    }

    protected getPollDateString(date: Date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
}