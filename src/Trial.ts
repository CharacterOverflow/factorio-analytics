import {randomUUID} from "crypto";
import {ISource, Source} from "./Source";
import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";

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

export interface ITrial {
    id?: string;
    stage?: TTrialStages;
    source?: Source | ISource;
    length?: number;
    tickInterval?: number;
    initialBots?: number;
    recordItems?: boolean;
    recordElectric?: boolean;
    recordCircuits?: boolean;
    recordPollution?: boolean;
    recordSystem?: boolean;
    name?: string;
    desc?: string;
    createdAt?: Date;
    startedRunAt?: Date;
    startedAt?: Date;
    endedAt?: Date;
    textLogs?: string[];
    rawSystemText?: string;
    metadata?: any;
    itemMetadata?: any;
    electricMetadata?: any;
    circuitMetadata?: any;
    pollutionMetadata?: any;
    systemMetadata?: any;
}

// one of the main classes needed to do much of anything
@Entity('trial')
export class Trial implements ITrial {

    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    stage: TTrialStages;

    @ManyToOne(() => Source)
    source: Source

    @Column({
        nullable: false,
    })
    length: number

    @Column({
        name: 'tick_interval',
        nullable: false,
    })
    tickInterval: number

    @Column({
        name: 'initial_bots',
        nullable: false,
    })
    initialBots: number

    // Boolean flags for each 'data' category, used to determine which data to record
    @Column({
        name: 'record_items',
        nullable: false
    })
    recordItems: boolean

    @Column({
        name: 'record_electric',
        nullable: false,
    })
    recordElectric: boolean

    @Column({
        name: 'record_circuits',
        nullable: false,
    })
    recordCircuits: boolean

    @Column({
        name: 'record_pollution',
        nullable: false,
    })
    recordPollution: boolean

    @Column({
        name: 'record_system',
        nullable: false,
    })
    recordSystem: boolean

    @Column({
        nullable: true,
    })
    name: string;

    @Column({
        nullable: true,
    })
    desc: string;

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
    @Column({
        name: 'created_at',
        nullable: true,
    })
    createdAt: Date

    @Column({
        name: 'started_run_at',
        nullable: true
    })
    startedRunAt: Date

    @Column({
        name: 'started_at',
        nullable: true
    })
    startedAt: Date

    @Column({
        name: 'ended_at',
        nullable: true
    })
    endedAt: Date

    // text result of trial - logs and/or system data
    @Column({
        nullable: true,
        name: 'text_logs',
        type: 'simple-array'
    })
    textLogs: string[]

    // text result (raw) system data
    rawSystemText: string = null;

    @Column({
        nullable: true,
        type: 'simple-json'
    })
    metadata: any

    @Column({
        nullable: true,
        name: 'item_metadata',
        type: 'simple-json'
    })
    itemMetadata: any = null;

    @Column({
        nullable: true,
        name: 'electric_metadata',
        type: 'simple-json'
    })
    electricMetadata: any = null;

    @Column({
        nullable: true,
        name: 'circuit_metadata',
        type: 'simple-json'
    })
    circuitMetadata: any = null;

    @Column({
        nullable: true,
        name: 'pollution_metadata',
        type: 'simple-json'
    })
    pollutionMetadata: any = null;

    @Column({
        nullable: true,
        name: 'system_metadata',
        type: 'simple-json'
    })
    systemMetadata: any = null;

    /*static ensureObject(trial: ITrial): Trial {
        let a = trial as Trial
        if (a.dataFiles)
            return a;
        else
            return new Trial(a)
    }*/

    // filename results - generated from flags of which data to poll + id
    // these files will be deleted after processing, so they may or may not exist. These are their original names however
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

    static ticksToSeconds(ticks: number): number {
        return ticks / 60
    }

    static ticksToMinutes(ticks: number): number {
        return ticks / 3600
    }

    static minutesToTicks(minutes: number): number {
        return minutes * 3600
    }

    static secondsToTicks(seconds: number): number {
        return seconds * 60
    }

    static timeToTicks(minutes: number, seconds: number = 0): number {
        return (this.minutesToTicks(minutes) + this.secondsToTicks(seconds))
    }

    constructor(params: ITrial = null) {

        // we allow no-param construction of any class - this helps with ORMs and type casting
        if (!params)
            return;

        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = params?.id ?? randomUUID();
        this.createdAt = new Date()

        // If our source is a string, we need to create the source object automatically
        if (params.source && typeof params.source == 'string') {
            if ((params.source as string).endsWith('.zip')) {
                // create save source
                this.source = new Source({
                    text: params.source,
                    variant: 'savegame'
                })
            } else {
                // create blueprint source
                this.source = new Source({
                    text: params.source,
                    variant: 'blueprint'
                })
            }
        } else if (params.source) {
            // otherwise, we assume its already a source object
            this.source = Source.ensureObject(params.source)
        }

        // set the other data we need as well about the trial
        this.length = params.length ?? 7200;

        this.tickInterval = params.tickInterval ?? 60;

        if (params.initialBots)
            this.initialBots = params.initialBots;

        this.recordItems = (params.recordItems != undefined) ? params.recordItems : false

        this.recordElectric = false // params.recordElectric;

        this.recordCircuits = (params.recordCircuits != undefined) ? params.recordCircuits : false

        this.recordPollution = (params.recordPollution != undefined) ? params.recordPollution : false

        this.recordSystem = (params.recordSystem != undefined) ? params.recordSystem : false

        // set the name and desc. Otherwise, will be generated based on settings
        if (params.name)
            this.name = params.name
        else {
            this.name = `Trial of BPLength ${this.source.text.length} for [${this.recordItems ? 'I' : ''}${this.recordElectric ? 'E' : ''}${this.recordCircuits ? 'C' : ''}${this.recordPollution ? 'P' : ''}${this.recordSystem ? 'S' : ''}]`
        }
        if (params.desc)
            this.desc = params.desc
        else {
            this.desc = `[${this.recordItems ? 'I' : ''}${this.recordElectric ? 'E' : ''}${this.recordCircuits ? 'C' : ''}${this.recordPollution ? 'P' : ''}${this.recordSystem ? 'S' : ''}]
            In-Game Length ${Trial.ticksToSeconds(this.length)} Interval ${Trial.ticksToSeconds(this.tickInterval)}`
        }

        this.stage = "new"


    }

    setStage(stage: TTrialStages) {
        this.stage = stage;
    }

}
