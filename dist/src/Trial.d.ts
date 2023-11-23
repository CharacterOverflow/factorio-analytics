import { Source } from "./Source";
export interface ITrialParams {
    source: Source | string;
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
}
export interface ITrialDataFiles {
    items?: string;
    electric?: string;
    circuits?: string;
    pollution?: string;
}
export type TTrialStages = 'new' | 'preparing' | 'prepared' | 'compiling' | 'compiled' | 'running' | 'ran' | 'analyzing' | 'analyzed' | 'complete';
export declare class Trial {
    id: string;
    stage: TTrialStages;
    source: Source;
    length: number;
    tickInterval: number;
    initialBots?: number;
    recordItems: boolean;
    recordElectric: boolean;
    recordCircuits: boolean;
    recordPollution: boolean;
    recordSystem: boolean;
    name?: string;
    desc?: string;
    createdAt: Date;
    startedRunAt: Date;
    startedAt: Date;
    endedAt: Date;
    textLogs: string[];
    rawSystemText: string;
    metadata: any;
    itemMetadata: any;
    pollutionMetadata: any;
    get dataFiles(): ITrialDataFiles;
    constructor(params?: ITrialParams);
    get ready(): Promise<boolean>;
    setStage(stage: TTrialStages): void;
}
