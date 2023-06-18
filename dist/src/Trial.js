"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trial = void 0;
const crypto_1 = require("crypto");
const Logging_1 = require("./Logging");
const Blueprint_1 = require("./Blueprint");
// one of the main classes needed to do much of anything
class Trial {
    constructor(params) {
        // the length (in ticks) of the trial
        this.length = 3600;
        // How many logistic bots to populate into roboports by default
        this.initialBots = 150;
        // If true, the trial does no processing
        this.keepRaw = false;
        /*
        * The following are used to track the state of the trial itself as its running, BEFORE a Dataset is created
        * */
        this.startedAt = null;
        this.endedAt = null;
        if (params && params.bp) {
            if (params.bp instanceof Blueprint_1.Blueprint)
                this.bp = params.bp;
            else
                this.bp = new Blueprint_1.Blueprint(params.bp);
        }
        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = (0, crypto_1.randomUUID)();
        // set the other data we need as well about the trial
        if (params.length)
            this.length = params.length;
        if (params.itemInterval)
            this.itemInterval = params.itemInterval;
        if (params.elecInterval)
            this.elecInterval = params.elecInterval;
        if (params.circInterval)
            this.circInterval = params.circInterval;
        if (params.pollInterval)
            this.pollInterval = params.pollInterval;
        if (params.sysInterval)
            this.sysInterval = params.sysInterval;
        if (params.initialBots)
            this.initialBots = params.initialBots;
        if (params.raw)
            this.keepRaw = params.raw;
    }
    // Called by Factory when trial has completed, used to link TRIAL to a created DATA object
    linkData(data) {
        this.data = data;
        Logging_1.Logging.log('info', { message: `Linked results to ${this.id.substring(10)}...` });
    }
}
exports.Trial = Trial;
//# sourceMappingURL=Trial.js.map