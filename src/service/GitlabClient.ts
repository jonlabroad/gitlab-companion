import Axios from 'axios';
import qs from 'qs';
import ApolloClient, { gql } from 'apollo-boost';
import { groupProjects } from './__generated__/groupProjects';
import GitlabEvent from './GitlabEvent';

export default class GitlabClient {
    host: string
    baseUrl: string
    personalAccessToken: string
    graphql: any

    constructor(host: string, personalAccessToken: string) {
        this.host = host;
        this.baseUrl = `${host}/api/v4/`
        this.personalAccessToken = personalAccessToken;
        this.graphql = new ApolloClient({
            uri: `https://gitlab.com/api/graphql`,
            headers: {
                "Authorization": `Bearer ${this.personalAccessToken}`,
                "Content-Type": "application/json"
            }
        })
    }

    public async getGroupProjects(group: string): Promise<groupProjects> {
        const response = await this.graphQl(gql`
            query groupProjects {
                currentUser {
                    name
                }
                group(fullPath: "${group}") {
                    name
                    projects {
                        nodes {
                            id
                            name
                            description
                            fullPath
                            avatarUrl
                            description
                        }
                    }
                }
            }`
        );
        return response.data;
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