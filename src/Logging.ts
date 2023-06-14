import winston, {format} from "winston"
import path from "path";
import * as fs from "fs";

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

        // if (this.options.logging.includes('console'))
        //     cObj.transports.push(new (winston.transports.Console)({
        //         level: 'info',
        //     }));
        //
        // if (this.options.logging.includes('file'))
        //     cObj.transports.push(new winston.transports.File(
        //         {filename: 'error.log', level: 'info'}),
        //     )

        //if (this.options.logging.includes('grafana'))
        //cObj.transports.push(???)

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
