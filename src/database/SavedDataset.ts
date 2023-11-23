/*
* This class handles saving all dataset information to a connected database
* */

import {IGameCircuitTick, IGameFlowTick, IGamePollutionTick, ISystemTick} from "../Dataset";
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity('dataset_items')
export class SavedFlowRecord implements IGameFlowTick {

    @PrimaryColumn()
    trialId: string;

    @PrimaryColumn()
    label: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column({type: 'integer'})
    cons: number;

    @Column({type: 'integer'})
    prod: number;

    constructor(params: IGameFlowTick, trialId: string) {
        if (!params)
            return

        this.trialId = trialId
        this.label = params.label;
        this.tick = params.tick;
        this.cons = params.cons;
        this.prod = params.prod;
    }

    static fromRecords(records: IGameFlowTick[], trialId: string): SavedFlowRecord[] {
        // create a 'save' record for all records here
        return records.map(record => new SavedFlowRecord(record, trialId))
    }




}

@Entity('dataset_circuits')
export class SavedCircuitRecord implements IGameCircuitTick {

    @PrimaryColumn()
    trialId: string;

    @PrimaryColumn()
    circuitId: number;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @PrimaryColumn()
    color: string;

    @PrimaryColumn()
    signal: string

    @Column({type: 'integer'})
    count: number;

    //  implement in the future

}

@Entity('dataset_pollution')
export class SavedPollutionRecord implements IGamePollutionTick {

    @PrimaryColumn()
    trialId: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column({type: 'float'})
    count: number;

    constructor(params: IGamePollutionTick, trialId: string) {
        if (!params)
            return

        this.trialId = trialId
        this.tick = params.tick;
        this.count = params.count;
    }

    static fromRecords(records: IGamePollutionTick[], trialId: string): SavedPollutionRecord[] {
        return records.map(record => new SavedPollutionRecord(record, trialId))
    }
}

@Entity('dataset_system')
export class SavedSystemRecord implements ISystemTick {

    @PrimaryColumn()
    trialId: string;

    @PrimaryColumn({type: 'integer'})
    tick: number;

    @Column()
    timestamp: number;

    @Column()
    wholeUpdate: number;

    @Column()
    latencyUpdate: number;

    @Column()
    gameUpdate: number;

    @Column()
    circuitNetworkUpdate: number;

    @Column()
    transportLinesUpdate: number;

    @Column()
    fluidsUpdate: number;

    @Column()
    heatManagerUpdate: number;

    @Column()
    entityUpdate: number;

    @Column()
    particleUpdate: number;

    @Column()
    mapGenerator: number;

    @Column()
    mapGeneratorBasicTilesSupportCompute: number;

    @Column()
    mapGeneratorBasicTilesSupportApply: number;

    @Column()
    mapGeneratorCorrectedTilesPrepare: number;

    @Column()
    mapGeneratorCorrectedTilesCompute: number;

    @Column()
    mapGeneratorCorrectedTilesApply: number;

    @Column()
    mapGeneratorVariations: number;

    @Column()
    mapGeneratorEntitiesPrepare: number;

    @Column()
    mapGeneratorEntitiesCompute: number;

    @Column()
    mapGeneratorEntitiesApply: number;

    @Column()
    crcComputation: number;

    @Column()
    electricNetworkUpdate: number;

    @Column()
    logisticManagerUpdate: number;

    @Column()
    constructionManagerUpdate: number;

    @Column()
    pathFinder: number;

    @Column()
    trains: number;

    @Column()
    trainPathFinder: number;

    @Column()
    commander: number;

    @Column()
    chartRefresh: number;

    @Column()
    luaGarbageIncremental: number;

    @Column()
    chartUpdate: number;

    @Column()
    scriptUpdate: number;

    constructor(params: ISystemTick, trialId: string) {
        if (!params)
            return

        this.trialId = trialId
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

    static fromRecords(records: ISystemTick[], trialId: string): SavedSystemRecord[] {
        return records.map(record => new SavedSystemRecord(record, trialId))
    }

}