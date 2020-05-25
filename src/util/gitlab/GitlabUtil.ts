export default class GitlabUtil {
    public static parseId(graphqlId: string) {
        return graphqlId.substr(graphqlId.lastIndexOf("/") + 1);
    }
}