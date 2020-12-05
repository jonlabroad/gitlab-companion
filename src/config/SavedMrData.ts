import { GitlabMergeRequest } from "../service/GitlabMergeRequest";
import { GitlabAuthor } from "../service/GitlabEvent";

export default class SavedMrData {
    public id: number
    public project_id: number
    public title: string
    public description: string
    public state: string
    public created_at: string
    public updated_at: string
    public target_branch: string
    public source_branch: string
    public author: GitlabAuthor
    public work_in_progress: boolean
    public web_url: string
    public has_conflicts: boolean

    constructor(mr: GitlabMergeRequest) {
        this.id = mr.id;
        this.project_id = mr.project_id;
        this.title = mr.title;
        this.description = mr.description;
        this.state = mr.state;
        this.created_at = mr.created_at;
        this.updated_at = mr.updated_at;
        this.target_branch = mr.target_branch;
        this.source_branch = mr.source_branch;
        this.author = mr.author;
        this.work_in_progress = mr.work_in_progress;
        this.web_url = mr.web_url;
        this.has_conflicts = mr.has_conflicts;
    }
}