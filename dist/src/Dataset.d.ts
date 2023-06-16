import { Trial } from "./Trial";
export interface IDatasetParams {
    execStartTime: Date;
    trial: string | Trial;
    rawSysData: string;
    intervals?: IDatasetIntervals;
}
export interface IDatasetIntervals {
    itemInterval?: number;
    elecInterval?: number;
    circInterval?: number;
    pollInterval?: number;
    sysInterval?: number;
}
export interface IDatasetMeta {
    updates: number;
    avg: number;
    min: number;
    max: number;
    points?: number;
    trialTime: number;
    parseTime: number;
    totalTime: number;
    execTime: number;
}
export interface IGameFlowTick {
    cons: number;
    prod: number;
    label: string;
    tick: number;
}
export interface IGamePollutionTick {
    count: number;
    tick: number;
}
export interface IGameCircuitTick {
    circuitId: number;
    color: string;
    tick: number;
    signals: IGameCircuitSignal[];
}
export interface IGameElectricTick {
    networkId: number;
    cons: number;
    prod: number;
    label: string;
    tick: number;
}
export interface IGameCircuitSignal {
    signal: IGameCircuitSignalType;
    count: number;
}
export interface IGameCircuitSignalType {
    type: string;
    name: string;
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
    private cachedIntervals;
    startedAt?: Date;
    endedAt?: Date;
    execStartTime: Date;
    rawSysData: string;
    trialId: string;
    meta: IDatasetMeta;
    itemStats: IGameFlowTick[];
    elecStats: IGameElectricTick[];
    circStats: IGameCircuitTick[];
    pollStats: IGamePollutionTick[];
    sysStats: ISystemTick[];
    textLogs: string[];
    files?: any;
    isProcessed: boolean;
    constructor(params: IDatasetParams);
    skipProcess(dirPath: string): void;
    process(dirPath: string): void;
    get(filter: IDatasetFilter): DatasetFragment;
    private static _parseGamePollutionData;
    private static _parseGameFlowData;
    private static _parseGameElectricData;
    private static _parseSystemTickData;
    private static _parseGameCircuitData;
}
export interface IDatasetSummary {
    total: number;
    min: number;
    max: number;
    avg: number;
    std: number;
}
export declare class DatasetFragment implements IDatasetSummary {
    readonly dataset: Dataset;
    get desc(): string;
    label: string;
    category: string;
    direction: 'cons' | 'prod';
    values: number[];
    ticks: number[];
    total: number;
    min: number;
    max: number;
    avg: number;
    std: number;
    constructor(dataset: Dataset, filter: IDatasetFilter);
    load(): void;
    private _recalculate;
    per(filter: IDatasetFilter | DatasetFragment): DatasetRatio;
}
export declare class DatasetRatio {
    get desc(): string;
    get descData(): string;
    top: DatasetFragment;
    bottom: DatasetFragment;
    total: number;
    avg: number;
    constructor(top: DatasetFragment, bottom: DatasetFragment);
    recalculate(): void;
}
export interface IDatasetFilter {
    category: 'item' | 'electric' | 'pollution';
    label?: string;
    direction?: 'cons' | 'prod';
}
