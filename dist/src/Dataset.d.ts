export interface IDatasetCombinedResults {
    itemRecords?: IGameFlowTick[];
    electricRecords?: IGameElectricTick[];
    circuitRecords?: IGameCircuitTick[];
    pollutionRecords?: IGamePollutionTick[];
    systemRecords?: ISystemTick[];
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
    signal: string;
    count: number;
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
