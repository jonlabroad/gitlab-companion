import React from "react";
import GitlabEvent, { GitlabPushData } from "../../service/GitlabEvent";
import Link from "@material-ui/core/Link";
import { UserConfiguration } from "../../config/UserConfiguration";
import GitlabLink from "../../util/gitlab/GitlabLink";
import GitlabProject from "../../service/GitlabProject";
import Typography from "@material-ui/core/Typography";

export const Commits = (props: {
    className?: string
    config: UserConfiguration
    project: GitlabProject
    push_data: GitlabPushData
}) => {

    if (props.push_data.commit_count <= 0) {
        return null;
    }

    return (
        <Link
            href={GitlabLink.commitsLink(props.config, props.project?.path_with_namespace, props.push_data)}
            target="_blank"
        >
            <Typography className={props.className}>{`${props.push_data.commit_count} commit${props.push_data.commit_count > 1 ? 's' : ''}`}</Typography>
        </Link>
    );
}