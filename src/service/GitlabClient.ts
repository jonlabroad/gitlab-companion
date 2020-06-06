import Axios from 'axios';
import qs from 'qs';
import GitlabEvent from './GitlabEvent';
import GitlabProject from './GitlabProject';
import GitlabGroup from './GitlabGroup';
import IGitlabClient from './IGitlabClient';
import { GitlabMergeRequest } from './GitlabMergeRequest';
import { GitlabUser } from './GitlabUser';

export default class GitlabClient implements IGitlabClient {
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
        console.log(url);
        return await this.getWithAuth(url, params) as GitlabProject[];
    }

    public async getProjectById(id: string, params: any) : Promise<GitlabProject> {
        const url = `${this.baseUrl}projects/${id}`;
        console.log(url);
        return await this.getWithAuth(url, params) as GitlabProject;
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
        console.log(url);
        return (await this.getWithAuth(url, params)) as GitlabEvent[];
    }

    public async getProjectEvents(projectId: string | number, params: {[key: string]: string}): Promise<GitlabEvent[]> {
        const url = `${this.baseUrl}projects/${projectId}/events`;
        console.log(url);
        return await this.getWithAuth(url, params);
    }

    public async getUserGroups(params: {[key: string]: string}): Promise<GitlabGroup[]> {
        const url = `${this.baseUrl}groups`;
        console.log(url);
        return await this.getWithAuth(url, params);
    }

    public async getMergeRequests(params: {[key: string]: string}): Promise<GitlabMergeRequest[]> {
        const url = `${this.baseUrl}merge_requests`;
        console.log(url);
        return await this.getWithAuth(url, params);
    }

    public async getCurrentUser() {
        const url = `${this.baseUrl}user`;
        console.log(url);
        return await this.getWithAuth(url, {}) as GitlabUser;
    }

    public async getMergeRequestEventsForMyApproval(lastPollTimestamp: string, userId: number): Promise<GitlabEvent[]> {
        const lastPollTime = lastPollTimestamp ? new Date(lastPollTimestamp) : undefined;
        const mrs = await this.getMergeRequests({
            scope: "all",
            "approver_ids[]": userId.toString(),
            ...lastPollTime && {updated_after: lastPollTime?.toISOString()}
        });

        const events = await this.getCurrentUserEvents({
            ...lastPollTime && {after: `${lastPollTime.getFullYear()}-${lastPollTime.getMonth() + 1}-${lastPollTime.getDate()}`},
            target_type: 'merge_request'
        });

        const mrIds = new Set<number>(mrs.map(mr => mr.id));
        return events.filter(ev => mrIds.has(ev.target_id ?? 0));
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