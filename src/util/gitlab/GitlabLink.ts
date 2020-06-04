import { UserConfiguration } from "../../config/UserConfiguration";
import { GitlabPushData, GitlabNote } from "../../service/GitlabEvent";

export default class GitlabLink {
    public static projectLink(config: UserConfiguration, projectPath: string) {
        return `${config.gitlabHost}/${projectPath}`;
    }

    public static projectBranchLink(config: UserConfiguration, projectPath: string, refName: string) {
        return `${config.gitlabHost}/${projectPath}/-/tree/${refName}`;
    }

    public static commitsLink(config: UserConfiguration, projectPath: string, pushData: GitlabPushData) {
        if (pushData.commit_count > 2) {
            return `${config.gitlabHost}/${projectPath}/-/compare/${pushData.commit_from}...${pushData.commit_to}`;
        } else {
            return `${config.gitlabHost}/${projectPath}/-/commit/${pushData.commit_to}`;
        }
    }

    public static mergeRequestLink(config: UserConfiguration, projectPath: string, mergeRequestId: number) {
        return `${config.gitlabHost}/${projectPath}/-/merge_requests/${mergeRequestId}`;
    }

    public static noteLink(config: UserConfiguration, projectPath: string, note: GitlabNote) {
        if (note.noteable_type === "MergeRequest") {
            return `${this.mergeRequestLink(config, projectPath, note.noteable_iid)}#note_${note.id}`;
        } else {
            return `${config.gitlabHost}/${projectPath}`;
        }
    }

}