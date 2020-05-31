export default class ChromeStorage {
    public static async getSync(keys: string[] | null): Promise<{[key: string]: any}> {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
        return Promise.resolve({});
    }

    public static async setSync(data: {[key: string]: any}) {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve({});
    }

    public static async removeSync(keys: string[]) {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.remove(keys, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve({});
    }

    public static async getLocal(keys: string[] | null): Promise<{[key: string]: any}> {
        if (chrome?.storage?.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
    return Promise.resolve({});
    }

    public static async setLocal(data: {[key: string]: any}) {
        if (chrome?.storage?.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve({});
    }

    public static async removeLocal(keys: string[]) {
        if (chrome?.storage?.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.remove(keys, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve({});
    }
}