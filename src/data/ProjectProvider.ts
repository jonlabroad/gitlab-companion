import GitlabClient from "../service/GitlabClient";
import { UserConfiguration } from "../config/UserConfiguration";
import SavedProjectData from "../config/SavedProjectData";
import { AppState } from "../state/AppState";
import GitlabProject from "../service/GitlabProject";
import IChromeStorage from "../util/chrome/IChromeStorage";

export default class ProjectProvider {
    client: GitlabClient
    config: UserConfiguration
    storage: IChromeStorage

    constructor(userConfig: UserConfiguration, storage: IChromeStorage) {
        this.config = userConfig;
        this.client = new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
        this.storage = storage;
    }
   
    public async getAllProjects(): Promise<{[key: string]: SavedProjectData}> {
        try {
            const existingData = await this.storage.getLocal(null);
            const appState = existingData.appState as AppState;
            const dataToWrite: { [key: string]: SavedProjectData } = {};

            // Get all projects within the watched group(s)
            await Promise.all(this.config.groups.map(async (group) => {
                return this.client.getAllGroupProjects(group, {}).then((projects: GitlabProject[]) => {
                    projects.forEach(project => {
                        dataToWrite[`project.${project.id}`] = {
                            id: project.id,
                            path_with_namespace: project?.path_with_namespace,
                            avatar_url: project?.avatar_url,
                            pollEvents: true,
                            mergeRequestsToTrack: []
                        } as SavedProjectData
                    });
                })
            }));

            // Merge requests where I am an approver
            const user = await this.client.getCurrentUser();
            const mergeRequestsToTrack = await this.client.getMergeRequestEventsForMyApproval(appState?.lastEventPoll, user.id);
            const projectMrs: { [key: number]: number[] } = {};
            mergeRequestsToTrack.forEach(mr => {
                const projectId = mr.project_id;
                if (!projectMrs[projectId]) {
                    projectMrs[projectId] = [];
                }
                if (mr.target_id) {
                    projectMrs[projectId].push(mr.target_id);
                }
            });

            // Get all projects for the merge requests we need to track
            await Promise.all(mergeRequestsToTrack.map(async mr => {
                const projectKey = `project.${mr.project_id}`;
                let project: GitlabProject | undefined = undefined;
                try {
                    project = await this.client.getProjectById(mr.project_id.toString(), {});
                } catch (err) {
                    console.error(`Error getting project ${mr.project_id}`, err);
                }
                if (project && !dataToWrite[projectKey]) {
                    dataToWrite[`project.${mr.project_id}`] = {
                        id: project.id,
                        path_with_namespace: project?.path_with_namespace,
                        avatar_url: project?.avatar_url,
                        pollEvents: false,
                        mergeRequestsToTrack: projectMrs[project.id] ?? []
                    }
                }
            }));

            this.storage.setLocal(dataToWrite);
            
            return dataToWrite;
        } catch (err) {
            console.error(err);
        }

        return {};
    }
}