import { Trial } from "./Trial";
export interface IGameFlowItemResults {
    data: IGameFlowItemTick[];
    trial: Trial;
}
export interface IGameFlowElectricResults {
    data: IGameFlowElectricTick[];
    trial: Trial;
}
export interface IGameFlowCircuitResults {
    data: IGameFlowCircuitTick[];
    trial: Trial;
}
export interface IGameFlowPollutionResults {
    data: IGameFlowPollutionTick[];
    trial: Trial;
}
export interface IGameFlowSystemResults {
    data: IGameFlowSystemTick[];
    trial: Trial;
}
export interface IGameFlow {
    label: string;
    tick: number;
}
export interface IGameFlowItemTick extends IGameFlow {
    cons: number;
    prod: number;
}
export interface IGameFlowElectricTick extends IGameFlow {
    networkId?: number;
    cons: number;
    prod: number;
}
export interface IGameFlowCircuitTick extends IGameFlow {
    circuitId: number;
    color: string;
    count: number;
}
export interface IGameFlowPollutionTick extends IGameFlow {
    count: number;
}
export interface IGameFlowSystemTick extends IGameFlow {
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
export declare class GameFlowItemRecord implements IGameFlowItemTick {
    trialId: string;
    label: string;
    tick: number;
    cons: number;
    prod: number;
    constructor(params: IGameFlowItemTick, trialId: string);
    static fromRecords(records: IGameFlowItemTick[], trialId: string): GameFlowItemRecord[];
}
export declare class GameFlowElectricRecord implements IGameFlowElectricTick {
    trialId: string;
    label: string;
    tick: number;
    networkId: number;
    cons: number;
    prod: number;
    constructor(params: IGameFlowElectricTick, trialId: string);
}
export declare class GameFlowCircuitRecord implements IGameFlowCircuitTick {
    trialId: string;
    circuitId: number;
    tick: number;
    color: string;
    label: string;
    count: number;
    constructor(params: IGameFlowCircuitTick, trialId: string);
}
export declare class GameFlowPollutionRecord implements IGameFlowPollutionTick {
    trialId: string;
    label: string;
    tick: number;
    count: number;
    constructor(params: IGameFlowPollutionTick, trialId: string);
    static fromRecords(records: IGameFlowPollutionTick[], trialId: string): GameFlowPollutionRecord[];
}
export declare class GameFlowSystemRecord implements IGameFlowSystemTick {
    trialId: string;
    label: string;
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
    constructor(params: IGameFlowSystemTick, trialId: string);
    static fromRecords(records: IGameFlowSystemTick[], trialId: string): GameFlowSystemRecord[];
}
