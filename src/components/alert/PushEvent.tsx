import GitlabEvent, { GitlabPushData } from "../../service/GitlabEvent";
import React from "react";
import { AlertActionName } from "../AlertActionName";
import Typography from "@material-ui/core/Typography";
import { AuthorAvatar } from "./AlertPanel";
import { FlexCol } from "../util/FlexBox";
import GitlabColors from "../../theme/GitlabColors";
import styled from "styled-components";
import { BranchName } from "./BranchName";
import GitlabProject from "../../service/GitlabProject";
import { UserConfiguration } from "../../config/UserConfiguration";
import { Commits } from "./Commits";

const EventRef = styled(BranchName)`
    color: ${GitlabColors.neutral};
`;

const CommitTitle = styled(Typography)`

`;

export interface PushEventProps {
    config: UserConfiguration
    project: GitlabProject
    event?: GitlabEvent
}

export const PushEvent = (props: PushEventProps) => {
    const {
        event,
        config,
        project
    } = props;

    if (!event || !project || !event.push_data) {
        return null;
    }

    return (
        <React.Fragment>
            <FlexCol>
                <EventRef
                    config={config}
                    project={project}
                    push_data={event.push_data}
                />
                <CommitTitle>{event.push_data.commit_title}</CommitTitle>
                <Commits
                    config={config}
                    project={project}
                    push_data={event.push_data}
                />
            </FlexCol>
        </React.Fragment>
    );
}