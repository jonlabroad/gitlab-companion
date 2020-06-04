import GitlabEvent, { GitlabPushData } from "../../service/GitlabEvent";
import Link from "@material-ui/core/Link";
import React from "react";
import GitlabLink from "../../util/gitlab/GitlabLink";
import { UserConfiguration } from "../../config/UserConfiguration";
import Typography from "@material-ui/core/Typography";
import GitlabProject from "../../service/GitlabProject";

export const MergeRequestTitle = (props: {
    className?: string
    config: UserConfiguration
    project: GitlabProject
    event: GitlabEvent
}) => {
    const {
        className,
        config,
        project,
        event
    } = props;

    const refName = <Typography className={className}>{event.target_title}</Typography>

    let link = undefined;
    if (event.note) {
        link = GitlabLink.noteLink(config, project.path_with_namespace, event.note);
    } else if (event.target_type === "MergeRequest") {
        link = GitlabLink.mergeRequestLink(config, project.path_with_namespace, event.target_iid ?? 0);
    }

    return link ? (
        <Link
            href={link}
            target="_blank"
        >
            {refName}
        </Link>
    ) : refName
}