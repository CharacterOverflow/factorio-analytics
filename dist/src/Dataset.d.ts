import { Trial } from "./Trial";
export interface IDatasetCombinedResults {
    items?: ItemDataset;
    electric?: ElectricDataset;
    circuits?: CircuitDataset;
    pollution?: PollutionDataset;
    system?: SystemDataset;
}
export interface IGameFlowTick {
    cons: number;
    prod: number;
    label: string;
    tick: number;
}
export interface IGameElectricTick {
    networkId?: number;
    cons: number;
    prod: number;
    label: string;
    tick: number;
}
export interface IGameCircuitTick {
    circuitId: number;
    color: string;
    tick: number;
    signals: IGameCircuitSignal[];
}
export interface IGameCircuitSignal {
    signal: IGameCircuitSignalType;
    count: number;
}
export interface IGameCircuitSignalType {
    type: string;
    name: string;
}
export interface IGamePollutionTick {
    count: number;
    tick: number;
}
export interface ISystemTick {
    tick: number;
    timestamp: number;
    wholeUpdate: number;
    latencyUpdate: number;
    gameUpdate: number;
    circuitNetworkUpdate: number;
    transportLinesUpdate: number;
    fluidsUpdate: number;
    heatManagerUpdate: number;
    entityUpdate: number;
    particleUpdate: number;
    mapGenerator: number;
    mapGeneratorBasicTilesSupportCompute: number;
    mapGeneratorBasicTilesSupportApply: number;
    mapGeneratorCorrectedTilesPrepare: number;
    mapGeneratorCorrectedTilesCompute: number;
    mapGeneratorCorrectedTilesApply: number;
    mapGeneratorVariations: number;
    mapGeneratorEntitiesPrepare: number;
    mapGeneratorEntitiesCompute: number;
    mapGeneratorEntitiesApply: number;
    crcComputation: number;
    electricNetworkUpdate: number;
    logisticManagerUpdate: number;
    constructionManagerUpdate: number;
    pathFinder: number;
    trains: number;
    trainPathFinder: number;
    commander: number;
    chartRefresh: number;
    luaGarbageIncremental: number;
    chartUpdate: number;
    scriptUpdate: number;
}
export declare class Dataset {
    startedAt: Date;
    endedAt: Date;
    trial: Trial;
    raw?: string;
    avg: any;
    total: any;
    constructor(trial: Trial);
    parseData(): Promise<any[]>;
    calculateMetadata(): void;
}
export declare class ItemDataset extends Dataset {
    data: IGameFlowTick[];
    constructor(trial: Trial, itemDataFile: string);
    parseData(): Promise<IGameFlowTick[]>;
    calculateMetadata(): void;
}
export declare class ElectricDataset extends Dataset {
    data: IGameElectricTick[];
    constructor(trial: Trial, itemDataFile: string);
    parseData(): Promise<IGameElectricTick[]>;
    calculateMetadata(): void;
}
export declare class CircuitDataset extends Dataset {
    data: IGameCircuitTick[];
    constructor(trial: Trial, itemDataFile: string);
    parseData(): Promise<IGameCircuitTick[]>;
    calculateMetadata(): void;
}
export declare class PollutionDataset extends Dataset {
    data: IGamePollutionTick[];
    constructor(trial: Trial, itemDataFile: string);
    parseData(): Promise<IGamePollutionTick[]>;
    calculateMetadata(): void;
}
export declare class SystemDataset extends Dataset {
    data: ISystemTick[];
    constructor(trial: Trial, raw: string);
    parseData(): Promise<ISystemTick[]>;
    calculateMetadata(): void;
}
