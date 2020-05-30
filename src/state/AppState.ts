export const createDefaultAppState = (): AppState => {
    const lastEventPollDate = new Date();
    lastEventPollDate.setDate(lastEventPollDate.getDate() - 3);
    return {
        lastEventPoll: lastEventPollDate.toISOString()
    }
}

export interface AppState {
    lastEventPoll: string
}