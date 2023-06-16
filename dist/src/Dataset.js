"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetRatio = exports.DatasetFragment = exports.Dataset = void 0;
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
        delete this.cachedIntervals;
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
        // both filter and direction are needed
        // fill in the blanks first - pollution does not need filter or direction.
        if (filter.category != 'pollution') {
            // require filter and direction be set - if not, throw error
            if (!filter.label || !filter.direction)
                throw new Error(`Both filter and direction are required to retrieve data from a ${filter.category} dataset`);
        }
        else {
            // if we're looking for pollution, we can ignore filter. If direction is not set, default to 'prod'
            filter.label = 'pollution';
            if (!filter.direction)
                filter.direction = 'prod';
        }
        // fragment will retrieve the needed data just after creation, or throw error trying
        return new DatasetFragment(this, filter);
        // any other processing is done via the fragment, likely using 'per' function
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
                            cons: kData.cons[c],
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
                            prod: kData.prod[p]
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
// This class represents a single piece of a dataset that was retrieved - a summary value of everything in the dataset with a filter
// From there, it can then be chained with another dataset request to produce a final 'DatasetRatio'
// Can be used on item data, electric data, and pollution data.
class DatasetFragment {
    get desc() {
        if (this.category === 'item') {
            return `${this.label} items ${this.direction == 'prod' ? 'produced' : 'consumed'}`;
        }
        else if (this.category === 'electric') {
            return `${this.label} ${this.direction == 'prod' ? 'power produced' : 'consumed power'}`;
        }
        else if (this.category === 'pollution') {
            return `pollution ${this.direction == 'prod' ? 'produced' : 'consumed'}`;
        }
    }
    // category is what data we are selecting from - assumed to be 'items' or 'electricity' or 'pollution'
    // filter should also be 'pollution' if grabbing that
    constructor(dataset, filter) {
        this.dataset = dataset;
        this.label = filter.label;
        this.category = filter.category;
        this.direction = filter.direction;
        this.load();
    }
    load() {
        var _a;
        // grabs the specified data from the dataset, then calculates the summary values. Depending on 'filter', different datasets are used
        if (this.category == 'item') {
            const dir = this.direction;
            const label = this.label;
            if (label === 'all') {
                this.values = this.dataset.itemStats.map(function (i) {
                    return i[dir];
                });
                this.ticks = this.dataset.itemStats.map(function (i) {
                    return i.tick;
                });
            }
            else {
                let v = this.dataset.itemStats.filter((i) => {
                    return i.label == label;
                });
                this.values = v.map(function (i) {
                    return i[dir];
                });
                this.ticks = v.map(function (i) {
                    return i.tick;
                });
            }
        }
        else if (this.category == 'electric') {
            const dir = this.direction;
            // if the filter has : in it, the number after is the network ID. Otherwise, assume all networks
            if (this.label.indexOf(':') != -1) {
                const split = this.label.split(':');
                const networkId = Number.parseInt(split[1]);
                let v = this.dataset.elecStats.filter((i) => {
                    return i.label == split[0] && i.networkId == networkId;
                });
                this.values = v.map(function (i) {
                    return i[dir];
                });
                this.ticks = v.map(function (i) {
                    return i.tick;
                });
            }
            else if (((_a = this.label) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == 'all') {
                // grab all electric, regardless of label. SUM per tick
                const tg = lodash_1.default.groupBy(this.dataset.elecStats, 'tick');
                const tot = Object.keys(tg).map((k) => {
                    return {
                        tick: Number.parseInt(k),
                        cons: lodash_1.default.sumBy(tg[k], 'cons'),
                        prod: lodash_1.default.sumBy(tg[k], 'prod'),
                    };
                });
                this.values = tot.map(function (i) {
                    return i[dir];
                });
                this.ticks = tot.map(function (i) {
                    return i.tick;
                });
            }
            else {
                const tg = lodash_1.default.groupBy(this.dataset.elecStats.filter((i) => {
                    return i.label == this.label;
                }), 'tick');
                const tot = Object.keys(tg).map((k) => {
                    return {
                        tick: Number.parseInt(k),
                        cons: lodash_1.default.sumBy(tg[k], 'cons'),
                        prod: lodash_1.default.sumBy(tg[k], 'prod'),
                    };
                });
                this.values = tot.map(function (i) {
                    return i[dir];
                });
                this.ticks = tot.map(function (i) {
                    return i.tick;
                });
            }
        }
        else if (this.category == 'pollution') {
            // filter doesnt matter here, and cons/prod is just used to inverse the value if needed
            const dir = this.direction;
            this.values = this.dataset.pollStats.map((p) => {
                return p.count * (dir == 'cons' ? -1 : 1);
            });
            this.ticks = this.dataset.pollStats.map((p) => {
                return p.tick;
            });
        }
        this._recalculate();
    }
    _recalculate() {
        // calcs summary values from values array
        this.total = lodash_1.default.sum(this.values);
        this.min = lodash_1.default.min(this.values);
        this.max = lodash_1.default.max(this.values);
        this.avg = lodash_1.default.mean(this.values);
        const avg = this.avg;
        // really don't want to include the mathjs library if I don't have to
        this.std = Math.sqrt(this.values.reduce(function (sq, n) {
            return sq + Math.pow(n - avg, 2);
        }, 0) / (this.values.length - 1));
    }
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
class DatasetRatio {
    get desc() {
        return this.top.desc + ' per ' + this.bottom.desc;
    }
    // Describe what this represents
    get descData() {
        return `on average, ${this.avg} ${this.desc}`;
    }
    // Will take in  2 datasets, and be able to return various information about its ratio between the two
    constructor(top, bottom) {
        if (!top || !bottom)
            throw new Error('Both top and bottom are required to create a DatasetRatio');
        this.top = top;
        this.bottom = bottom;
        this.recalculate();
    }
    // calculate the needed ratio data again.
    recalculate() {
        // Verify if they have been processed yet - else, call load as needed
        if (!this.top.values)
            this.top.load();
        // also for bottom
        if (!this.bottom.values)
            this.bottom.load();
        // Now, we can go  calculate our ratio for each summary field.
        // NOTE - this is the ratio of 'top' to 'bottom'
        this.total = this.top.total / this.bottom.total;
        this.avg = this.top.avg / this.bottom.avg;
    }
}
exports.DatasetRatio = DatasetRatio;
//# sourceMappingURL=Dataset.js.map