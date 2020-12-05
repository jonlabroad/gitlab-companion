import GitlabClient from "../service/GitlabClient";
import { UserConfiguration } from "../config/UserConfiguration";
import { GitlabMergeRequest } from "../service/GitlabMergeRequest";
import IChromeStorage from "../util/chrome/IChromeStorage";
import SavedMrData from "../config/SavedMrData";

export default class MergeRequestProvider {
    userConfig: UserConfiguration
    client: GitlabClient
    storage: IChromeStorage
    
    constructor(userConfig: UserConfiguration, storage: IChromeStorage) {
        this.client = new GitlabClient(userConfig.gitlabHost, userConfig.personalAccessToken);
        this.storage = storage;
        this.userConfig = userConfig;
    }

    public async getAndSaveAll() {
        const allMrs: GitlabMergeRequest[] = (await Promise.all([
            this.getGroupMergeRequests(this.userConfig.groups),
            this.getMyApprovalMergeRequests(),
            this.getMyAuthoredMergeRequests()
        ])).flat();

        const mrsMapped: {[key: string]: SavedMrData} = {};
        const existingMrKeys = Object.keys(await this.storage.getLocal(null)).filter(key => key.startsWith('mr.'));
        await this.storage.removeLocal(existingMrKeys);
        allMrs.forEach(mr => mrsMapped[`mr.${mr.id}`] = new SavedMrData(mr));
        await this.storage.setLocal(mrsMapped);
    }

    public async getMyApprovalMergeRequests(): Promise<GitlabMergeRequest[]> {
        try {
            const user = await this.client.getCurrentUser();
            const mrs = await this.client.getMergeRequestPages({
                scope: "all",
                state: "opened",
                "approver_ids[]": user.id.toString()
            });
            return mrs.flat();
        } catch (err) {
            console.error("Could not get merge requests", err);
        }
        return [];
    }

    public async getMyAuthoredMergeRequests(): Promise<GitlabMergeRequest[]> {
        try {
            const user = await this.client.getCurrentUser();
            const mrs = await this.client.getMergeRequestPages({
                scope: "all",
                state: "opened",
                "author_id": user.id.toString()
            });
            return mrs.flat();
        } catch (err) {
            console.error("Could not get merge requests", err);
        }
        return [];
    }

    public async getGroupMergeRequests(groups: string[]): Promise<GitlabMergeRequest[]> {
        try {
            const groupMrs = (await Promise.all(
                groups.map(async group => {
                    return await this.client.getGroupMergeRequestPages(group, {
                        scope: "all",
                        state: "opened",
                    })
                })
            ));
            return groupMrs.flat();
        } catch (err) {
            console.error("Could not get group merge requests", err);
        }
        return [];
    }

    public deduplicate(mrs: GitlabMergeRequest[]) {
        const deduplicated: {[key: string]: GitlabMergeRequest} = {};
        mrs.forEach(mr => deduplicated[mr.id] = mr);
        return Object.keys(deduplicated).map(key => deduplicated[key]);
    }
}