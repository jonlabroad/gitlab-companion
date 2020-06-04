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
import { MergeRequestTitle } from "./MergeRequestTitle";

const TargetTitle = styled(MergeRequestTitle)`
    margin-bottom: 5px;
`;

export interface GenericMergeRequestEventProps {
    config: UserConfiguration
    project: GitlabProject
    event?: GitlabEvent
}

export const GenericMergeRequestEvent = (props: GenericMergeRequestEventProps) => {
    const {
        event,
        config,
        project
    } = props;

    if (!event || !project) {
        return null;
    }

    return (
        <React.Fragment>
            <FlexCol>
                <TargetTitle
                    config={config}
                    project={project}
                    event={event}
                />
            </FlexCol>
        </React.Fragment>
    );
}