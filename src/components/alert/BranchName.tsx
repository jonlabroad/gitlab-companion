import { GitlabPushData } from "../../service/GitlabEvent";
import Link from "@material-ui/core/Link";
import React from "react";
import GitlabLink from "../../util/gitlab/GitlabLink";
import { UserConfiguration } from "../../config/UserConfiguration";
import Typography from "@material-ui/core/Typography";
import GitlabProject from "../../service/GitlabProject";

export const BranchName = (props: {
    className?: string
    config: UserConfiguration
    project: GitlabProject
    push_data: GitlabPushData
}) => {
    const pushType = props.push_data.action;
    const refName = <Typography className={props.className}>{props.push_data.ref}</Typography>

    return pushType !== "removed" ? (
        <Link
            href={GitlabLink.projectBranchLink(props.config, props.project?.path_with_namespace, props.push_data.ref)}
            target="_blank"
        >
            {refName}
        </Link>
    ) : refName
}