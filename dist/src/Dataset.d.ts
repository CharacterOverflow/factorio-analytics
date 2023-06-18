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
    networkId?: number;
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
export interface IGameDataItem {
    label: string;
    spec?: string | number;
    value: number;
    tick: number;
}
export interface IDatasetTemplate {
    values: IGameDataItem[];
    total: number;
    min: number;
    max: number;
    avg: number;
    std: number;
}
export interface IDatasetFilter {
    category: 'item' | 'electric' | 'circuit' | 'pollution';
    label?: string;
    spec?: 'cons' | 'prod' | 'all';
    network?: number;
    scale?: number;
    radix?: number;
}
export declare class Dataset {
    private cachedIntervals;
    get itemInterval(): number;
    get elecInterval(): number;
    get circInterval(): number;
    get pollInterval(): number;
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
    getItemDataset(label?: string, spec?: string, scale?: number, radix?: number): IGameDataItem[];
    getElectricDataset(label?: string, spec?: string, network?: number, scale?: number, radix?: number): IGameDataItem[];
    getCircuitDataset(label?: string, network?: number, scale?: number, radix?: number): IGameDataItem[];
    getPollutionDataset(scale?: number, radix?: number): IGameDataItem[];
    private static _parseGamePollutionData;
    private static _parseGameFlowData;
    private static _parseGameElectricData;
    private static _parseSystemTickData;
    private static _parseGameCircuitData;
}
export declare class DatasetSubset implements IDatasetTemplate {
    readonly dataset: Dataset;
    constructor(dataset: Dataset);
    label?: string;
    specifier?: string;
    values: IGameDataItem[];
    interval: number;
    total: number;
    min: number;
    max: number;
    avg: number;
    std: number;
    load(): void;
    recalculate(): void;
    apply(func: (arr: IGameDataItem[]) => IGameDataItem[]): this;
}
export declare class DatasetFragment extends DatasetSubset {
    get desc(): string;
    label: string;
    category: 'item' | 'electric' | 'circuit' | 'pollution';
    specifier: string;
    network?: number;
    scale?: number;
    radix?: number;
    constructor(dataset: Dataset, filter: IDatasetFilter);
    load(): void;
    per(filter: IDatasetFilter | DatasetFragment): DatasetRatio;
}
export declare class DatasetRatio extends DatasetSubset {
    get desc(): string;
    get descData(): string;
    top: DatasetFragment;
    bottom: DatasetFragment;
    label: string;
    category: string;
    specifier: string;
    scale?: number;
    radix?: number;
    constructor(top: DatasetFragment, bottom: DatasetFragment, dataSettings?: IDatasetFilter);
    load(): void;
}
