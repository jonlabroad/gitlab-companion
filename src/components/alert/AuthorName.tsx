import GitlabColors from "../../theme/GitlabColors";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";
import { GitlabAuthor } from "../../service/GitlabEvent";
import Link from "@material-ui/core/Link";
import React from "react";

export const AuthorNameStyled = styled(Typography)`
    color: ${GitlabColors.neutral};
    font-size: 0.75rem;

    margin-right: 10px;
`;

export const AuthorName = (props: {
    author: GitlabAuthor
}) => {
    return (
        <Link
            href={props.author.web_url}
            target={"_blank"}
        >
            <AuthorNameStyled>{props.author.name}</AuthorNameStyled>
        </Link>
    );
}