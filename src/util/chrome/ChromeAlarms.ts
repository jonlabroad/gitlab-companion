import IChromeAlarms, { AlarmType } from "./IChromeAlarms";

export default class ChromeAlarms implements IChromeAlarms {
    addListener(callback: (alarm: AlarmType) => void): void {
        chrome.alarms.onAlarm.addListener(callback);
    }
    public create(name: string, alarmInfo: Object): void {
        chrome.alarms.create(name, alarmInfo);
    }

    public async get(name: string): Promise<AlarmType> {
        return new Promise((resolve, reject) => {
            chrome.alarms.get(name, (alarm: AlarmType) => resolve(alarm))
        });
    }

    public async getAll(): Promise<AlarmType[]> {
        return new Promise((resolve, reject) => {
            chrome.alarms.getAll((alarms: AlarmType[]) => resolve(alarms));
        });
    }

    public async clear(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.alarms.clear(name, () => resolve());
        });
    }

    public async clearAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.alarms.clearAll(() => resolve());
        });
    }
}