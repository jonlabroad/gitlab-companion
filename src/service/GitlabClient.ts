import Axios from 'axios';
import qs from 'qs';
import GitlabEvent from './GitlabEvent';
import GitlabProject from './GitlabProject';

export default class GitlabClient {
    host: string
    baseUrl: string
    personalAccessToken: string
    graphql: any

    constructor(host: string, personalAccessToken: string) {
        this.host = host;
        this.baseUrl = `${host}/api/v4/`
        this.personalAccessToken = personalAccessToken;
    }

    public async getGroupProjects(group: string, params: any) : Promise<GitlabProject[]> {
        const url = `${this.baseUrl}groups/${encodeURIComponent(group)}/projects`;
        return await this.getWithAuth(url, params) as GitlabProject[];
    }

    public async graphQl(query: any): Promise<any> {
        const response = await this.graphql.query(
            {
                query
            }
        );
        return response;
    }

    public async getCurrentUserEvents(params: {[key: string]: string}) {
        const url = `${this.baseUrl}events`;
        return await this.getWithAuth(url, params);
    }

    public async getProjectEvents(projectId: string | number, params: {[key: string]: string}): Promise<GitlabEvent[]> {
        const url = `${this.baseUrl}projects/${projectId}/events`;
        return await this.getWithAuth(url, params);
    }

    protected async getWithAuth(url: string, params: {[key: string]: string}): Promise<any> {
        const stringParams = qs.stringify({
            ...params,
            private_token: this.personalAccessToken
        });
        const urlAuth = `${url}?${stringParams}`;
        const response = await Axios.get(urlAuth);
        return response.data;
    }
}