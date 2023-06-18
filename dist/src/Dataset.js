"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetRatio = exports.DatasetFragment = exports.DatasetSubset = exports.Dataset = void 0;
/*
* this class  will be in charg of managing an entire dataset about a given Trial.
*
* Any Dataset ultimately is tied to a Trial, but we split the functionality for organization and expansion in the future
*
* It is ONLY concerned with output data, and how we may want to transform / use that data.
*
* */
const fs_extra_1 = __importDefault(require("fs-extra"));
const Trial_1 = require("./Trial");
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
class Dataset {
    get itemInterval() {
        return this.cachedIntervals.itemInterval;
    }
    get elecInterval() {
        return this.cachedIntervals.elecInterval;
    }
    get circInterval() {
        return this.cachedIntervals.circInterval;
    }
    get pollInterval() {
        return this.cachedIntervals.pollInterval;
    }
    // execStartTime is used for some additional calculations about summary data
    constructor(params) {
        // Flag of whether or not 'process' was called successfully yet
        this.isProcessed = false;
        // set the intervals
        if (params.trial && params.trial instanceof Trial_1.Trial) {
            this.cachedIntervals = {
                itemInterval: params.trial.itemInterval,
                elecInterval: params.trial.elecInterval,
                circInterval: params.trial.circInterval,
                pollInterval: params.trial.pollInterval,
                sysInterval: params.trial.sysInterval
            };
            this.trialId = params.trial.id;
            // LInk the trial passed in to this new dataset
            this.startedAt = params.trial.startedAt;
            this.endedAt = params.trial.endedAt;
        }
        else {
            this.cachedIntervals = params.intervals;
            this.trialId = params.trial;
        }
        if (this.cachedIntervals == undefined || this.trialId == undefined) {
            throw new Error("Cannot create dataset without intervals. Please pass a trial object, or trialID + intervals object");
        }
        // set raw system data, if exists
        this.rawSysData = params.rawSysData;
        this.execStartTime = params.execStartTime;
    }
    skipProcess(dirPath) {
        // used to build the filepaths for later processing
        this.files = {
            itemData: path_1.default.join(dirPath, 'data', `${this.trialId}_item.jsonl`),
            elecData: path_1.default.join(dirPath, 'data', `${this.trialId}_elec.jsonl`),
            circData: path_1.default.join(dirPath, 'data', `${this.trialId}_circ.jsonl`),
            pollData: path_1.default.join(dirPath, 'data', `${this.trialId}_poll.jsonl`),
        };
    }
    // Loads files and processes data to generate metadata and usable datasets
    process(dirPath) {
        // Grab our 'summary' section that shows up all the time, no matter what. Below this is our perf stats (if they exist)
        let gameTimeStart = this.rawSysData.indexOf('Performed ');
        // If there is a trial - we read up until the data. Else, we read up until the end
        let idxA = this.rawSysData.indexOf('run 1:');
        let gameTimeSubstr = this.rawSysData.substring(gameTimeStart, idxA >= 0 ? idxA : this.rawSysData.length - 1);
        //Read very last row of execResults for perfTime - all we need there. Then do perf stats
        let lastIdx = this.rawSysData.substring(0, this.rawSysData.length - 1).lastIndexOf('\n');
        let lastLine = this.rawSysData.substring(lastIdx);
        let perfTime = lastLine.substring(3, lastLine.length - 8);
        // Grab the first newline after the 'run' declaration, then substring from there until end of file
        let perfStart = this.rawSysData.indexOf('\n', this.rawSysData.indexOf('run 1:'));
        let perfSubstr = this.rawSysData.substring(perfStart + 1, lastIdx);
        let execTime = (Number.parseFloat(perfTime)) * 1000;
        // Parse out our item information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.itemInterval) {
            let itemRaw = fs_extra_1.default.readFileSync(path_1.default.join(dirPath, 'data', `${this.trialId}_item.jsonl`), 'utf8');
            this.itemStats = Dataset._parseGameFlowData(itemRaw, this.cachedIntervals.itemInterval);
        }
        // Parse out our electric information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.elecInterval) {
            let elecRaw = fs_extra_1.default.readFileSync(path_1.default.join(dirPath, 'data', `${this.trialId}_elec.jsonl`), 'utf8');
            this.elecStats = Dataset._parseGameElectricData(elecRaw, this.cachedIntervals.elecInterval);
        }
        // Parse out our circuit information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.circInterval) {
            let circRaw = fs_extra_1.default.readFileSync(path_1.default.join(dirPath, 'data', `${this.trialId}_circ.jsonl`), 'utf8');
            this.circStats = Dataset._parseGameCircuitData(circRaw, this.cachedIntervals.circInterval);
        }
        // Parse out our pollution information
        if (this.cachedIntervals.pollInterval) {
            let pollRaw = fs_extra_1.default.readFileSync(path_1.default.join(dirPath, 'data', `${this.trialId}_poll.jsonl`), 'utf8');
            this.pollStats = Dataset._parseGamePollutionData(pollRaw, this.cachedIntervals.pollInterval);
        }
        // Parse out system stats. Defaults to 300 (every 5 seconds) if none specified
        this.sysStats = Dataset._parseSystemTickData(perfSubstr, this.cachedIntervals.sysInterval ? this.cachedIntervals.sysInterval : 300);
        // Grab the text logs that prefix our raw system data
        this.textLogs = this.rawSysData.substring(0, idxA).split('\n');
        // Record our end parsing time.
        let nd = (new Date()).getTime();
        // Finally, lets grab metadata...
        this.meta = {
            updates: Number.parseInt(gameTimeSubstr.substring(10, gameTimeSubstr.indexOf(' ', 10))),
            avg: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('avg:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('avg:') + 4))),
            min: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('min:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('min:') + 4))),
            max: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('max:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('max:') + 4))),
            trialTime: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('in ') + 3, gameTimeSubstr.indexOf('ms'))),
            //points: gdRaw.split('\n').length - 1,
            totalTime: nd - this.startedAt.getTime(),
            execTime: execTime,
            parseTime: (nd - this.execStartTime.getTime()) - execTime,
        };
        // At this point, all of our data is loaded and parsed. We can now cleanup and return, then we're done
        delete this.rawSysData;
        this.isProcessed = true;
    }
    /*
    * This function will 'get' the relevant summary data based on input.
    * -- CATEGORY - what dataset to look in for filter. Pollution will always look for pollution value, it is not specific to a entity type
    * -- FILTER - the item in particular you're looking to get data for. solar-panel might be for electric, or iron-plate for item.
    *       --- The common term 'all' will aggregate all data for the category, and return a single value
    * -- direction - if consumed or produced. For pollution, 'cons' will just inverse the value.
    * */
    get(filter) {
        // fragment will retrieve the needed data just after creation, or throw error trying. Everything can be chained off of here
        return new DatasetFragment(this, filter);
    }
    /*
    * Returns the item dataset in the IGameDataItem format, for easy usage outisde the package
    * -- label - if provided, will filter the results to only those that match the label (name). If not provided, or if 'all', all items will be returned
    * -- spec - if provided, will filter the results to only those that match the spec (cons/prod). If not provided, or if 'all', cons+prod will be returned
    * */
    getItemDataset(label, spec, scale, radix) {
        if (!this.itemStats)
            return [];
        let dArr = [];
        let results = [];
        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by
            dArr = this.itemStats.filter((i) => {
                return i.label == label;
            });
        }
        else {
            dArr = this.itemStats;
        }
        // now, based on spec, make the add to results
        // factor in 'scale' and 'radix' if provided
        if (spec && spec != 'all' && (spec == 'cons' || spec == 'prod')) {
            // in this case, we will JUST add 1 record based on the 'spec' value being either cons or prod
            for (let i of dArr) {
                let val = i[spec];
                if (scale)
                    val = val / scale;
                if (radix)
                    val = +val.toFixed(radix);
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: val,
                    spec: spec
                });
            }
        }
        else {
            // add both cons+prod
            for (let i of dArr) {
                let cVal = i.cons;
                let pVal = i.prod;
                if (scale) {
                    cVal = cVal / scale;
                    pVal = pVal / scale;
                }
                if (radix) {
                    cVal = +cVal.toFixed(radix);
                    pVal = +pVal.toFixed(radix);
                }
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: cVal,
                    spec: 'cons'
                });
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: pVal,
                    spec: 'prod'
                });
            }
        }
        return results;
    }
    /*
    * Returns the elec dataset in the IGameDataFormat, for easy usage outside the package
    * -- label - if provided, will filter the results to only those that match the label (name). If not provided, or if 'all', all items will be returned
    * -- spec - if provided, will filter the results to only those that match the spec (cons/prod). If not provided, or if 'all', cons+prod will be returned.
    * -- network - if provided, will filter the results to only those that match the network id. If not provided, all networks will be returned
    * -- scale - if provided, will scale the results by the provided value (dividing by scale). If not provided, no scaling will be done. Recommended to use this as '1000' for kW, '1000000' for MW, etc
    * -- radix - if provided, will round the results to the provided radix. If not provided, no rounding will be done. Recommended to use this as '2' for 2 decimal places.
    * */
    getElectricDataset(label, spec, network, scale, radix) {
        if (!this.elecStats)
            return [];
        let dArr = [];
        let results = [];
        // filter down by network, if provided
        if (network) {
            dArr = this.elecStats.filter((i) => {
                return i.networkId == network;
            });
        }
        else {
            dArr = this.elecStats;
        }
        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by
            dArr = dArr.filter((i) => {
                return i.label == label;
            });
        }
        else {
            // means that label either DOESNT exist, or is 'all'. So, use entire dataset, 1 record per tick.
            let gd = lodash_1.default.groupBy(dArr, 'tick');
            let k = Object.keys(gd);
            let nArr = [];
            for (let i of k) {
                let v = gd[i];
                // summarize 'v' into 1 record, add to dArr
                nArr.push({
                    tick: i,
                    label: 'all',
                    cons: lodash_1.default.sumBy(v, 'cons'),
                    prod: lodash_1.default.sumBy(v, 'prod')
                });
            }
            dArr = nArr;
        }
        // now, based on spec, make the add to results
        // factor in 'scale' and 'radix' if provided
        if (spec && spec != 'all' && (spec == 'cons' || spec == 'prod')) {
            // in this case, we will JUST add 1 record based on the 'spec' value being either cons or prod
            for (let i of dArr) {
                let val = i[spec];
                if (scale)
                    val = val / scale;
                if (radix)
                    val = +val.toFixed(radix);
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: val,
                    spec: spec
                });
            }
        }
        else {
            // add both cons+prod
            for (let i of dArr) {
                let cVal = i.cons;
                let pVal = i.prod;
                if (scale) {
                    cVal = cVal / scale;
                    pVal = pVal / scale;
                }
                if (radix) {
                    cVal = +cVal.toFixed(radix);
                    pVal = +pVal.toFixed(radix);
                }
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: cVal,
                    spec: 'cons'
                });
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: pVal,
                    spec: 'prod'
                });
            }
        }
        return results;
    }
    /*
    * Returns the circuit  dataset in the IGameDataFormat, for easy usage outsid the package
    * -- label - if provided, will filter the results to only those signals that match the label (name). If not provided, or if 'all', all items will be returned
    * -- network - if provided, will filter the results to only those signals that match the network id. If not provided, all networks will be returned overlaid on top of each other.
    * */
    getCircuitDataset(label, network, scale, radix) {
        var _a, _b, _c;
        if (!this.circStats)
            return [];
        let dArr = [];
        let results = [];
        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by. Remove all entries that don't have a signla with this label
            dArr = this.circStats.filter((i) => {
                return i.signals.some((s) => {
                    var _a;
                    return ((_a = s.signal) === null || _a === void 0 ? void 0 : _a.name) == label;
                });
            });
        }
        else {
            // means that label either DOESNT exist, or is 'all'. So, use entire dataset
            dArr = this.circStats;
        }
        // if network is set, filter down to only those that match the network
        if (network) {
            dArr = dArr.filter((i) => {
                return i.circuitId == network;
            });
        }
        // now, we need to loop through the dataset and add each signal to the results. A result shuold be added for EACH signal of specified label (if set)
        for (let i of dArr) {
            for (let s of i.signals) {
                if (label && label != 'all' && ((_a = s.signal) === null || _a === void 0 ? void 0 : _a.name) != label)
                    continue;
                let val = s.count;
                if (scale)
                    val = val / scale;
                if (radix)
                    val = +val.toFixed(radix);
                results.push({
                    tick: i.tick,
                    label: network ? (_b = s.signal) === null || _b === void 0 ? void 0 : _b.name : `${i.circuitId}:${(_c = s.signal) === null || _c === void 0 ? void 0 : _c.name}`,
                    value: val,
                    spec: 'count'
                });
            }
        }
        return results;
    }
    /*
    * Returns the pollution dataset in the IGameDataFormat, for easy usage outside the package
    * No parameters are needed here - the pollution dataset is a single dataset, and is not broken down by network or label. Simple!
    * */
    getPollutionDataset(scale, radix) {
        if (!this.pollStats)
            return [];
        return this.pollStats.map((i) => {
            let val = i.count;
            if (scale)
                val = val / scale;
            if (radix)
                val = +val.toFixed(radix);
            return {
                tick: i.tick,
                label: 'pollution',
                value: val,
                spec: 'count'
            };
        });
    }
    /*
    * Private Static utility functions below - all used in the parsing of core data during the 'process' function
    * If any changes are needed to how data is processed, it's likely below.
    * */
    static _parseGamePollutionData(raw, tickInterval) {
        let results = [];
        let lines = raw.split('\n');
        // Now, need to sort through the list of lines and parse out the data
        for (let i = 0; i < lines.length - 1; i++) {
            let l = lines[i];
            // each line is a object with 1 field - pollution. This is a float
            let lData = JSON.parse(l);
            results.push({
                tick: (i + 1) * tickInterval,
                count: lData.pollution
            });
        }
        return results;
    }
    // Parses out the item flow stats from the raw loaded data.
    static _parseGameFlowData(raw, tickInterval) {
        let results = [];
        let lines = raw.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            let l = lines[i];
            // Need to loop through both Cons and Prod, as a item name may be missing from prod but present in cons.
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
                        tick: (i + 1) * tickInterval,
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
                        tick: (i + 1) * tickInterval,
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
        return results;
    }
    // Parses out the electric stats from the raw loaded data
    static _parseGameElectricData(raw, tickInterval) {
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
                            tick: (i + 1) * tickInterval,
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
                            tick: (i + 1) * tickInterval,
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
        return results;
    }
    // Parses out the tick data from the raw string of csv data
    static _parseSystemTickData(raw, tickInterval) {
        let lines = raw.split('\n');
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
            if (currentSetCount >= tickInterval) {
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
        return results;
    }
    // Parses out the circuit data from the raw loaded data file
    static _parseGameCircuitData(raw, tickInterval) {
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
                    tick: (i + 1) * tickInterval,
                    color: kData.color,
                    signals: kData.signals
                });
            }
        }
        return results;
    }
}
exports.Dataset = Dataset;
// The base class of many subsets of the Dataset
// Fragment makes up a single smaller subset of data from a Dataset
// Ratio makes up a comparable ratio of 2 fragments
// all share the same functionality
class DatasetSubset {
    constructor(dataset) {
        this.dataset = dataset;
    }
    // implement here any functionality for 'loading' this fragment or partial from the Dataset. This is called when the dataset is loaded
    load() {
    }
    // Called to regnerate metadata about the overall 'values' array that is loaded during the 'load' functionality
    recalculate() {
        var _a, _b;
        // calcs summary values from values array
        if (this.values && this.values.length > 0) {
            this.total = lodash_1.default.sumBy(this.values, 'value');
            this.min = (_a = lodash_1.default.minBy(this.values, 'value')) === null || _a === void 0 ? void 0 : _a.value;
            this.max = (_b = lodash_1.default.maxBy(this.values, 'value')) === null || _b === void 0 ? void 0 : _b.value;
            this.avg = lodash_1.default.meanBy(this.values, 'value');
            const avg = this.avg;
            // really don't want to include the mathjs library if I don't have to
            this.std = Math.sqrt(this.values.reduce(function (sq, n) {
                return sq + Math.pow(n.value - avg, 2);
            }, 0) / (this.values.length - 1));
        }
        else {
            this.total = 0;
            this.min = 0;
            this.max = 0;
            this.avg = 0;
            this.std = 0;
        }
    }
    /*
    * Applies a given filter function to this dataset fragment, setting the 'values' array based on results.
    * Can be used to customize the data used in this format after retrieval - for example, to SUM all items produced per tick.
    * */
    apply(func) {
        this.values = func(this.values);
        this.recalculate();
        return this;
    }
}
exports.DatasetSubset = DatasetSubset;
/*
* GOALS
* 1. Dataset rework - the 'get' and 'per' functionality will now operate on entire datasets, point by point.
* 2. Will always use the 'dir' and 'count' resulting datatype, so it can be used for signal and other information as well
*     - dir would be prod or  cons, OR if its a signal, would be the signal ID
* */
// This class represents a single piece of a dataset that was retrieved - a summary value of everything in the dataset with a filter
// From there, it can then be chained with another dataset request to produce a final 'DatasetRatio'
// Can be used on item data, electric data, and pollution data.
class DatasetFragment extends DatasetSubset {
    get desc() {
        if (this.category === 'item') {
            return `${this.label} items ${this.specifier == 'prod' ? 'produced' : 'consumed'}`;
        }
        else if (this.category === 'electric') {
            return `${this.label} ${this.specifier == 'prod' ? 'power produced' : 'consumed power'}`;
        }
        else if (this.category === 'pollution') {
            return `pollution ${this.specifier == 'prod' ? 'produced' : 'consumed'}`;
        }
        else if (this.category === 'circuit') {
            return `circuit ${this.label} value on ${this.specifier}`;
        }
    }
    // category is what data we are selecting from - assumed to be 'items' or 'electricity' or 'pollution'
    // filter should also be 'pollution' if grabbing that
    constructor(dataset, filter) {
        super(dataset);
        this.label = filter.label;
        this.category = filter.category;
        this.specifier = filter.spec;
        this.network = filter.network;
        this.scale = filter.scale;
        this.radix = filter.radix;
        switch (this.category) {
            case 'item':
                this.interval = dataset.itemInterval;
                break;
            case 'electric':
                this.interval = dataset.elecInterval;
                break;
            case 'circuit':
                this.interval = dataset.circInterval;
                break;
            case 'pollution':
                this.interval = dataset.pollInterval;
                break;
        }
        this.load();
    }
    load() {
        // grabs the specified data from the dataset, then calculates the summary values. Depending on 'filter', different datasets are used
        if (this.category == 'item') {
            this.values = this.dataset.getItemDataset(this.label, this.specifier, this.scale, this.radix);
        }
        else if (this.category == 'electric') {
            this.values = this.dataset.getElectricDataset(this.label, this.specifier, this.network, this.scale, this.radix);
        }
        else if (this.category == 'circuit') {
            this.values = this.dataset.getCircuitDataset(this.label, this.network, this.scale, this.radix);
        }
        else if (this.category == 'pollution') {
            this.values = this.dataset.getPollutionDataset(this.scale, this.radix);
        }
        if (this.values)
            this.recalculate();
        else
            console.log(this);
    }
    /*
    * This function is used to 'chain' 2  dataset fragments together. This will take the current fragment as the 'top' in the ratio, and the given fragment as the 'bottom'.
    * So, this can then produce a dataset such that 'iron-plates produced' per 'pollution produced' can be calculated.
    * */
    per(filter) {
        let bottomFragment;
        if (filter === null || filter === void 0 ? void 0 : filter.values) {
            // if we are given a DatasetFragment, we can just use that directly
            return new DatasetRatio(this, filter);
        }
        else {
            bottomFragment = new DatasetFragment(this.dataset, filter);
            // Create a new DatasetRatio using this fragment as the top, and the bottom fragment as the bottom
            return new DatasetRatio(this, bottomFragment);
        }
    }
}
exports.DatasetFragment = DatasetFragment;
// The final 'ratio' of some dataset, of <key> per <key>.
class DatasetRatio extends DatasetSubset {
    get desc() {
        return this.top.desc + ' per ' + this.bottom.desc;
    }
    // Describe what this represents
    get descData() {
        return `on average, ${this.avg} ${this.desc}`;
    }
    // Will take in  2 datasets, and be able to return various information about its ratio between the two
    constructor(top, bottom, dataSettings) {
        if (!top || !bottom)
            throw new Error('Both top and bottom are required to create a DatasetRatio');
        if (top.interval != bottom.interval)
            throw new Error('Both top and bottom must have the same interval to create a DatasetRatio. Top: ' + top.interval + ' Bottom: ' + bottom.interval);
        super(top.dataset);
        this.label = (dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.label) ? dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.label : `${top.label} / ${bottom.label}`;
        this.category = (dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.category) ? dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.category : `${top.category} / ${bottom.category}`;
        this.specifier = (dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.spec) ? dataSettings === null || dataSettings === void 0 ? void 0 : dataSettings.spec : `${top === null || top === void 0 ? void 0 : top.specifier} / ${bottom === null || bottom === void 0 ? void 0 : bottom.specifier}`;
        if (dataSettings) {
            this.scale = dataSettings.scale;
            this.radix = dataSettings.radix;
        }
        this.interval = top.interval;
        this.top = top;
        this.bottom = bottom;
        this.load();
    }
    // calculate the needed ratio data again.
    load() {
        // Verify if they have been processed yet - else, call load as needed
        if (!this.top.values)
            this.top.load();
        // also for bottom
        if (!this.bottom.values)
            this.bottom.load();
        this.values = [];
        // Now - we need to go about actually calculating this ratio for each value in their datasets.
        /// if the bottom is not defined, it can be assumed to be 0. This isn't possible in math, so we will log 'null' for this value.
        // We first need to get a list of all ticks that exist in both datasets. This will be the 'intersection' of the two datasets.
        const bottomMap = lodash_1.default.groupBy(this.bottom.values, 'tick');
        for (let top of this.top.values) {
            // We will compare top and bottom data 1 tick at a time. If we have multiple TOP values for a single tick, that's fine, they will remain
            // multiple BOTTOM records for a single tick will be summed together, as they are all the same tick.
            // For eac hvalue in 'top', we will find the matching value in 'bottom' and calculate the ratio.
            // Get the matching bottom value for this tick
            const bottom = bottomMap[top.tick];
            if (!bottom) {
                // If there is no bottom value for this tick, then we can't calculate a ratio. We will log 'null' for this value.
                this.values.push({
                    tick: top.tick,
                    value: null,
                    label: top.label,
                    spec: top.spec,
                });
                continue;
            }
            // We will sum all bottom values together, and then calculate the ratio
            const bottomSum = lodash_1.default.sumBy(bottom, 'value');
            this.values.push({
                tick: top.tick,
                value: top.value / bottomSum,
                label: top.label,
                spec: top.spec,
            });
        }
        this.recalculate();
    }
}
exports.DatasetRatio = DatasetRatio;
//# sourceMappingURL=Dataset.js.map