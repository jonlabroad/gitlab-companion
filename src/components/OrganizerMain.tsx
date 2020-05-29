import React, { useState, useEffect } from "react"
import GitlabClient from "../service/GitlabClient"
import { defaultConfiguration } from "../config/UserConfiguration"
import { ProjectSelector } from "./options/ProjectSelector"
import GitlabEvent, { sortEvents } from "../service/GitlabEvent"
import { AlertPanel } from "./alert/AlertPanel"
import GitlabUtil from "../util/gitlab/GitlabUtil"
import styled from "styled-components"
import GitlabProject from "../service/GitlabProject"

const ContentContainer  = styled.div`
    min-width: 700px;
`;

export interface OrganizerMainProps {

}

export const OrganizerMain = (props: OrganizerMainProps) => {
    const [userConfig, setUserConfig] = useState(defaultConfiguration);
    const [currentEvents, setCurrentEvents] = useState([] as GitlabEvent[])
    const [groupProjects, setGroupProjects] = useState([] as GitlabProject[]);

    const getProjects = (callback: (groupProjects: any) => void) => {
        if (!chrome?.storage?.sync) {
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            defaultConfiguration.groups.forEach(group => {
                client.getGroupProjects(defaultConfiguration.groups[0], {}).then(groupProjects => {
                    callback(groupProjects);
                });
            })
            
        } else {
            chrome.storage.sync.get(null, function(result) {
                const projects = Object.keys(result).filter(key => key.startsWith('project.')).map(key => result[key]);
                callback(projects);
            });
        }
    };

    const getEvents = (groupProjects: GitlabProject[], callback: (events: GitlabEvent[]) => void) => {
        if (!chrome?.storage?.local) {
            console.log("LOCAL MODE");
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            Promise.all(
                groupProjects.map(async project => {
                    const afterDate = new Date();
                    afterDate.setDate(afterDate.getDate() - 5);
                    return await client.getProjectEvents(project.id, {
                        after: `${afterDate.getFullYear()}-${afterDate.getMonth()}-${afterDate.getDate()}`
                    });
                })
            ).then(allEvents => callback(allEvents.flat()));
        } else {
            chrome.storage.local.get(null, function(result) {
                console.log({events: result?.events})
                const events = (result?.events ?? []) as GitlabEvent[];
                callback(events);
            });
        }
    };

    useEffect(() => {
        getProjects(function(gp) {
            console.log(gp);
            setGroupProjects(gp as GitlabProject[]);
            getEvents(gp, events => setCurrentEvents(sortEvents(events)));
        });
    }, []);

    console.log("RENDAH");

    return (
        <React.Fragment>
            <ContentContainer>
                <AlertPanel
                    config={userConfig}
                    projects={groupProjects}
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