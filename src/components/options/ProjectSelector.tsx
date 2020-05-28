import React from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { Avatar } from "../Avatar";
import styled from "styled-components";
import TableBody from "@material-ui/core/TableBody";
import { FlexRow } from "../util/FlexBox";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { UserConfiguration } from "../../config/UserConfiguration";
import GitlabLink from "../../util/gitlab/GitlabLink";
import GitlabProject from "../../service/GitlabProject";

const rowHeight = 50;

const ProjectGroupElement = styled(FlexRow)`
    padding-right: 8px;
`;

const ProjectAvatar = styled(Avatar)`
    height: ${rowHeight}px;
    width: ${rowHeight}px;
`;

const ProjectName = styled(Typography)`
    font-weight: bold;
    font-size: 14px;
`;

export interface ProjectSelectorProps {
    config: UserConfiguration
    groupProjects: GitlabProject[]
}

export const ProjectSelector = (props: ProjectSelectorProps) => {
    const {
        groupProjects,
        config
    } = props

    return (
        <TableContainer>
            <Table size="small">
                <TableBody>
                    {groupProjects.map(p => (
                        <TableRow key={p?.id}>
                            <TableCell padding="none">
                                <Link target="_blank" color="textPrimary" underline="hover" href={GitlabLink.projectLink(config, p.path_with_namespace)}>
                                    <FlexRow alignItems="center">
                                        <ProjectGroupElement>
                                            <ProjectAvatar imgSrc={p.avatar_url ?? undefined} />
                                        </ProjectGroupElement>
                                        <ProjectGroupElement>
                                            <ProjectName>{p?.name}</ProjectName>
                                        </ProjectGroupElement>
                                    </FlexRow>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}