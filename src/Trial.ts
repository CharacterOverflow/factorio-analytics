/*
* This class represents a single 'trial' we intend to run, which is a single execution of the factorio executable
* The trial itself does not care about the blueprint string or any other BS before this. It only cares to organize data
* */

import {randomUUID} from "crypto";
import {Logging} from "./Logging";
import {Dataset} from "./Dataset";
import {Blueprint} from "./Blueprint";

export interface ITrialParams {

    // Either a reference to the blueprint object, or a blueprint string itself to run
    bp?: Blueprint | string;

    // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
    length?: number;

    // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
    itemInterval?: number;

    // how many ticks between elec data polls (The power usage and production of the factory, per network)
    elecInterval?: number;

    // how many ticks between circ data polls (Each circuit network, and the signals on it)
    circInterval?: number;

    // how many ticks between Pollution data polls (The pollution of the factory, total)
    pollInterval?: number;

    // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
    sysInterval?: number;

    // how many logistic bots to start roboports with. If left as is, none will be placed
    initialBots?: number;

    // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
    raw?: boolean;
}

// one of the main classes needed to do much of anything
export class Trial {

    // Generated UUID for this trial to be unique
    id: string;

    // Blueprint string itself to test
    bp: Blueprint

    // the length (in ticks) of the trial
    length?: number = 3600

    // how often to poll data, by category. This is 'every X ticks, poll data'. No defaults - if there is no value, doesn't get recorded
    itemInterval?: number
    elecInterval?: number
    circInterval?: number
    pollInterval?: number
    sysInterval?: number

    // How many logistic bots to populate into roboports by default
    initialBots?: number = 150;

    // If true, the trial does no processing
    keepRaw?: boolean = false;

    // resulting data = null otherwise
    data: Dataset;

    /*
    * The following are used to track the state of the trial itself as its running, BEFORE a Dataset is created
    * */
    startedAt: Date = null;
    endedAt: Date = null;

    constructor(params: ITrialParams) {
        if (params && params.bp) {
            if (params.bp instanceof Blueprint)
                this.bp = params.bp;
            else
                this.bp = new Blueprint(params.bp);
        }

        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = randomUUID();

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
    linkData(data: Dataset) {
        this.data = data;
        Logging.log('info', {message: `Linked results to ${this.id.substring(10)}...`});
    }

}
