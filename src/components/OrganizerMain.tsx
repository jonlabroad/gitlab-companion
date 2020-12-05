import React, { useState, useEffect, useRef } from "react"
import GitlabClient from "../service/GitlabClient"
import { defaultConfiguration, UserConfiguration } from "../config/UserConfiguration"
import GitlabEvent, { sortEvents } from "../service/GitlabEvent"
import { AlertPanel } from "./alert/AlertPanel"
import styled from "styled-components"
import GitlabProject from "../service/GitlabProject"
import { GroupSelector } from "./options/GroupSelector"
import { AppState } from "../state/AppState"
import MockGitlabClient from "../mock/MockGitlabClient"
import { ProjectInfo } from "../service/ProjectInfo"
import { GitlabMergeRequest } from "../service/GitlabMergeRequest"
import { MergeRequestsPanel } from "./mergeRequests/MergeRequestsPanel"
import MergeRequestProvider from "../data/MergeRequestProvider"
import EventsProvider from "../data/EventsProvider"
import InMemoryChromeStorage from "../util/chrome/InMemoryChromeStorage"
import ChromeStorage from "../util/chrome/ChromeStorage"
import AppBar from "@material-ui/core/AppBar"
import CircularProgress from "@material-ui/core/CircularProgress"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Typography from "@material-ui/core/Typography"
import ProjectProvider from "../data/ProjectProvider"
import RunUtil from "../util/RunUtil"

const ContentContainer  = styled.div`
    min-width: 700px;
`;

export interface OrganizerMainProps {

}

export const OrganizerMain = (props: OrganizerMainProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined as string | undefined);

    const [appState, setAppState] = useState(undefined as AppState | undefined);
    const [currentTab, setCurrentTab] = useState(0);

    const [userConfig, setUserConfig] = useState(defaultConfiguration);
    //const [currentEvents, setCurrentEvents] = useState([] as GitlabEvent[])
    const [mergeRequests, setMergeRequests] = useState([] as GitlabMergeRequest[]);

    const storage = useRef(chrome?.storage?.sync ? new ChromeStorage() : new InMemoryChromeStorage());
    const [localData, setLocalData] = useState({} as {[key: string]: any});
    const [syncData, setSyncData] = useState({} as {[key: string]: any});

    async function getProjectInfo(): Promise<ProjectInfo[]> {
        if (!chrome?.storage?.sync) {
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            const groupProjects = await client.getGroupProjects(defaultConfiguration.groups[0], {});
            const projectInfo = groupProjects.map(gp => ({
                ...gp,
                pollEvents: true
            } as ProjectInfo));

            const afterDate = new Date();
            afterDate.setDate(afterDate.getDate() - 5);
            const user = await client.getCurrentUser();
            const mrEvents = await client.getMergeRequestEventsForMyApproval(afterDate.toISOString(), user.id);
            const projectsById = (await Promise.all(mrEvents.map(mre => client.getProjectById(mre.project_id.toString(), {})))).map(p => ({
                ...p,
                pollEvents: false
            }) as ProjectInfo);
            //const client = new MockGitlabClient();
            //const groupProjects = await client.getGroupProjects("mock", {});
            return [...projectInfo, ...projectsById];
        } else {
            const result = await storage.current.getLocal(null);
            const projects = Object.keys(result).filter(key => key.startsWith('project.')).map(key => result[key]) as ProjectInfo[];
            return projects;
        }
    }

    const getEvents = async () => {
        let allEvents = [];
        if (!chrome?.storage?.local) {
            const storage = new InMemoryChromeStorage();
            const eventsProvider = new EventsProvider(defaultConfiguration, storage);
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            allEvents = await eventsProvider.getEvents(client, undefined);
        } else {
            const result = await storage.current.getLocal(null);
            allEvents = (result?.events ?? []) as GitlabEvent[];
        }
        return allEvents;
    };

    useEffect(() => {
        async function getUserConfig() {
            const result = await storage.current.getSync(["config"]);
            const config: UserConfiguration = result?.config;
            console.log({config});
            if (config) {
                setUserConfig(config);
            }
        }

        async function getStorageData() {
            const localStorage = await storage.current.getLocal(null);
            setLocalData(localStorage);
            const syncStorage = await storage.current.getSync(null);
            setSyncData(syncStorage);
        }

        getUserConfig();
        getStorageData();
    }, []);

    useEffect(() => {
        async function loadData() {
            if (chrome?.storage?.sync) {
                setLocalData(await storage.current.getLocal(null));
                setSyncData(await storage.current.getSync(null));
            } else {
                const projectProvider = new ProjectProvider(defaultConfiguration, storage.current);
                await projectProvider.getAllProjects();
                console.log(await storage.current.getLocal(null));
                const eventProvider = new EventsProvider(defaultConfiguration, storage.current);
                await eventProvider.getEvents(new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken));
                setLocalData(await storage.current.getLocal(null));
                setSyncData(await storage.current.getSync(null));
            }
        }

        loadData();

        // Clear badge on open
        if (!RunUtil.isLocalMode()) {
            if (chrome?.browserAction) {
                chrome.browserAction.setBadgeText({
                    text: ``
                });
            }
        }
    }, [userConfig]);

    console.log({
        localData
    })

    const currentEvents = localData["events"] ?? [];
    const projectData = Object.keys(localData).filter(key => key.startsWith("project.")).map(key => localData[key] as GitlabProject);

    return (
        <React.Fragment>
            {/*
            <GroupSelector config={userConfig} onGroupsChange={(groups: string[]) => setUserConfig({
                ...userConfig,
                groups
            })} />*/}
            <ContentContainer>
                <AppBar style={{
                    backgroundColor: "#2f2a6b",
                    color: "#dbdbf8"
                }} position="static">
                    <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
                        <Tab label="Notifications"/>
                        <Tab label="Merge Requests (Beta)"/>
                    </Tabs>
                </AppBar>
                <div hidden={currentTab !== 0}>
                    {isLoading && <CircularProgress />}
                    {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                    {(appState && appState?.errorMessages?.length > 0) && appState.errorMessages.map(msg => <Typography color="error">{msg}</Typography>)}
                    <AlertPanel
                        config={userConfig}
                        projects={projectData}
                        events={currentEvents}
                    />
                    {/*}
                    <ProjectSelector
                        config={userConfig}
                        groupProjects={groupProjects}
                    />
                        */}
                </div>
                <div hidden={currentTab !== 1}>
                    <MergeRequestsPanel
                        mergeRequests={mergeRequests}
                    />
                </div>
            </ContentContainer>
        </React.Fragment>
        )
}