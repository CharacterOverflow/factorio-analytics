export declare class Logging {
    private static _innerLogger;
    static startLogger(transports: any[]): void;
    static stopLogger(): void;
    static log(level: string, obj: any): void;
    static debug(obj: any): void;
}
