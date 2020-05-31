import React, { useEffect, useState } from "react"
import styled from "styled-components";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { UserConfiguration, defaultConfiguration } from "../../config/UserConfiguration";
import GitlabGroup from "../../service/GitlabGroup";
import { GroupSelector } from "./GroupSelector";
import ChromeStorage from "../../util/chrome/ChromeStorage";

const OptionsContainer = styled.div`
    width: 100%;
    max-width: 600px;
`;

const ElementContainer = styled.div`
    margin-bottom: 10px;
`;

const FormTextField = styled(TextField)`
    width: 100%;
`;

export const OptionsForm = () => {
    const [config, setConfig] = useState(undefined as UserConfiguration | undefined);
    const [updatingConfig, setUpdatingConfig] = useState(false);

    const saveConfig = (config: UserConfiguration) => {
        ChromeStorage.setSync({
            config
        });
    };

    useEffect(() => {
        async function getConfig() {
            const results = await ChromeStorage.getSync(['config']);
            let config = results.config as UserConfiguration | undefined;
            if (!config) {
                config = defaultConfiguration;
                saveConfig(config);
            }
            setConfig(config);
        }
        getConfig();
    }, []);

    const onConfigChange = (field: string, newValue: any) => {
        const newConfig = {
            ...config ?? {},
            [field]: newValue
        } as UserConfiguration;
        
        saveConfig(newConfig);
        setConfig(newConfig);

        if (!updatingConfig) {
            setUpdatingConfig(true);
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    type: "config_update"
                });
                setUpdatingConfig(false);
            }, 5000);
        }
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <OptionsContainer>
                <ElementContainer><Typography variant="h4">Options</Typography></ElementContainer>
                <ElementContainer><Typography variant="h5">Gitlab</Typography></ElementContainer>
                <ElementContainer>
                    <FormTextField
                        label={"Gitlab Host"}
                        value={config?.gitlabHost ?? ""}
                        onChange={(ev) => onConfigChange("gitlabHost", ev.target.value)}
                    />
                </ElementContainer>
                <ElementContainer>
                    <FormTextField
                        label={"Personal Access Token"}
                        type={"password"}
                        value={config?.personalAccessToken ?? ""}
                        helperText={"Gitlab Personal Access Token with read access to the Gitlab API"}
                        onChange={(ev) => onConfigChange("personalAccessToken", ev.target.value)}
                    />
                </ElementContainer>
                <ElementContainer><Typography variant="h5">Groups</Typography></ElementContainer>
                <ElementContainer><Typography variant="subtitle1">Select groups to watch</Typography>
                    <GroupSelector
                        config ={config}
                        onGroupsChange={(newGroups: string[]) => onConfigChange("groups", newGroups)}
                    />
                </ElementContainer>
            </OptionsContainer>
        </Box>
    );
}