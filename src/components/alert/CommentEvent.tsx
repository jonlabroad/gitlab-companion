import GitlabEvent, { GitlabPushData } from "../../service/GitlabEvent";
import React from "react";
import { AlertActionName } from "../AlertActionName";
import Typography from "@material-ui/core/Typography";
import { AuthorAvatar } from "./AlertPanel";
import { FlexCol } from "../util/FlexBox";
import GitlabColors from "../../theme/GitlabColors";
import styled from "styled-components";
import Card from "@material-ui/core/Card";
import ReactMarkdown from "react-markdown";

const CommentContainer = styled(Card)`
    padding-left: 10px;
    padding-right: 10px;
`;

const TargetTitle = styled(Typography)`
    font-weight: bold !important;
    margin-bottom: 5px;
`;

export interface CommentEventProps {
    className?: string
    event?: GitlabEvent
}

export const CommentEvent = (props: CommentEventProps) => {
    const {
        event
    } = props;

    if (!event || !event.note) {
        return null;
    }

    return (
        <React.Fragment>
            <FlexCol>
                <TargetTitle>{event.target_title}</TargetTitle>
                <CommentContainer>
                    <ReactMarkdown source={event.note.body} />
                </CommentContainer>
            </FlexCol>
        </React.Fragment>
    );
}