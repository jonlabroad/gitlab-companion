export default interface GitlabProject {
    id: number
    description: string
    default_branch: string
    tag_list: string[]
    archived: boolean
    visibility: string
    ssh_url_to_repo: string
    http_url_to_repo: string
    web_url: string
    name: string
    name_with_namespace: string
    path: string
    path_with_namespace: string
    issues_enabled: boolean
    merge_requests_enabled: boolean
    wiki_enabled: boolean
    jobs_enabled: boolean
    snippets_enabled: boolean
    created_at: string
    last_activity_at: string
    shared_runners_enabled: boolean
    creator_id: number
    namespace: {
      id: number
      name: string
      path: string
      kind: string
    },
    avatar_url: string
    star_count: number
    forks_count: number
    open_issues_count: number
    public_jobs: boolean
    shared_with_groups: string[]
    request_access_enabled: boolean
}