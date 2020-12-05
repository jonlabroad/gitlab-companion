import React from "react"
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import GitlabEvent from "../../service/GitlabEvent";
import { Avatar } from "../Avatar";
import styled from "styled-components";
import { FlexRow, FlexCol } from "../util/FlexBox";
import { AlertActionName } from "../AlertActionName";
import { UserConfiguration } from "../../config/UserConfiguration";
import { ProjectPath } from "./ProjectPath";
import GitlabUtil from "../../util/gitlab/GitlabUtil";
import GitlabColors from "../../theme/GitlabColors";
import { AlertPanelDetails } from "./AlertPanelDetails";
import GitlabProject from "../../service/GitlabProject";
import { AuthorName } from "./AuthorName";
import Link from "@material-ui/core/Link";

const rowHeight = 50;

export const AuthorAvatar = styled(Avatar)`
    margin-right: 8px;

    border-radius: 25px;
    max-height: ${rowHeight}px;
    max-width: ${rowHeight}px;
`;



const AlertPanelContainer = styled.div`
    background-color: #fafafa;
`;

const AlertCard = styled(Card)`
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 7px;
    margin-bottom: 7px;

    padding-bottom: 8px;
    padding-top: 8px;
    padding-right: 5px;
    padding-left: 5px;
`;

const ActionAndAuthorCol = styled(FlexCol)`
    width: 100px;
    margin-right: 5px;
`;

const AlertActionNameStyled = styled(AlertActionName)`
    margin-bottom: 3px;
`;

const AlertDateTime = styled(Typography)`
    color: ${GitlabColors.neutral};
`;

const EventAlert = (props: {className?: string, config: UserConfiguration, project: GitlabProject, ev: GitlabEvent}) => {
    const {
        config,
        project,
        ev
    } = props;

    let comp = <React.Fragment>
        <FlexRow>
            <Link href={ev.author.web_url} target="_blank">
                <AuthorAvatar imgSrc={ev.author.avatar_url} />
            </Link>
            <FlexCol>
                <FlexRow alignContent="center">
                    <ActionAndAuthorCol>
                        <AlertActionNameStyled actionName={ev.action_name}/>
                        <AuthorName author={ev.author}/>
                    <AlertDateTime>{new Date(ev.created_at).toLocaleString()}</AlertDateTime>
                    </ActionAndAuthorCol>
                    <FlexCol>
                        <ProjectPath config={config} imgSrc={project?.avatar_url} path={project?.path_with_namespace}/>
                        <AlertPanelDetails
                            config={config}
                            project={project}
                            event={ev}
                        />
                    </FlexCol>
                </FlexRow>
            </FlexCol>
        </FlexRow>
    </React.Fragment>

    return comp;
}

export interface AlertPanelProps {
    config: UserConfiguration
    projects: GitlabProject[]
    events: GitlabEvent[]
}

export const AlertPanel = (props: AlertPanelProps) => {
    const {
        config,
        events = [],
        projects
    } = props;

    const projectsMapped: Record<string, GitlabProject> = {};
    projects.forEach(project => projectsMapped[project.id] = project);

    return (
        <AlertPanelContainer>
            {events.slice(0, 39).map(ev => (
                <AlertCard>
                    <FlexRow alignItems="center">
                        <EventAlert config={config} project={projectsMapped[ev!.project_id.toString()]} ev={ev} />
                    </FlexRow>
                </AlertCard>
            ))}
        </AlertPanelContainer>
    );
}