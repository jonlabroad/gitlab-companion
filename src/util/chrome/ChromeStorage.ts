export default class ChromeStorage {
    public static async getSync(keys: string[] | null): Promise<{[key: string]: any}> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (result: {[key: string]: any}) => {
                resolve(result);
            })
        });
    }

    public static async setSync(data: {[key: string]: any}) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(data, () => {
                resolve();
            })
        });
    }

    public static async removeSync(keys: string[]) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.remove(keys, () => {
                resolve();
            })
        });
    }

    public static async getLocal(keys: string[] | null): Promise<{[key: string]: any}> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result: {[key: string]: any}) => {
                resolve(result);
            })
        });
    }

    public static async setLocal(data: {[key: string]: any}) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(data, () => {
                resolve();
            })
        });
    }

    public static async removeLocal(keys: string[]) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            })
        });
    }
}