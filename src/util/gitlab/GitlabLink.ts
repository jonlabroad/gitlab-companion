import { UserConfiguration } from "../../config/UserConfiguration";

export default class GitlabLink {
    public static projectLink(config: UserConfiguration, projectPath: string) {
        return `${config.gitlabHost}/${projectPath}`;
    }
}