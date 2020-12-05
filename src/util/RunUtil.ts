export default class RunUtil {
    public static isLocalMode() {
        return (typeof process !== 'undefined') && (process?.env?.RUN_LOCAL?.toLowerCase() === 'true' ?? false);
    }
}