export interface AlarmType {
    name?: string
    when?: number
    scheduledTime?: number
    periodInMinutes?: number
    delayInMinutes?: number
}

export default interface IChromeAlarms {
    create(name: string, alarmInfo: AlarmType): void
    get(name: string): Promise<AlarmType | undefined>
    getAll(): Promise<AlarmType[]>
    clear(name: string): Promise<void>
    clearAll(): Promise<void>
    addListener(callback: (alarm: AlarmType) => void): void
}