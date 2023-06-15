"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logging = void 0;
const winston_1 = __importStar(require("winston"));
// Central static method for logging, so that I don't need to import the logger everywhere, and I can change the logger implementation later if I want to.
class Logging {
    static startLogger(transports) {
        let cObj = {
            level: 'info',
            format: winston_1.format.combine(winston_1.format.align(), winston_1.format.timestamp(), winston_1.format.json()),
            //defaultMeta: { service: 'user-service' },
            exitOnError: false,
            transports: transports
        };
        this._innerLogger = winston_1.default.createLogger(cObj);
    }
    // populate 'message' on obj first!!! message field is what gets used
    static log(level, obj) {
        this._innerLogger.log(level, obj);
    }
    // Debug view shorthand - easy to add and use, then comment out when done
    static debug(obj) {
        this._innerLogger.debug(obj);
    }
}
exports.Logging = Logging;
//# sourceMappingURL=Logging.js.map