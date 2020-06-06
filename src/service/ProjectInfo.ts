import GitlabProject from "./GitlabProject";

export interface ProjectInfo extends GitlabProject {
    pollEvents: boolean
}