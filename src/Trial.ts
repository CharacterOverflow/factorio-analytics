import {randomUUID} from "crypto";
import {Source} from "./Source";

export interface ITrialParams {
    // requirement for a trial to run - must be an existing 'source', or specify a blueprint string / save game file name
    source: Source | string;

    // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second when being played
    length?: number;

    // how many ticks between data polls
    tickInterval?: number;

    // number of logistic bots that we will spawn into each roboport
    initialBots?: number

    // boolean flags for each data category, used to determine which data to record. Defaults to true for all except system
    recordItems?: boolean
    recordElectric?: boolean
    recordCircuits?: boolean
    recordPollution?: boolean
    recordSystem?: boolean

    name?: string
    desc?: string
}

export interface ITrialDataFiles {
    items?: string;
    electric?: string;
    circuits?: string;
    pollution?: string;
}

export type TTrialStages =
    'new'
    | 'preparing'
    | 'prepared'
    | 'compiling'
    | 'compiled'
    | 'running'
    | 'ran'
    | 'analyzing'
    | 'analyzed'
    | 'complete';

// one of the main classes needed to do much of anything
export class Trial {

    // Generated UUID for this trial to be unique
    id: string;

    // current stage of the trial
    stage: TTrialStages = 'new';

    // Blueprint / Savegame source used to supply/run this trial
    source: Source

    // the length (in ticks) of the trial
    length: number = 3600

    // how often to poll data, by category. This is 'every X ticks, poll data'. Defaults to 300, meaning every 5 seconds
    tickInterval: number = 300

    // How many logistic bots to populate into roboports by default
    initialBots?: number = 150;

    // Boolean flags for each 'data' category, used to determine which data to record
    recordItems: boolean = true
    recordElectric: boolean = false // electric needs to be looked at for accuracy
    recordCircuits: boolean = false // circuits needs to be looked at for accuracy
    recordPollution: boolean = true
    recordSystem: boolean = false

    name?: string
    desc?: string

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
    createdAt: Date = null;
    startedRunAt: Date = null;
    startedAt: Date = null;
    endedAt: Date = null;

    // text result of trial - logs and/or system data
    textLogs: string[] = null;

    // text result (raw) system data
    rawSystemText: string = null;

    // metadata from execution
    metadata: any = null;

    itemMetadata: any = null;
    // electricMetadata: any = null;
    // circuitMetadata: any = null;
    pollutionMetadata: any = null;

    // filename results - generated from flags of which data to poll + id
    get dataFiles(): ITrialDataFiles {
        if (this.metadata)
            return {
                items: this.recordItems ? `${this.id}_item.jsonl` : undefined,
                electric: this.recordElectric ? `${this.id}_elec.jsonl` : undefined,
                circuits: this.recordCircuits ? `${this.id}_circ.jsonl` : undefined,
                pollution: this.recordPollution ? `${this.id}_poll.jsonl` : undefined,
            }
        else
            return undefined
    }

    constructor(params: ITrialParams = null) {

        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = randomUUID();
        this.createdAt = new Date()

        // we allow no-param construction of any class - this helps with ORMs and type casting
        if (!params)
            return;

        // If our source is a string, we need to create the source object automatically
        if (params.source && typeof params.source == 'string') {
            if (params.source.endsWith('.zip')) {
                // create save source
                this.source = new Source({
                    saveGamePath: params.source,
                })
            } else {
                // create blueprint source
                this.source = new Source({
                    blueprint: params.source,
                })
            }
        } else {
            // otherwise, we assume its already a source object
            this.source = params.source as Source
        }

        this.name = params.name;
        this.desc = params.desc;

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
            this.recordElectric = false // params.recordElectric;

        if (params.recordCircuits)
            this.recordCircuits = false // params.recordCircuits;

        if (params.recordPollution)
            this.recordPollution = params.recordPollution;

        if (params.recordSystem)
            this.recordSystem = params.recordSystem;
    }

    get ready(): Promise<boolean> {
        return this.source.ready;
    }

    setStage(stage: TTrialStages) {
        this.stage = stage;
    }

    // handle data processing here - not in dataset
    // dataset is being removed, only the child 'records' remain
    // a new class will be introduced in the future for calculations, called 'DatasetAnaylsis'



    // Called by Factory when trial has completed, used to link TRIAL to a created DATA object
    /*async linkData(data: Dataset) {
        this.data = data;
        Logging.log('info', {message: `Linked results to ${this.id.substring(10)}...`});
    }*/

}
