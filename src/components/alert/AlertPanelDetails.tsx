import React from "react"
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import GitlabEvent from "../../service/GitlabEvent";
import { Avatar } from "../Avatar";
import styled from "styled-components";
import { FlexRow, FlexCol } from "../util/FlexBox";
import { AlertActionName } from "../AlertActionName";
import { PushEvent } from "./PushEvent";
import { UserConfiguration } from "../../config/UserConfiguration";
import { ProjectPath } from "./ProjectPath";
import GitlabUtil from "../../util/gitlab/GitlabUtil";
import GitlabColors from "../../theme/GitlabColors";
import { CommentEvent } from "./CommentEvent";
import GitlabProject from "../../service/GitlabProject";

export interface AlertPanelDetailsProps {
    className?: string
    config: UserConfiguration
    project: GitlabProject
    event: GitlabEvent
}

export const AlertPanelDetails = (props: AlertPanelDetailsProps) => {
    const {
        config,
        event,
        project
    } = props;

    let comp = (
        <React.Fragment>
            <Typography>{event.target_title}</Typography>
        </React.Fragment>
    );
    if (event.push_data) {
        comp = <React.Fragment>
            <PushEvent event={event}/>
        </React.Fragment>
    }

    if (event.note) {
        comp = <CommentEvent
            event={event}
        />
    }

    return comp;
}