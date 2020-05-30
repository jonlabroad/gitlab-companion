export default interface GitlabGroup {
  id: number
  web_url: string
  name: string
  path: string
  description: string
  visibility: string
  share_with_group_lock: boolean
  require_two_factor_authentication: boolean
  two_factor_grace_period: number
  project_creation_level: string
  auto_devops_enabled: string
  subgroup_creation_level: string
  emails_disabled: string
  mentions_disabled: string
  lfs_enabled: boolean
  default_branch_protection: number
  avatar_url: string
  request_access_enabled: boolean
  full_name: string
  full_path: string
  created_at: string
  parent_id: number
  ldap_cn: string
  ldap_access: string
  marked_for_deletion_on: string
}