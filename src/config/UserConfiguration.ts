export const defaultConfiguration: UserConfiguration = {
    gitlabHost: "https://gitlab.com",
    personalAccessToken: "",
    groups: [],
    options: {
        mergeRequestsCreatedByMe: true
    }
}

export interface UserConfiguration {
    gitlabHost: string
    personalAccessToken: string
    groups: string[]
    options: {
        mergeRequestsCreatedByMe: boolean
    }
}