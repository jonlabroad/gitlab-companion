import React from "react"
import Link from "@material-ui/core/Link"
import GitlabLink from "../../util/gitlab/GitlabLink"
import { UserConfiguration } from "../../config/UserConfiguration"
import { FlexRow } from "../util/FlexBox"
import styled from "styled-components"
import { Avatar } from "../Avatar"
import GitlabColors from "../../theme/GitlabColors"

const PathLink = styled(Link)`
    font-size: 12px;
`;

const ProjectAvatar = styled(Avatar)`
    width: 30px;
    height: 30px;
    margin-right: 5px;
`;

const AvatarPlaceholder = styled(FlexRow)`
    color: white;
    background-color: ${/*GitlabColors.neutral*/"#868686"};
    width: 30px;
    height: 30px;
    margin-right: 5px;

    border-radius: 3px;
`;

const ProjectPathContainer = styled(FlexRow)`
    margin-bottom: 5px;
`;

export interface ProjectPathProps {
    config: UserConfiguration
    imgSrc?: string | null
    path?: string
}

export const ProjectPath = (props: ProjectPathProps) => {
    return (
        <React.Fragment>
            <ProjectPathContainer alignItems="center">
            {props.imgSrc ?
                <ProjectAvatar imgSrc={props.imgSrc} /> :
                <AvatarPlaceholder justifyContent="center" alignItems="center">
                    {props.path ? props.path[(props.path?.lastIndexOf('/') ?? -1) + 1]?.toUpperCase() ?? '?' : '?'}
                </AvatarPlaceholder>}
                {props.path && <PathLink href={GitlabLink.projectLink(props.config, props.path)}>{props.path.replace(/\//g, ' / ')}</PathLink>}
            </ProjectPathContainer>
        </React.Fragment>
    );
}