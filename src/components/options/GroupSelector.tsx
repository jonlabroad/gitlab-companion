import React, { useState, useEffect, useRef } from "react"
import GitlabGroup from "../../service/GitlabGroup"
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import GitlabClient from "../../service/GitlabClient";
import { UserConfiguration } from "../../config/UserConfiguration";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import styled from "styled-components";
import { Avatar } from "../Avatar";
import { FlexRow } from "../util/FlexBox";

const GroupSelectorRowPath = styled.div`

`;

export const GroupAvatar = styled(Avatar)`
    margin-right: 8px;
    max-height: 30px;
    max-width: 30px;
`;

const AvatarPlaceholder = styled(FlexRow)`
    color: white;
    background-color: ${/*GitlabColors.neutral*/"#868686"};
    width: 30px;
    height: 30px;
    margin-right: 5px;

    border-radius: 3px;
`;

export interface GroupSelectorGroupRowProps {
    selectedGroups: string[]
    group: GitlabGroup
    onClick: () => void
}

export const GroupSelectorGroupRow = (props: GroupSelectorGroupRowProps) => {
    const {
        group,
        selectedGroups,
        onClick
    } = props;

    const isGroupSelected = selectedGroups.includes(group.full_path);

    return (
        <Card>
            <Box display="flex" flexDirection="row" alignItems="center">
                <Checkbox 
                    checked={isGroupSelected}
                    onClick={onClick}
                />
                {group.avatar_url ?
                    <GroupAvatar imgSrc={group.avatar_url}/> :
                    <AvatarPlaceholder justifyContent="center" alignItems="center">
                        {group.name[0].toUpperCase() ?? '?'}
                    </AvatarPlaceholder>
                }
                <GroupSelectorRowPath>
                    <Typography>{group.full_name}</Typography>
                </GroupSelectorRowPath>
            </Box>
        </Card>
    );
}

export interface GroupSelectorProps {
    config?: UserConfiguration

    onGroupsChange: (groups: string[]) => void
}

export const GroupSelector = (props: GroupSelectorProps) => {
    const { config } = props;

    const currentSearchTerm = useRef("");
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingGroups, setUpdatingGroups] = useState(false);
    const [groups, setGroups] = useState([] as GitlabGroup[]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        refreshGroups().then(() => setIsLoading(false));
    }, [config])

    useEffect(() => {
        setUpdatingGroups(true);
        setIsLoading(true);
        setTimeout(() => {
            if (searchTerm === currentSearchTerm.current) {
                refreshGroups().then(() => setIsLoading(false));
                setUpdatingGroups(false);
            }
        }, 500);
    }, [searchTerm])

    const refreshGroups = async () => {
        if (config && config.personalAccessToken && config.gitlabHost) {
            const client = new GitlabClient(config.gitlabHost, config.personalAccessToken);
            const groups = await client.getUserGroups({
                search: currentSearchTerm.current
            });
            setGroups(groups ?? []);
        }
    }

    return (
        <React.Fragment>
            <Box display="flex" flexDirection="column">
                <TextField
                    label="filter"
                    value={searchTerm}
                    onChange={(ev: any) => {
                        currentSearchTerm.current = ev.target.value;
                        setSearchTerm(ev.target.value);
                    }}
                />
                {isLoading && <CircularProgress />}
                {groups.map(group => {
                    return <GroupSelectorGroupRow selectedGroups={props.config?.groups ?? []} group={group} onClick={() => {
                        const newGroups = [...props.config?.groups ?? []];
                        const isGroupSelected = newGroups.includes(group.full_path);
                        if (isGroupSelected) {
                            newGroups.splice(newGroups.findIndex(gPath => gPath === group.full_path), 1);
                        } else {
                            newGroups.push(group.full_path);
                        }
                        props.onGroupsChange(newGroups);
                    }}/>
                })}
            </Box>
        </React.Fragment>
    );
}
