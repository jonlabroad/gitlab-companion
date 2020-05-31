export const createDefaultAppState = (): AppState => {
    const lastEventPollDate = new Date();
    lastEventPollDate.setDate(lastEventPollDate.getDate() - 3);
    return {
        lastEventPoll: lastEventPollDate.toISOString(),
        errorMessages: []
    }
}

export interface AppState {
    lastEventPoll: string
    errorMessages: string[]
}