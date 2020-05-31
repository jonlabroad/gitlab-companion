export const defaultConfiguration: UserConfiguration = {
    gitlabHost: "https://gitlab.com",
    personalAccessToken: "",
    groups: []
}

export interface UserConfiguration {
    gitlabHost: string
    personalAccessToken: string
    groups: string[]
}