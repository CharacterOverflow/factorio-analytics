"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trial = void 0;
const crypto_1 = require("crypto");
const TrialSource_1 = require("./TrialSource");
// one of the main classes needed to do much of anything
class Trial {
    // filename results - generated from flags of which data to poll + id
    get dataFiles() {
        if (this.metadata)
            return {
                items: this.recordItems ? `${this.id}_item.jsonl` : undefined,
                electric: this.recordElectric ? `${this.id}_elec.jsonl` : undefined,
                circuits: this.recordCircuits ? `${this.id}_circ.jsonl` : undefined,
                pollution: this.recordPollution ? `${this.id}_poll.jsonl` : undefined,
            };
        else
            return undefined;
    }
    constructor(params) {
        // current stage of the trial
        this.stage = 'new';
        // the length (in ticks) of the trial
        this.length = 3600;
        // how often to poll data, by category. This is 'every X ticks, poll data'. Defaults to 300, meaning every 5 seconds
        this.tickInterval = 300;
        // How many logistic bots to populate into roboports by default
        this.initialBots = 150;
        // Boolean flags for each 'data' category, used to determine which data to record
        this.recordItems = true;
        this.recordElectric = false; // electric needs to be looked at for accuracy
        this.recordCircuits = true;
        this.recordPollution = true;
        this.recordSystem = false;
        /*
        * The following are used to track the state of the trial itself as its running, BEFORE a Dataset is created
        *
        * If these variables are set (along  with textResult), then the trial is considered complete and can be analyzed
        *
        * Once a trial has been run, it MUST be analyzed before being run again if you wish to do so
        *
        * Running a trial again without analyzing will clear the variables below
        *
        * */
        this.startedRunAt = null;
        this.startedAt = null;
        this.endedAt = null;
        // text result of trial - logs and/or system data
        this.textLogs = null;
        // text result (raw) system data
        this.rawSystemText = null;
        // metadata from execution
        this.metadata = null;
        // we allow no-param construction of any class - this helps with ORMs and type casting
        if (!params)
            return;
        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = (0, crypto_1.randomUUID)();
        // If our source is a string, we need to create the source object automatically
        if (params.source && typeof params.source == 'string') {
            if (params.source.endsWith('.zip')) {
                // create save source
                this.source = new TrialSource_1.SourceSaveGame(params.source);
            }
            else {
                // create blueprint source
                this.source = new TrialSource_1.SourceBlueprint(params.source);
            }
        }
        else {
            // otherwise, we assume its already a source object
            this.source = params.source.type == 'blueprint' ? params.source : params.source;
        }
        // set the other data we need as well about the trial
        if (params.length)
            this.length = params.length;
        if (params.tickInterval)
            this.tickInterval = params.tickInterval;
        if (params.initialBots)
            this.initialBots = params.initialBots;
        if (params.recordItems)
            this.recordItems = params.recordItems;
        if (params.recordElectric)
            this.recordElectric = params.recordElectric;
        if (params.recordCircuits)
            this.recordCircuits = params.recordCircuits;
        if (params.recordPollution)
            this.recordPollution = params.recordPollution;
        if (params.recordSystem)
            this.recordSystem = params.recordSystem;
    }
    get ready() {
        return this.source.hashFinished;
    }
    setStage(stage) {
        this.stage = stage;
    }
}
exports.Trial = Trial;
//# sourceMappingURL=Trial.js.map