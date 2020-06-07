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
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { WatchedGroups } from "./WatchedGroups";
import IconButton from "@material-ui/core/IconButton";
import GitlabColors from "../../theme/GitlabColors";
import Divider from "@material-ui/core/Divider";

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

const FilterTextField = styled(TextField)`
    margin-bottom: 16px;
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
        <Box display="flex" flexDirection="row" alignItems="center">
            {!isGroupSelected && (
            <IconButton
                style={{color: GitlabColors.add}}
                onClick={onClick}
            >
                <AddCircleIcon />
            </IconButton>
            )}
            {isGroupSelected && (
            <IconButton
                style={{color: GitlabColors.delete}}
                onClick={onClick}
            >
                <RemoveCircleIcon />
            </IconButton>
            )}
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
    );
}

export interface GroupSelectorSelectedGroupRowProps {
    group: string
    onClick: () => void
}

export const GroupSelectorSelectedGroupRow = (props: GroupSelectorSelectedGroupRowProps) => {
    const {
        group,
        onClick
    } = props;

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <IconButton
                style={{color: GitlabColors.delete}}
                onClick={onClick}
            >
                <RemoveCircleIcon />
            </IconButton>
            <AvatarPlaceholder justifyContent="center" alignItems="center">
                {group[0].toUpperCase() ?? '?'}
            </AvatarPlaceholder>
            <GroupSelectorRowPath>
                <Typography>{group}</Typography>
            </GroupSelectorRowPath>
        </Box>
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
            setGroups(groups.sort(compareGroups) ?? []);
        }
    }

    const compareGroups = (a: GitlabGroup, b: GitlabGroup) => {
        return b.name.localeCompare(a.name);
    }

    const onGroupSelect = (groupFullPath: string) => {
        const newGroups = [...props.config?.groups ?? []];
        const isGroupSelected = newGroups.includes(groupFullPath);
        if (isGroupSelected) {
            newGroups.splice(newGroups.findIndex(gPath => gPath === groupFullPath), 1);
        } else {
            newGroups.push(groupFullPath);
        }
        props.onGroupsChange(newGroups);
    }

    return (
        <React.Fragment>
            <Box display="flex" flexDirection="column">
                <FilterTextField
                    label="filter"
                    value={searchTerm}
                    onChange={(ev: any) => {
                        currentSearchTerm.current = ev.target.value;
                        setSearchTerm(ev.target.value);
                    }}
                />
                {isLoading && <CircularProgress />}
                {props.config?.groups?.map(group => {
                    return (
                        <GroupSelectorSelectedGroupRow
                            group={group}
                            onClick={() => onGroupSelect(group)}
                        />
                    );
                })}
                {(props.config?.groups ?? []).length > 0 && <Divider />}
                {groups.filter(g => !props.config?.groups?.includes(g.full_path)).map(group => {
                    return (
                        <GroupSelectorGroupRow
                            selectedGroups={props.config?.groups ?? []}
                            group={group}
                            onClick={() => onGroupSelect(group.full_path)}
                        />
                    );
                })}
            </Box>
        </React.Fragment>
    );
}
