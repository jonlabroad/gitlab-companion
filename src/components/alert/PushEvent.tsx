import GitlabEvent, { GitlabPushData } from "../../service/GitlabEvent";
import React from "react";
import { AlertActionName } from "../AlertActionName";
import Typography from "@material-ui/core/Typography";
import { AuthorAvatar } from "./AlertPanel";
import { FlexCol } from "../util/FlexBox";
import GitlabColors from "../../theme/GitlabColors";
import styled from "styled-components";

const EventRef = styled(Typography)`
    color: ${GitlabColors.neutral}
`;

const CommitTitle = styled(Typography)`

`;

export interface PushEventProps {
    event?: GitlabEvent
}

export const PushEvent = (props: PushEventProps) => {
    const {
        event
    } = props;

    if (!event) {
        return null;
    }

    return (
        <React.Fragment>
            <FlexCol>
                <EventRef>{event.push_data?.ref}</EventRef>
                <CommitTitle>{event.push_data?.commit_title}</CommitTitle>
            </FlexCol>
        </React.Fragment>
    );
}