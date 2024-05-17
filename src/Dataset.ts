import {Trial} from "./Trial";
import {Column, Entity, PrimaryColumn} from "typeorm";

export interface IPlotData {
    x: number;
    y: number;
    tag?: string; // field name used to populate 'y' field. 'x' is ALWAYS tick
    label?: string; // label for the series
}

export interface IGameFlowRecordCounts {
    item?: number;
    electric?: number;
    circuit?: number;
    pollution?: number;
    system?: number;
}

export interface IGameFlowResults {
    data: IGameFlow[];
    minTick?: number;
    maxTick?: number;
    labels?: string[];
    cachedAt?: Date // set when results are cached in backend
}

export interface IGameFlowItemResults extends IGameFlowResults {
    data: IGameFlowItemTick[];
    trial: Trial
    averageConsByLabel?: { [key: string]: number }
    averageProdByLabel?: { [key: string]: number }
}

export interface IGameFlowElectricResults extends IGameFlowResults {
    data: IGameFlowElectricTick[];
    trial: Trial
    // add more here once i figure out WTF this electric data format even is
}

export interface IGameFlowCircuitResults extends IGameFlowResults {
    data: IGameFlowCircuitTick[];
    trial: Trial
}

export interface IGameFlowPollutionResults extends IGameFlowResults {
    data: IGameFlowPollutionTick[];
    trial: Trial
}

export interface IGameFlowSystemResults {
    data: IGameFlowSystemTick[];
    trial: Trial;
    // what other system data processing do we want?
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
    network: number;
    cons: number;
    prod: number;
}

export interface IGameFlowCircuitTick extends IGameFlow {
    networkId: number;
    color: string;
    count: number;
    signalType: string;
}

/*
export interface IGameCircuitSignal {
    signal: IGameCircuitSignalType;
    count: number;
}

export interface IGameCircuitSignalType {
    type: string;
    name: string;
}*/

export interface IGameFlowPollutionTick extends IGameFlow {
    count: number;
}


export interface IGameFlowSystemTick extends IGameFlow {
    timestamp: number
    wholeUpdate: number
    latencyUpdate: number
    gameUpdate: number
    circuitNetworkUpdate: number
    transportLinesUpdate: number
    fluidsUpdate: number
    heatManagerUpdate: number
    entityUpdate: number
    particleUpdate: number
    mapGenerator: number
    mapGeneratorBasicTilesSupportCompute: number
    mapGeneratorBasicTilesSupportApply: number
    mapGeneratorCorrectedTilesPrepare: number
    mapGeneratorCorrectedTilesCompute: number
    mapGeneratorCorrectedTilesApply: number
    mapGeneratorVariations: number
    mapGeneratorEntitiesPrepare: number
    mapGeneratorEntitiesCompute: number
    mapGeneratorEntitiesApply: number
    crcComputation: number
    electricNetworkUpdate: number
    logisticManagerUpdate: number
    constructionManagerUpdate: number
    pathFinder: number
    trains: number
    trainPathFinder: number
    commander: number
    chartRefresh: number
    luaGarbageIncremental: number
    chartUpdate: number
    scriptUpdate: number
}


@Entity('dataset_items')
export class GameFlowItemRecord implements IGameFlowItemTick {

    @PrimaryColumn()
    trial_id: string;

    @PrimaryColumn()
    label: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column({type: 'integer'})
    cons: number;

    @Column({type: 'integer'})
    prod: number;

    constructor(params: IGameFlowItemTick, trialId: string) {
        if (!params)
            return

        this.trial_id = trialId
        this.label = params.label;
        this.tick = params.tick;
        this.cons = params.cons;
        this.prod = params.prod;
    }

    static fromRecords(records: IGameFlowItemTick[], trialId: string): GameFlowItemRecord[] {
        // create a 'save' record for all records here
        return records.map(record => new GameFlowItemRecord(record, trialId))
    }

}

@Entity('dataset_electric')
export class GameFlowElectricRecord implements IGameFlowElectricTick {

    @PrimaryColumn()
    trial_id: string;

    @PrimaryColumn()
    label: string;

    @PrimaryColumn({type: 'integer'})
    network: number;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column({
        type: 'double precision'
    })
    cons: number;

    @Column({
        type: 'double precision'
    })
    prod: number;

    constructor(params: IGameFlowElectricTick, trialId: string) {
        if (!params)
            return

        this.trial_id = trialId
        this.label = params.label;
        this.network = params.network;
        this.tick = params.tick;
        this.cons = params.cons;
        this.prod = params.prod;
    }

    static fromRecords(records: IGameFlowElectricTick[], trialId: string): GameFlowElectricRecord[] {
        return records.map(record => new GameFlowElectricRecord(record, trialId))
    }

}

@Entity('dataset_circuit')
export class GameFlowCircuitRecord implements IGameFlowCircuitTick {

    @PrimaryColumn()
    trial_id: string;

    @PrimaryColumn()
    networkId: number;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @PrimaryColumn()
    color: string;

    @PrimaryColumn()
    label: string

    @Column()
    signalType: string

    @Column({type: 'integer'})
    count: number;

    //  implement in the future
    constructor(params: IGameFlowCircuitTick, trialId: string) {
        if (!params)
            return

        this.trial_id = trialId
        this.networkId = params.networkId;
        this.signalType = params.signalType;
        this.tick = params.tick;
        this.color = params.color;
        this.label = params.label;
        this.count = params.count;
    }

    static fromRecords(records: IGameFlowCircuitTick[], trialId: string): GameFlowCircuitRecord[] {
        return records.map(record => new GameFlowCircuitRecord(record, trialId))
    }

}

@Entity('dataset_pollution')
export class GameFlowPollutionRecord implements IGameFlowPollutionTick {

    @PrimaryColumn()
    trial_id: string;

    @PrimaryColumn()
    label: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column({type: 'float'})
    count: number;

    constructor(params: IGameFlowPollutionTick, trialId: string) {
        if (!params)
            return

        this.trial_id = trialId
        this.label = params?.label ?? 'Pollution'
        this.tick = params.tick;
        this.count = params.count;
    }

    static fromRecords(records: IGameFlowPollutionTick[], trialId: string): GameFlowPollutionRecord[] {
        return records.map(record => new GameFlowPollutionRecord(record, trialId))
    }
}

@Entity('dataset_system')
export class GameFlowSystemRecord implements IGameFlowSystemTick {

    @PrimaryColumn()
    trial_id: string;

    @Column()
    label: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column(
        {type: 'float'}
    )
    timestamp: number;

    @Column(
        {type: 'float'}
    )
    wholeUpdate: number;

    @Column(
        {type: 'float'}
    )
    latencyUpdate: number;

    @Column(
        {type: 'float'}
    )
    gameUpdate: number;

    @Column(
        {type: 'float'}
    )
    circuitNetworkUpdate: number;

    @Column(
        {type: 'float'}
    )
    transportLinesUpdate: number;

    @Column(
        {type: 'float'}
    )
    fluidsUpdate: number;

    @Column(
        {type: 'float'}
    )
    heatManagerUpdate: number;

    @Column(
        {type: 'float'}
    )
    entityUpdate: number;

    @Column(
        {type: 'float'}
    )
    particleUpdate: number;

    @Column(
        {type: 'float'}
    )
    mapGenerator: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorBasicTilesSupportCompute: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorBasicTilesSupportApply: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorCorrectedTilesPrepare: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorCorrectedTilesCompute: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorCorrectedTilesApply: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorVariations: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorEntitiesPrepare: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorEntitiesCompute: number;

    @Column(
        {type: 'float'}
    )
    mapGeneratorEntitiesApply: number;

    @Column(
        {type: 'float'}
    )
    crcComputation: number;

    @Column(
        {type: 'float'}
    )
    electricNetworkUpdate: number;

    @Column(
        {type: 'float'}
    )
    logisticManagerUpdate: number;

    @Column(
        {type: 'float'}
    )
    constructionManagerUpdate: number;

    @Column(
        {type: 'float'}
    )
    pathFinder: number;

    @Column(
        {type: 'float'}
    )
    trains: number;

    @Column(
        {type: 'float'}
    )
    trainPathFinder: number;

    @Column(
        {type: 'float'}
    )
    commander: number;

    @Column(
        {type: 'float'}
    )
    chartRefresh: number;

    @Column(
        {type: 'float'}
    )
    luaGarbageIncremental: number;

    @Column(
        {type: 'float'}
    )
    chartUpdate: number;

    @Column(
        {type: 'float'}
    )
    scriptUpdate: number;

    constructor(params: IGameFlowSystemTick, trialId: string) {
        if (!params)
            return

        this.trial_id = trialId
        this.label = params?.label ?? 'System'
        this.tick = params.tick;
        this.timestamp = params.timestamp;
        this.wholeUpdate = params.wholeUpdate;
        this.latencyUpdate = params.latencyUpdate;
        this.gameUpdate = params.gameUpdate;
        this.circuitNetworkUpdate = params.circuitNetworkUpdate;
        this.transportLinesUpdate = params.transportLinesUpdate;
        this.fluidsUpdate = params.fluidsUpdate;
        this.heatManagerUpdate = params.heatManagerUpdate;
        this.entityUpdate = params.entityUpdate;
        this.particleUpdate = params.particleUpdate;
        this.mapGenerator = params.mapGenerator;
        this.mapGeneratorBasicTilesSupportCompute = params.mapGeneratorBasicTilesSupportCompute;
        this.mapGeneratorBasicTilesSupportApply = params.mapGeneratorBasicTilesSupportApply;
        this.mapGeneratorCorrectedTilesPrepare = params.mapGeneratorCorrectedTilesPrepare;
        this.mapGeneratorCorrectedTilesCompute = params.mapGeneratorCorrectedTilesCompute;
        this.mapGeneratorCorrectedTilesApply = params.mapGeneratorCorrectedTilesApply;
        this.mapGeneratorVariations = params.mapGeneratorVariations;
        this.mapGeneratorEntitiesPrepare = params.mapGeneratorEntitiesPrepare;
        this.mapGeneratorEntitiesCompute = params.mapGeneratorEntitiesCompute;
        this.mapGeneratorEntitiesApply = params.mapGeneratorEntitiesApply;
        this.crcComputation = params.crcComputation;
        this.electricNetworkUpdate = params.electricNetworkUpdate;
        this.logisticManagerUpdate = params.logisticManagerUpdate;
        this.constructionManagerUpdate = params.constructionManagerUpdate;
        this.pathFinder = params.pathFinder;
        this.trains = params.trains;
        this.trainPathFinder = params.trainPathFinder;
        this.commander = params.commander;
        this.chartRefresh = params.chartRefresh;
        this.luaGarbageIncremental = params.luaGarbageIncremental;
        this.chartUpdate = params.chartUpdate;
        this.scriptUpdate = params.scriptUpdate;

    }

    static fromRecords(records: IGameFlowSystemTick[], trialId: string): GameFlowSystemRecord[] {
        return records.map(record => new GameFlowSystemRecord(record, trialId))
    }

}
