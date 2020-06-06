import { GitlabAuthor } from "./GitlabEvent";

export interface GitlabMergeRequest {
    id: number
    iid: number
    project_id: number
    title: string
    description: string
    state: string
    created_at: string
    updated_at: string
    merged_by: GitlabAuthor
    merged_at: string
    closed_by: GitlabAuthor
    closed_at: string
    target_branch: string
    source_branch: string
    user_notes_count: number
    upvotes: number
    downvotes: number
    assignee?: GitlabAuthor
    author: GitlabAuthor
    assignees: GitlabAuthor[]
    source_project_id: number
    target_project_id: number
    labels: string[]
    work_in_progress: boolean
    milestone?: string
    merge_when_pipeline_succeeds: boolean
    merge_status: string
    sha: string
    merge_commit_sha: string
    squash_commit_sha?: string
    discussion_locked?: boolean
    should_remove_source_branch: null
    force_remove_source_branch: boolean
    reference: string
    references: {
        short: string
        relative: string
        full: string
    },
    web_url: string
    time_stats: {
        time_estimate: number
        total_time_spent: number
        human_time_estimate?: null
        human_total_time_spent?: null
    },
    squash: boolean
    task_completion_status: {
        count: number
        completed_count: number
    },
    has_conflicts: boolean
    blocking_discussions_resolved: boolean
    approvals_before_merge?: number
}