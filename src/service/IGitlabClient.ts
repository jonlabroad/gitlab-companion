import GitlabEvent from './GitlabEvent';
import GitlabProject from './GitlabProject';
import GitlabGroup from './GitlabGroup';

export default interface IGitlabClient {
    getGroupProjects(group: string, params: any) : Promise<GitlabProject[]>
    getCurrentUserEvents(params: {[key: string]: string}): Promise<GitlabEvent[]>
    getProjectEvents(projectId: string, params: {[key: string]: string}): Promise<GitlabEvent[]>
    getUserGroups(params: {[key: string]: string}): Promise<GitlabGroup[]>
}