import { GitlabAction } from "../service/GitlabEvent";
import styled from "styled-components";
import { actionTypeColors } from "../theme/ActionTypeColors";
import GitlabColors from "../theme/GitlabColors";
import React from "react";
import { FlexRow } from "./util/FlexBox";
import Chip from "@material-ui/core/Chip";

const ActionChip = styled(Chip)`
    color: white !important;
`;

export interface AlertActionNameProps {
    actionName: GitlabAction
    className?: string
}

export const AlertActionName = (props: AlertActionNameProps) => {
    return (
        <ActionChip
            className={props.className}
            style={{
                backgroundColor: actionTypeColors[props.actionName] ?? GitlabColors.neutral
            }}
            size="small"
            label={props.actionName}
        />
    );
}
