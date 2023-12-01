import { ISource, Source } from "./Source";
export interface ITrialDataFiles {
    items?: string;
    electric?: string;
    circuits?: string;
    pollution?: string;
}
export type TTrialStages = 'new' | 'preparing' | 'prepared' | 'compiling' | 'compiled' | 'running' | 'ran' | 'analyzing' | 'analyzed' | 'complete';
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
    pollutionMetadata?: any;
}
export declare class Trial implements ITrial {
    id: string;
    stage: TTrialStages;
    source: Source;
    length: number;
    tickInterval: number;
    initialBots: number;
    recordItems: boolean;
    recordElectric: boolean;
    recordCircuits: boolean;
    recordPollution: boolean;
    recordSystem: boolean;
    name: string;
    desc: string;
    createdAt: Date;
    startedRunAt: Date;
    startedAt: Date;
    endedAt: Date;
    textLogs: string[];
    rawSystemText: string;
    metadata: any;
    itemMetadata: any;
    electricMetadata: any;
    circuitMetadata: any;
    pollutionMetadata: any;
    static ensureObject(trial: ITrial): Trial;
    get dataFiles(): ITrialDataFiles;
    constructor(params?: ITrial);
    setStage(stage: TTrialStages): void;
}
