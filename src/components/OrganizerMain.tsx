import React, { useState, useEffect } from "react"
import GitlabClient from "../service/GitlabClient"
import { defaultConfiguration } from "../config/UserConfiguration"
import { ProjectSelector } from "./options/ProjectSelector"
import GitlabEvent, { sortEvents } from "../service/GitlabEvent"
import { AlertPanel } from "./alert/AlertPanel"
import GitlabUtil from "../util/gitlab/GitlabUtil"
import styled from "styled-components"
import GitlabProject from "../service/GitlabProject"
import { GroupSelector } from "./options/GroupSelector"
import ChromeStorage from "../util/chrome/ChromeStorage"
import { CircularProgress, Typography } from "@material-ui/core"
import { AppState } from "../state/AppState"
import MockGitlabClient from "../mock/MockGitlabClient"
import { ProjectInfo } from "../service/ProjectInfo"

const ContentContainer  = styled.div`
    min-width: 700px;
`;

export interface OrganizerMainProps {

}

export const OrganizerMain = (props: OrganizerMainProps) => {
    const [userConfig, setUserConfig] = useState(defaultConfiguration);
    const [currentEvents, setCurrentEvents] = useState([] as GitlabEvent[])
    const [projectInfo, setProjectInfo] = useState([] as ProjectInfo[]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined as string | undefined);
    const [appState, setAppState] = useState(undefined as AppState | undefined);

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
            const storage = new ChromeStorage();
            const result = await storage.getLocal(null);
            const projects = Object.keys(result).filter(key => key.startsWith('project.')).map(key => result[key]) as ProjectInfo[];
            return projects;
        }
    }

    const getEvents = async (projects: ProjectInfo[], callback: (events: GitlabEvent[]) => void) => {
        if (!chrome?.storage?.local) {
            //const client = new MockGitlabClient();
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            const user = await client.getCurrentUser();
            const afterDate = new Date();
            afterDate.setDate(afterDate.getDate() - 5);
            const allEvents = (await Promise.all(
                projects.filter(proj => proj.pollEvents).map(async project => {
                    return await client.getProjectEvents(project.id.toString(), {
                        after: `${afterDate.getFullYear()}-${afterDate.getMonth() + 1}-${afterDate.getDate()}`
                    });
                })
            )).flat();

            const mrEvents = await client.getMergeRequestEventsForMyApproval(afterDate.toISOString(), user.id);
            console.log(mrEvents);
            //callback([...allEvents, ...mrEvents]);
            callback(mrEvents);
        } else {
            const storage = new ChromeStorage();
            const result = await storage.getLocal(null);
            const events = (result?.events ?? []) as GitlabEvent[];
            callback(events);
        }
    };

    useEffect(() => {
        async function getProjects() {
            setIsLoading(true);
            try {
                const projects = await getProjectInfo();
                setProjectInfo(projects);
                await getEvents(projects, events => setCurrentEvents(sortEvents(events)));
                setErrorMessage(undefined);
            } catch (err) {
                console.error(`Error loading projects and events`, err);
                setErrorMessage(err.toString());
            }
            setIsLoading(false);
        }

        async function getAppState() {
            const storage = new ChromeStorage();
            const result = await storage.getLocal(['appState']);
            setAppState(result?.appState);
        }

        getProjects();
        getAppState();
        
        // Clear badge on open
        if (chrome?.browserAction) {
            chrome.browserAction.setBadgeText({
                text: ``
            });
        }
    }, []);

    return (
        <React.Fragment>
            {/*
            <GroupSelector config={userConfig} onGroupsChange={(groups: string[]) => setUserConfig({
                ...userConfig,
                groups
            })} />*/}
            <ContentContainer>
                {isLoading && <CircularProgress />}
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                {(appState && appState?.errorMessages?.length > 0) && appState.errorMessages.map(msg => <Typography color="error">{msg}</Typography>)}
                <AlertPanel
                    config={userConfig}
                    projects={projectInfo}
                    events={currentEvents}
                />
                {/*}
                <ProjectSelector
                    config={userConfig}
                    groupProjects={groupProjects}
                />
                    */}
            </ContentContainer>
        </React.Fragment>
        )
}