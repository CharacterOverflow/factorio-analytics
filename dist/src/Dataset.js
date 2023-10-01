"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemDataset = exports.PollutionDataset = exports.CircuitDataset = exports.ElectricDataset = exports.ItemDataset = exports.Dataset = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
class Dataset {
    constructor(trial) {
        if (!trial.endedAt)
            throw new Error('Cannot create dataset from a trial that has not been run');
        this.trial = trial;
        this.startedAt = trial.startedAt;
        this.endedAt = trial.endedAt;
    }
    // parses the 'raw' data into the dataset, depending on type
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented - implement in child class');
        });
    }
    calculateMetadata() {
        throw new Error('Not implemented - implement in child class');
        // calculate per second rates and trial totals
    }
}
exports.Dataset = Dataset;
class ItemDataset extends Dataset {
    constructor(trial, itemDataFile) {
        super(trial);
        this.data = [];
        // raw should now be the 100% absolute path to load our jsonl file from
        // yes yes i know the filename already exists in trial, but its not the full path to the file
        // this object is created during 'analyzeTrial', and the Factory uses that data to build the complete path
        this.raw = itemDataFile;
    }
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            // load the file in 'raw' and parse it into the dataset
            const raw = yield fs_extra_1.default.readFile(this.raw, 'utf-8');
            let results = [];
            let lines = raw.split('\n');
            for (let i = 0; i < lines.length - 1; i++) {
                let l = lines[i];
                // keep an active map of all items in this tick, adding information as needed
                let itemMap = {};
                // Parse line information into temp object
                let lineParsed = JSON.parse(l);
                // for each key in cons, upsert data to itemMap
                let co = Object.keys(lineParsed.cons);
                for (let c of co) {
                    // the item record if it exists
                    let ir = itemMap[c];
                    if (ir) {
                        // Update the cons value, as there is nothing else it can be.
                        ir.cons = lineParsed.cons[c];
                    }
                    else {
                        // No object record exists yet - create and set it
                        itemMap[c] = {
                            label: c,
                            tick: (i + 1) * this.trial.tickInterval,
                            cons: lineParsed.cons[c],
                            prod: 0,
                        };
                    }
                }
                let po = Object.keys(lineParsed.prod);
                for (let p of po) {
                    // the item record if it exists
                    let ir = itemMap[p];
                    if (ir) {
                        // Update the cons value, as there is nothing else it can be.
                        ir.prod = lineParsed.prod[p];
                    }
                    else {
                        // No object record exists yet - create and set it
                        itemMap[p] = {
                            label: p,
                            tick: (i + 1) * this.trial.tickInterval,
                            cons: 0,
                            prod: lineParsed.prod[p],
                        };
                    }
                }
                // Now that the itemMap is populated, push all items to the results array for this tick. Convert all keys to an array, grabbing values from the map in a loop
                let itemKeys = Object.keys(itemMap);
                for (let ik of itemKeys) {
                    results.push(itemMap[ik]);
                }
            }
            this.data = results;
            this.calculateMetadata();
            return results;
        });
    }
    calculateMetadata() {
        // for each item, calculate the average and total for  each item
        let items = this.data;
        let g = lodash_1.default.groupBy(items, 'label');
        let kList = Object.keys(g);
        this.avg = {};
        this.total = {};
        for (let i = 0; i < kList.length; i++) {
            // sum / length (in minutes)
            let itemData = g[kList[i]];
            let secondsLength = this.trial.length / (60 * 60);
            let totalCons = lodash_1.default.sumBy(itemData, 'cons');
            let totalProd = lodash_1.default.sumBy(itemData, 'prod');
            this.avg[kList[i]] = {
                cons: totalCons / secondsLength,
                prod: totalProd / secondsLength
            };
            this.total[kList[i]] = {
                cons: totalCons,
                prod: totalProd
            };
        }
    }
}
exports.ItemDataset = ItemDataset;
class ElectricDataset extends Dataset {
    constructor(trial, itemDataFile) {
        super(trial);
        this.data = [];
        // raw should now be the 100% absolute path to load our jsonl file from
        // yes yes i know the filename already exists in trial, but its not the full path to the file
        // this object is created during 'analyzeTrial', and the Factory uses that data to build the complete path
        this.raw = itemDataFile;
    }
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield fs_extra_1.default.readFile(this.raw, 'utf-8');
            let results = [];
            let lines = raw.split('\n');
            // Now, need to sort through the list of lines and parse out the data
            for (let i = 0; i < lines.length - 1; i++) {
                let l = lines[i];
                // each line is a map, of networkID -> prod/cons map of items
                // for each lData that exists, we basically need to call _parseGameFlowData on it.
                let lData = JSON.parse(l);
                let lineKeys = Object.keys(lData);
                // for each key, we create a new IGameElectricTick. Everything else should load in without much issue
                for (let j = 0; j < lineKeys.length; j++) {
                    // buffer
                    let itemMap = {};
                    // kData represents the prod/cons map for this network
                    let kData = lData[lineKeys[j]];
                    // for each key in cons, upsert data to itemMap
                    let co = Object.keys(kData.cons);
                    for (let c of co) {
                        // the item record if it exists
                        let ir = itemMap[c];
                        if (ir) {
                            // Update the cons value, as there is nothing else it can be.
                            ir.cons = kData.cons[c];
                        }
                        else {
                            // No object record exists yet - create and set it
                            itemMap[c] = {
                                networkId: Number.parseInt(lineKeys[j]),
                                label: c,
                                tick: (i + 1) * this.trial.tickInterval,
                                cons: kData.cons[c] * 2,
                                prod: 0,
                            };
                        }
                    }
                    let po = Object.keys(kData.prod);
                    for (let p of po) {
                        // the item record if it exists
                        let ir = itemMap[p];
                        if (ir) {
                            // Update the prod value, as there is nothing else it can be.
                            ir.prod = kData.prod[p];
                        }
                        else {
                            // No object record exists yet - create and set it
                            itemMap[p] = {
                                networkId: Number.parseInt(lineKeys[j]),
                                label: p,
                                tick: (i + 1) * this.trial.tickInterval,
                                cons: 0,
                                prod: kData.prod[p] * 2
                            };
                        }
                    }
                    // Now that the itemMap is populated, push all items to the results array for this tick. Convert all keys to an array, grabbing values from the map in a loop
                    let itemKeys = Object.keys(itemMap);
                    for (let ik of itemKeys) {
                        results.push(itemMap[ik]);
                    }
                }
            }
            this.data = results;
            return results;
        });
    }
    calculateMetadata() {
        let items = this.data;
        let g = lodash_1.default.groupBy(items, 'label');
        let kList = Object.keys(g);
        this.avg = {};
        this.total = {};
        for (let i = 0; i < kList.length; i++) {
            // sum / length (in minutes)
            let itemData = g[kList[i]];
            let secondsLength = this.trial.length / (60 * 60);
            let totalCons = lodash_1.default.sumBy(itemData, 'cons');
            let totalProd = lodash_1.default.sumBy(itemData, 'prod');
            this.avg[kList[i]] = {
                cons: totalCons / secondsLength,
                prod: totalProd / secondsLength
            };
            this.total[kList[i]] = {
                cons: totalCons,
                prod: totalProd
            };
        }
    }
}
exports.ElectricDataset = ElectricDataset;
class CircuitDataset extends Dataset {
    constructor(trial, itemDataFile) {
        super(trial);
        this.data = [];
        this.raw = itemDataFile;
    }
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            let raw = yield fs_extra_1.default.readFile(this.raw, 'utf-8');
            let results = [];
            let lines = raw.split('\n');
            // Now, need to sort through the list of lines and parse out the data
            for (let i = 0; i < lines.length - 1; i++) {
                let l = lines[i];
                // each line is a map, of circuitID -> circuitData
                let lData = JSON.parse(l);
                let k = Object.keys(lData);
                // for each key, we create a new IGameCircuitTick. Everything else should load in without much issue
                for (let j = 0; j < k.length; j++) {
                    let kData = lData[k[j]];
                    results.push({
                        circuitId: Number.parseInt(k[j]),
                        tick: (i + 1) * this.trial.tickInterval,
                        color: kData.color,
                        signals: kData.signals
                    });
                }
            }
            this.data = results;
            return results;
        });
    }
    calculateMetadata() {
    }
}
exports.CircuitDataset = CircuitDataset;
class PollutionDataset extends Dataset {
    constructor(trial, itemDataFile) {
        super(trial);
        this.data = [];
        this.raw = itemDataFile;
    }
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            let raw = yield fs_extra_1.default.readFile(this.raw, 'utf-8');
            let results = [];
            let lines = raw.split('\n');
            // Now, need to sort through the list of lines and parse out the data
            for (let i = 0; i < lines.length - 1; i++) {
                let l = lines[i];
                // each line is a object with 1 field - pollution. This is a float
                let lData = JSON.parse(l);
                results.push({
                    tick: (i + 1) * this.trial.tickInterval,
                    count: lData.pollution
                });
            }
            this.data = results;
            return results;
        });
    }
    calculateMetadata() {
    }
}
exports.PollutionDataset = PollutionDataset;
class SystemDataset extends Dataset {
    constructor(trial, raw) {
        super(trial);
        // does not need to pass in scriptDataDir as well - we dont load a file for this one, but parse Text logs
        this.data = [];
        // raw should now be the 100% absolute path to load our jsonl file from
        // yes yes i know the filename already exists in trial, but its not the full path to the file
        // this object is created during 'analyzeTrial', and the Factory uses that data to build the complete path
        this.raw = raw;
    }
    parseData() {
        return __awaiter(this, void 0, void 0, function* () {
            let lines = this.raw.split('\n');
            // First line is headers, so we remove it
            lines.shift();
            // Now we have an array of strings, each string being a line of csv data
            let results = [];
            let currentTickItem = null;
            let currentSetCount = 0;
            let runningTimestamp = 0;
            for (let l of lines) {
                // Split by commas
                let data = l.split(',');
                if (!currentTickItem) {
                    currentSetCount = 1;
                    currentTickItem = {
                        tick: Number.parseInt(data[0].substring(1)),
                        timestamp: Number.parseInt(data[1]),
                        wholeUpdate: Number.parseInt(data[2]),
                        latencyUpdate: Number.parseInt(data[3]),
                        gameUpdate: Number.parseInt(data[4]),
                        circuitNetworkUpdate: Number.parseInt(data[5]),
                        transportLinesUpdate: Number.parseInt(data[6]),
                        fluidsUpdate: Number.parseInt(data[7]),
                        heatManagerUpdate: Number.parseInt(data[8]),
                        entityUpdate: Number.parseInt(data[9]),
                        particleUpdate: Number.parseInt(data[10]),
                        mapGenerator: Number.parseInt(data[11]),
                        mapGeneratorBasicTilesSupportCompute: Number.parseInt(data[12]),
                        mapGeneratorBasicTilesSupportApply: Number.parseInt(data[13]),
                        mapGeneratorCorrectedTilesPrepare: Number.parseInt(data[14]),
                        mapGeneratorCorrectedTilesCompute: Number.parseInt(data[15]),
                        mapGeneratorCorrectedTilesApply: Number.parseInt(data[16]),
                        mapGeneratorVariations: Number.parseInt(data[17]),
                        mapGeneratorEntitiesPrepare: Number.parseInt(data[18]),
                        mapGeneratorEntitiesCompute: Number.parseInt(data[19]),
                        mapGeneratorEntitiesApply: Number.parseInt(data[20]),
                        crcComputation: Number.parseInt(data[21]),
                        electricNetworkUpdate: Number.parseInt(data[22]),
                        logisticManagerUpdate: Number.parseInt(data[23]),
                        constructionManagerUpdate: Number.parseInt(data[24]),
                        pathFinder: Number.parseInt(data[25]),
                        trains: Number.parseInt(data[26]),
                        trainPathFinder: Number.parseInt(data[27]),
                        commander: Number.parseInt(data[28]),
                        chartRefresh: Number.parseInt(data[29]),
                        luaGarbageIncremental: Number.parseInt(data[30]),
                        chartUpdate: Number.parseInt(data[31]),
                        scriptUpdate: Number.parseInt(data[32])
                    };
                }
                else {
                    // add to the tick item, then evaluate if we need to push and reset it (if we are at tickInterval count)
                    // We add 1 to the tick because it is representative of the 'last 300 ticks'. So if we state 300, we are
                    // NOT including tick 300. therefore, it can show as 300 for data organization and matching, but tick 300
                    // goes towards the next interval mark, at 600.
                    currentTickItem.tick = Number.parseInt(data[0].substring(1)) + 1;
                    currentTickItem.timestamp = Number.parseInt(data[1]);
                    currentTickItem.wholeUpdate += Number.parseInt(data[2]);
                    currentTickItem.latencyUpdate += Number.parseInt(data[3]);
                    currentTickItem.gameUpdate += Number.parseInt(data[4]);
                    currentTickItem.circuitNetworkUpdate += Number.parseInt(data[5]);
                    currentTickItem.transportLinesUpdate += Number.parseInt(data[6]);
                    currentTickItem.fluidsUpdate += Number.parseInt(data[7]);
                    currentTickItem.heatManagerUpdate += Number.parseInt(data[8]);
                    currentTickItem.entityUpdate += Number.parseInt(data[9]);
                    currentTickItem.particleUpdate += Number.parseInt(data[10]);
                    currentTickItem.mapGenerator += Number.parseInt(data[11]);
                    currentTickItem.mapGeneratorBasicTilesSupportCompute += Number.parseInt(data[12]);
                    currentTickItem.mapGeneratorBasicTilesSupportApply += Number.parseInt(data[13]);
                    currentTickItem.mapGeneratorCorrectedTilesPrepare += Number.parseInt(data[14]);
                    currentTickItem.mapGeneratorCorrectedTilesCompute += Number.parseInt(data[15]);
                    currentTickItem.mapGeneratorCorrectedTilesApply += Number.parseInt(data[16]);
                    currentTickItem.mapGeneratorVariations += Number.parseInt(data[17]);
                    currentTickItem.mapGeneratorEntitiesPrepare += Number.parseInt(data[18]);
                    currentTickItem.mapGeneratorEntitiesCompute += Number.parseInt(data[19]);
                    currentTickItem.mapGeneratorEntitiesApply += Number.parseInt(data[20]);
                    currentTickItem.crcComputation += Number.parseInt(data[21]);
                    currentTickItem.electricNetworkUpdate += Number.parseInt(data[22]);
                    currentTickItem.logisticManagerUpdate += Number.parseInt(data[23]);
                    currentTickItem.constructionManagerUpdate += Number.parseInt(data[24]);
                    currentTickItem.pathFinder += Number.parseInt(data[25]);
                    currentTickItem.trains += Number.parseInt(data[26]);
                    currentTickItem.trainPathFinder += Number.parseInt(data[27]);
                    currentTickItem.commander += Number.parseInt(data[28]);
                    currentTickItem.chartRefresh += Number.parseInt(data[29]);
                    currentTickItem.luaGarbageIncremental += Number.parseInt(data[30]);
                    currentTickItem.chartUpdate += Number.parseInt(data[31]);
                    currentTickItem.scriptUpdate += Number.parseInt(data[32]);
                    currentSetCount += 1;
                }
                if (currentSetCount >= this.trial.tickInterval) {
                    // Cut nanoseconds down to milliseconds so its more comprehensive
                    // Timestamp is a 'always increasing' field, so instead we just want to record the differences between points.
                    // This gives much more useful information
                    let tb = currentTickItem.timestamp;
                    currentTickItem.timestamp = (currentTickItem.timestamp - runningTimestamp) / 1000000;
                    runningTimestamp = tb;
                    currentTickItem.wholeUpdate = currentTickItem.wholeUpdate / 1000000;
                    currentTickItem.latencyUpdate = currentTickItem.latencyUpdate / 1000000;
                    currentTickItem.gameUpdate = currentTickItem.gameUpdate / 1000000;
                    currentTickItem.circuitNetworkUpdate = currentTickItem.circuitNetworkUpdate / 1000000;
                    currentTickItem.transportLinesUpdate = currentTickItem.transportLinesUpdate / 1000000;
                    currentTickItem.fluidsUpdate = currentTickItem.fluidsUpdate / 1000000;
                    currentTickItem.heatManagerUpdate = currentTickItem.heatManagerUpdate / 1000000;
                    currentTickItem.entityUpdate = currentTickItem.entityUpdate / 1000000;
                    currentTickItem.particleUpdate = currentTickItem.particleUpdate / 1000000;
                    currentTickItem.mapGenerator = currentTickItem.mapGenerator / 1000000;
                    currentTickItem.mapGeneratorBasicTilesSupportCompute = currentTickItem.mapGeneratorBasicTilesSupportCompute / 1000000;
                    currentTickItem.mapGeneratorBasicTilesSupportApply = currentTickItem.mapGeneratorBasicTilesSupportApply / 1000000;
                    currentTickItem.mapGeneratorCorrectedTilesPrepare = currentTickItem.mapGeneratorCorrectedTilesPrepare / 1000000;
                    currentTickItem.mapGeneratorCorrectedTilesCompute = currentTickItem.mapGeneratorCorrectedTilesCompute / 1000000;
                    currentTickItem.mapGeneratorCorrectedTilesApply = currentTickItem.mapGeneratorCorrectedTilesApply / 1000000;
                    currentTickItem.mapGeneratorVariations = currentTickItem.mapGeneratorVariations / 1000000;
                    currentTickItem.mapGeneratorEntitiesPrepare = currentTickItem.mapGeneratorEntitiesPrepare / 1000000;
                    currentTickItem.mapGeneratorEntitiesCompute = currentTickItem.mapGeneratorEntitiesCompute / 1000000;
                    currentTickItem.mapGeneratorEntitiesApply = currentTickItem.mapGeneratorEntitiesApply / 1000000;
                    currentTickItem.crcComputation = currentTickItem.crcComputation / 1000000;
                    currentTickItem.electricNetworkUpdate = currentTickItem.electricNetworkUpdate / 1000000;
                    currentTickItem.logisticManagerUpdate = currentTickItem.logisticManagerUpdate / 1000000;
                    currentTickItem.constructionManagerUpdate = currentTickItem.constructionManagerUpdate / 1000000;
                    currentTickItem.pathFinder = currentTickItem.pathFinder / 1000000;
                    currentTickItem.trains = currentTickItem.trains / 1000000;
                    currentTickItem.trainPathFinder = currentTickItem.trainPathFinder / 1000000;
                    currentTickItem.commander = currentTickItem.commander / 1000000;
                    currentTickItem.chartRefresh = currentTickItem.chartRefresh / 1000000;
                    currentTickItem.luaGarbageIncremental = currentTickItem.luaGarbageIncremental / 1000000;
                    currentTickItem.chartUpdate = currentTickItem.chartUpdate / 1000000;
                    currentTickItem.scriptUpdate = currentTickItem.scriptUpdate / 1000000;
                    // Push the current tick item, then reset it.
                    results.push(currentTickItem);
                    currentTickItem = null;
                    currentSetCount = 0;
                }
            }
            this.data = results;
            return results;
        });
    }
    calculateMetadata() {
    }
}
exports.SystemDataset = SystemDataset;
//# sourceMappingURL=Dataset.js.map