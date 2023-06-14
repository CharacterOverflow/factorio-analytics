import winston, {format} from "winston"

// Central static method for logging, so that I don't need to import the logger everywhere, and I can change the logger implementation later if I want to.
export class Logging {
    private static _innerLogger: winston.Logger;

    static startLogger(transports: any[]) {
        let cObj = {
            level: 'info',
            format: format.combine(
                format.align(),
                format.timestamp(),
                format.json(),
            ),
            //defaultMeta: { service: 'user-service' },
            exitOnError: false,
            transports: transports
        };

        this._innerLogger = winston.createLogger(cObj);
    }

    // populate 'message' on obj first!!! message field is what gets used
    static log(level: string, obj: any) {
        this._innerLogger.log(level, obj);
    }

    // Debug view shorthand - easy to add and use, then comment out when done
    static debug(obj: any) {
        this._innerLogger.debug(obj);
    }

}
