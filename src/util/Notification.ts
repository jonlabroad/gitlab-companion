import GitlabEvent, { sortEvents } from "../service/GitlabEvent";
import GitlabProject from "../service/GitlabProject";
import SavedProjectData from "../config/SavedProjectData";

const MAX_NUM_NOTIFICATION = 5;

export default class Notification {
    public static createEvents(projects: SavedProjectData[], events: GitlabEvent[]) {
        sortEvents(events);
        const eventsToNotify = events.slice(0, MAX_NUM_NOTIFICATION);
        eventsToNotify.forEach(event => {
            const project = projects.find(p => p.id === event.project_id);
            if (project) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "/icon/icon-128.png",
                    title: `${event.action_name} ${event.target_title ?? ''}`,
                    message: `${event.author.name} ${event.action_name} ${event.target_title ?? event.push_data?.commit_title ?? ''}`,
                    contextMessage: `${project?.path_with_namespace}`
                } as NotificationOptions);
            }
        });
    }
}