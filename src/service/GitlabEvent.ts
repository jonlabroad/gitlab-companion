export type GitlabAction = "commented on" | "opened" | "deleted" | "pushed to" | "pushed new" | "accepted" | "created" | "updated" | "closed" | "reopened" | "pushed" | "commented" | "merged" | "joined" | "left" | "destroyed" | "expired";
export type GitlabTarget = "Issue" | "Milestone" | "MergeRquest" | "Note" | "Project" | "Snippet" | "User";

export const sortEvents = (events: GitlabEvent[]) => {
  return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? [];
}

export interface GitlabPushData {
  commit_count: number
  action: string
  ref_type: string
  commit_from: string
  commit_to: string
  ref: string
  commit_title: string
  ref_count: null
}

export interface GitlabNote {
  id: string
  type: string
  body: string
  
  // There's other stuff not included
}

export default interface GitlabEvent {
    title?: string
    project_id: number
    action_name: GitlabAction
    target_id: number
    target_type: GitlabTarget
    author_id: number
    target_title: string
    created_at: string
    author:{
      name: string
      username: string
      id: number
      state: string
      avatar_url: string
      web_url: string
    }
    author_username: string

    // "pushed to", "pushed new"
    push_data?: GitlabPushData

    // "commented on"
    note?: GitlabNote
}
