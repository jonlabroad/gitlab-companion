export const defaultConfiguration: UserConfiguration = {
    gitlabHost: "https://gitlab.com",
    personalAccessToken: "",
    groups: [
        "vistaprint-org/merchandising-technology/hamilton"
    ]
}

export interface UserConfiguration {
    gitlabHost: string
    personalAccessToken: string
    groups: string[]
}