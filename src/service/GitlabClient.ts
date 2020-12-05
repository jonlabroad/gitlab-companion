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

    public async getAllGroupProjects(group: string, params: any): Promise<GitlabProject[]> {
        const allProjects: {[key: string]: GitlabProject} = {};
        let page = 1;
        let projects: GitlabProject[] = [];
        do {
            projects = await this.getGroupProjects(group, {
                ...params,
                per_page: "100",
                page: `${page}`,
            });
            projects.forEach(mr => allProjects[mr.id.toString()] = mr);
            page++;
        } while (projects.length > 0);
        return Object.keys(allProjects).map(key => allProjects[key])
    }

    public async getGroupProjects(group: string, params: any) : Promise<GitlabProject[]> {
        const url = `${this.baseUrl}groups/${encodeURIComponent(group)}/projects`;
        return await this.getWithAuth(url, params) as GitlabProject[];
    }

    public async getProjectById(id: string, params: any) : Promise<GitlabProject> {
        const url = `${this.baseUrl}projects/${id}`;
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
        return (await this.getWithAuth(url, params)) as GitlabEvent[];
    }

    public async getProjectEvents(projectId: string | number, params: {[key: string]: string}): Promise<GitlabEvent[]> {
        const url = `${this.baseUrl}projects/${projectId}/events`;
        return await this.getWithAuth(url, params);
    }

    public async getUserGroups(params: {[key: string]: string}): Promise<GitlabGroup[]> {
        const url = `${this.baseUrl}groups`;
        return await this.getWithAuth(url, params);
    }

    public async getGroup(groupId: string): Promise<GitlabGroup> {
        const url = `${this.baseUrl}groups/${encodeURIComponent(groupId)}`;
        return await this.getWithAuth(url, {});
    }

    public async getMergeRequests(params: {[key: string]: string}): Promise<GitlabMergeRequest[]> {
        const url = `${this.baseUrl}merge_requests`;
        return await this.getWithAuth(url, params);
    }

    public async getGroupMergeRequests(groupId: string, params: {[key: string]: string}): Promise<GitlabMergeRequest[]> {
        const url = `${this.baseUrl}groups/${encodeURIComponent(groupId)}/merge_requests`;
        return await this.getWithAuth(url, params);
    }

    public async getMergeRequestPages(params: {[key: string]: string}): Promise<GitlabMergeRequest[]> {
        const allMrs: {[key: string]: GitlabMergeRequest} = {};
        let page = 1;
        let mrs: GitlabMergeRequest[] = [];
        do {
            mrs = await this.getMergeRequests({
                ...params,
                page: `${page}`,
            });
            mrs.forEach(mr => allMrs[mr.id.toString()] = mr);
            page++;
        } while (mrs.length > 0);
        return Object.keys(allMrs).map(key => allMrs[key])
    }

    public async getGroupMergeRequestPages(groupId: string, params: {[key: string]: string}): Promise<GitlabMergeRequest[]> {
        const allMrs: {[key: string]: GitlabMergeRequest} = {};
        let page = 1;
        let mrs: GitlabMergeRequest[] = [];
        const group = await this.getGroup(groupId);
        if (!group) {
            return Promise.resolve([]);
        }

        do {
            mrs = await this.getGroupMergeRequests(group.id.toString(), {
                ...params,
                page: `${page}`
            });
            mrs.forEach(mr => allMrs[mr.id.toString()] = mr);
            page++;
        } while (mrs.length > 0);
        return Object.keys(allMrs).map(key => allMrs[key])
    }

    public async getCurrentUser() {
        const url = `${this.baseUrl}user`;
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