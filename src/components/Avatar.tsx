import React from "react";

export interface AvatarProps {
    className?: string
    imgSrc?: string
}

export const Avatar = (props: AvatarProps) => {
    return (
        props?.imgSrc ? <img className={props?.className} src={props?.imgSrc} /> : <div className={props?.className}></div>
    );
}