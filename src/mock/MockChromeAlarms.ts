import IChromeAlarms, { AlarmType } from "../util/chrome/IChromeAlarms";

interface AlarmInfo {
    alarmHandle: any
    alarmDefinition: AlarmType
}

export default class MockChromeAlarms implements IChromeAlarms {
    protected alarms: {[key: string]: AlarmInfo} = {};
    protected onAlarm: ((alarm: AlarmType) => void)[] = [];

    addListener(callback: (alarm: AlarmType) => void): void {
        this.onAlarm.push(callback);
    }

    create(name: string, alarmInfo: AlarmType): void {
        if (this.hasAlarm(name)) {
            clearTimeout(this.getAlarm(name)!.alarmHandle);
        }
        this.createAlarm(name, alarmInfo);
    }

    async get(name: string): Promise<AlarmType | undefined> {
        return await Promise.resolve(this.getAlarm(name)?.alarmDefinition);
    }

    async getAll(): Promise<AlarmType[]> {
        return await Promise.resolve(Object.keys(this.alarms).map(key => this.alarms[key].alarmDefinition));
    }

    async clear(name: string): Promise<void> {
        const alarm = this.getAlarm(name);
        if (alarm) {
            clearTimeout(alarm.alarmHandle);
            delete this.alarms[name];
        }
        return await Promise.resolve()
    }

    async clearAll(): Promise<void> {
        Object.keys(this.alarms).forEach(key => {
            const alarm = this.getAlarm(key);
            if (alarm) {
                clearTimeout(alarm.alarmHandle);
            }
        });
        this.alarms = {};
        return Promise.resolve();
    }

    protected hasAlarm(name: string): boolean {
        return Object.keys(this.alarms).includes(name);
    }

    protected getAlarm(name: string): AlarmInfo | undefined {
        return this.alarms[name];
    }

    protected createAlarm(name: string, alarm: AlarmType): void {
        this.alarms[name] = {
            alarmDefinition: {
                ...alarm,
                name
            },
            alarmHandle: setInterval(() => this.triggerAlarm(name), (alarm.periodInMinutes ?? 1) * 60 * 1e3)
        };
        setTimeout(() => this.triggerAlarm(name), 0);
    }

    protected triggerAlarm(name: string) {
        const alarm = this.getAlarm(name);
        if (alarm) {
            this.onAlarm.forEach(func => func(alarm.alarmDefinition));
        }
    }

}
