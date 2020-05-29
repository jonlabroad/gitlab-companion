import React, { useEffect, useState } from "react"
import styled from "styled-components";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { UserConfiguration, defaultConfiguration } from "../../config/UserConfiguration";

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

    const saveConfig = (config: UserConfiguration) => {
        chrome.storage.sync.set({
            config
        });
    };

    useEffect(() => {
        chrome.storage.sync.get(['config'], function(results) {
            let config = results.config as UserConfiguration | undefined;
            if (!config) {
                config = defaultConfiguration;
                saveConfig(config);
            }

            setConfig(config);
        });
    }, []);

    const onConfigChange = (field: string, newValue: string) => {
        const newConfig = {
            ...config ?? {},
            [field]: newValue
        } as UserConfiguration;
        
        saveConfig(newConfig);
        setConfig(newConfig);
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <OptionsContainer>
                <ElementContainer><Typography variant="h4">Options</Typography></ElementContainer>
                <ElementContainer><Typography variant="h6">Gitlab</Typography></ElementContainer>
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
                        onChange={(ev) => onConfigChange("personalAccessToken", ev.target.value)}
                    />
                </ElementContainer>
            </OptionsContainer>
        </Box>
    );
}