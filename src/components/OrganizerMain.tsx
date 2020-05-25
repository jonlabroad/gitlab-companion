import React, { useState, useEffect } from "react"
import GitlabClient from "../service/GitlabClient"
import { defaultConfiguration } from "../config/UserConfiguration"
import { groupProjects } from "../service/__generated__/groupProjects"
import { ProjectSelector } from "./options/ProjectSelector"
import GitlabEvent, { sortEvents } from "../service/GitlabEvent"
import { AlertPanel } from "./alert/AlertPanel"
import GitlabUtil from "../util/gitlab/GitlabUtil"
import styled from "styled-components"

export interface OrganizerMainProps {

}

export const OrganizerMain = (props: OrganizerMainProps) => {
    const [userConfig, setUserConfig] = useState(defaultConfiguration);
    const [currentEvents, setCurrentEvents] = useState([] as GitlabEvent[])
    const [groupProjects, setGroupProjects] = useState(undefined as groupProjects | undefined);

    const getProjects = (callback: (groupProjects: any) => void) => {
        if (!chrome?.storage?.sync) {
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            defaultConfiguration.groups.forEach(group => {
                client.getGroupProjects(defaultConfiguration.groups[0]).then(groupProjects => {
                    callback(groupProjects);
                });
            })
            
        } else {
            chrome.storage.sync.get(null, function(result) {
                const gp = {
                    group: {
                        projects: {
                            nodes: Object.keys(result).filter(key => key.startsWith('project.')).map(key => result[key])
                        }
                    }
                };
                callback(gp);
            });
        }
    };

    const getEvents = (groupProjects: groupProjects, callback: (events: GitlabEvent[]) => void) => {
        if (!chrome?.storage?.local) {
            const client = new GitlabClient(defaultConfiguration.gitlabHost, defaultConfiguration.personalAccessToken);
            Promise.all(
                (groupProjects?.group?.projects?.nodes ?? []).map(async project => {
                    const afterDate = new Date();
                    afterDate.setDate(afterDate.getDate() - 5);
                    return await client.getProjectEvents(GitlabUtil.parseId(project?.id ?? ""), {
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
            setGroupProjects(gp as groupProjects);
            getEvents(gp, events => setCurrentEvents(sortEvents(events)));
        });
    }, []);

    return (
        <React.Fragment>
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
        </React.Fragment>
        )
}