import IGitlabClient from "../service/IGitlabClient";
import GitlabProject from "../service/GitlabProject";
import GitlabEvent from "../service/GitlabEvent";
import GitlabGroup from "../service/GitlabGroup";
import { mockProjects } from "./MockProjects";
import { mockEvents } from "./MockProjectEvents";
import { GitlabUser } from "../service/GitlabUser";

export default class MockGitlabClient implements IGitlabClient {
    getMergeRequestEventsForMyApproval(lastPollTimestamp: string, userId: number): Promise<GitlabEvent[]> {
        return Promise.resolve([]);
    }
    getGroupProjects(group: string, params: any): Promise<GitlabProject[]> {
        return Promise.resolve(mockProjects);
    }

    getCurrentUserEvents(params: { [key: string]: string; }): Promise<GitlabEvent[]> {
        return Promise.resolve([]);
    }

    getProjectEvents(projectId: string, params: { [key: string]: string; }): Promise<GitlabEvent[]> {
        return Promise.resolve(mockEvents[parseInt(projectId)]);
    }

    getUserGroups(params: { [key: string]: string; }): Promise<GitlabGroup[]> {
        return Promise.resolve([]);
    }

    getCurrentUser(): Promise<GitlabUser> {
        return Promise.resolve({
            id: 1
        } as GitlabUser);
    }
}
