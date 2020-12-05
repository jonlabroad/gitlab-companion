import React from "react"
import { GitlabMergeRequest } from "../../service/GitlabMergeRequest"
import Typography from "@material-ui/core/Typography";
import { FlexRow } from "../util/FlexBox";
import styled from "styled-components";
import Link from "@material-ui/core/Link";

const StateColumn = styled.div`
    margin-right: 30px;
    width: 100px;
`;

const TitleColumn = styled.div`
    margin-right: 30px;
    width: 400px;
`;

export interface MergeRequestsPanelProps {
    mergeRequests: GitlabMergeRequest[]
}

export const MergeRequestsPanel = (props: MergeRequestsPanelProps) => {
    return (
        <div>
            {props.mergeRequests.map(mergeRequest => {
                return (
                    <FlexRow>
                        <StateColumn>
                            <Typography>{mergeRequest.state}</Typography>
                        </StateColumn>
                        <TitleColumn>
                            <Link href={mergeRequest.web_url} target="_blank">
                                <Typography>{mergeRequest.title}</Typography>
                            </Link>
                        </TitleColumn>
                        <StateColumn>
                            <Typography>{mergeRequest.merge_status}</Typography>
                        </StateColumn>
                    </FlexRow>
                );
            })}
        </div>
    );
}