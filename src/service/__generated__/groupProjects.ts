/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: groupProjects
// ====================================================

export interface groupProjects_currentUser {
  __typename: "User";
  /**
   * Human-readable name of the user
   */
  name: string;
}

export interface groupProjects_group_projects_nodes {
  __typename: "Project";
  /**
   * ID of the project
   */
  id: string;
  /**
   * Name of the project (without namespace)
   */
  name: string;
  /**
   * Short description of the project
   */
  description: string | null;
  /**
   * Full path of the project
   */
  fullPath: string;
  /**
   * URL to avatar image file of the project
   */
  avatarUrl: string | null;
}

export interface groupProjects_group_projects {
  __typename: "ProjectConnection";
  /**
   * A list of nodes.
   */
  nodes: (groupProjects_group_projects_nodes | null)[] | null;
}

export interface groupProjects_group {
  __typename: "Group";
  /**
   * Name of the namespace
   */
  name: string;
  /**
   * Projects within this namespace
   */
  projects: groupProjects_group_projects;
}

export interface groupProjects {
  /**
   * Get information about current user
   */
  currentUser: groupProjects_currentUser | null;
  /**
   * Find a group
   */
  group: groupProjects_group | null;
}
