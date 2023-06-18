/*
* this class  will be in charg of managing an entire dataset about a given Trial.
*
* Any Dataset ultimately is tied to a Trial, but we split the functionality for organization and expansion in the future
*
* It is ONLY concerned with output data, and how we may want to transform / use that data.
*
* */
import fs from "fs-extra";
import {Trial} from "./Trial";
import path from "path";
import _ from "lodash";

export interface IDatasetParams {

    // Time that this trial was 'execution started' at
    execStartTime: Date;

    // The trial reference, or UID of the trial that this dataset is from
    trial: string | Trial;

    // Raw system data from the executable output
    rawSysData: string;

    // Tick interval settings for rate  reference. NOT REQUIRED IF 'Trial' object is passed, is if done by ID
    intervals?: IDatasetIntervals;

}

// a object that represents the various 'tick' settings that are defined in ITrialParams.
export interface IDatasetIntervals {
    itemInterval?: number;
    elecInterval?: number;
    circInterval?: number;
    pollInterval?: number;
    sysInterval?: number;
}

// Represents the struct that
export interface IDatasetMeta {

    // The number of 'ticks' run in the simulation
    updates: number;

    // the average time per tick
    avg: number;

    // minimum time per tick
    min: number;

    // maximum time per tick. This is almost ALWAYS high due to how we record stats and set up the scenario in tick 0
    max: number;

    // how many datapoints were taken - a trial running for 5 seconds (300 ticks) with a 5 tick interval would have 60 datapoints
    points?: number;

    // The amount of time that the 'trial' supposedly took - this is retrieved from the results of the executable. This is NOT calculated, just trusted from the executable
    trialTime: number;

    // The amount of time between 'execution' of the factorio executable and the 'end'. Aka, the time between 'ending' the executable and 'finishing' the trial
    parseTime: number;

    // Total time from function call to function return - round trip. From function call start, to function return with processing
    totalTime: number;

    // The time of actual 'execution' of the trial. Aka, the time it took to run the factorio executable. Not calculated, determined from text log output of executable
    execTime: number;
}

export interface IGameFlowTick {
    cons: number;
    prod: number;
    // Label represents the 'name' of the item, such as 'iron-plate' or 'solar-panel' for elec
    label: string;
    tick: number;
}

export interface IGamePollutionTick {
    count: number;
    tick: number;
}

export interface IGameCircuitTick {
    // this represents a single 'tick' of a circuit network. Each network has its own ID
    circuitId: number;
    color: string;
    tick: number;

    // 'signals' is the actual array of signals in this network
    signals: IGameCircuitSignal[];
}

export interface IGameElectricTick {
    networkId?: number;
    cons: number;
    prod: number;
    label: string
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
    tick: number
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


export interface IGameDataItem {
    // cons or prod. Consumption of item or production of it
    label: string;          // The item name
    spec?: string | number;   // The direction of the item.
    // For signals, this is the signal ID instead.
    // For electric data, this is the network ID.
    // If this ever == 'all', it means it includes ALL electric data or ALL circuit data.
    // ALL for items just means it includes cons+prod
    // not used for pollution data
    value: number;          // The value of the item
    tick: number;           // The tick this data was recorded at. Calculated by tickInterval * rowNumber
}

export interface IDatasetTemplate {

    // the array of values that this dataset fragment represents - this is the 'raw' data that we are summarizing. Each index of values lines  up to the same index in ticks
    values: IGameDataItem[];

    // total sum of the Values array
    total: number;

    // min/max values of the Values array
    min: number;
    max: number;

    // average and stddev values
    avg: number;
    std: number;
}

export class Dataset {

    // variable saving the 'interval' value used to create this dataset. This is ESSENTIAL to processing the data correctly
    private cachedIntervals: IDatasetIntervals;

    get itemInterval(): number {
        return this.cachedIntervals.itemInterval;
    }

    get elecInterval(): number {
        return this.cachedIntervals.elecInterval;
    }

    get circInterval(): number {
        return this.cachedIntervals.circInterval;
    }

    get pollInterval(): number {
        return this.cachedIntervals.pollInterval;
    }

    // timestamp of the trial start (and end) time. Used to calculate more values about the trial
    startedAt?: Date;
    endedAt?: Date;

    // The timestamp of the actual factorio executable start time. Used to calculate more values about the trial
    execStartTime: Date;

    // Raw system data from process output - contains both system tick data and text logs
    rawSysData: string

    // A reference to the TrialID that this dataset is from. Set during creation.
    trialId: string;

    // metadata about the dataset. Is undefined until processing is completed.
    meta: IDatasetMeta;

    // Item stats information
    itemStats: IGameFlowTick[];

    // Electric network information
    elecStats: IGameElectricTick[];

    // Circuit network information
    circStats: IGameCircuitTick[];

    // Pollution network information
    pollStats: IGamePollutionTick[];

    // System stats information
    sysStats: ISystemTick[];

    // Raw text logs of the
    textLogs: string[];

    // This map object is only used if the dataset is being left 'raw' - allows for manual use of raw files (and a reminder to clean them up!)
    files?: any;

    // Flag of whether or not 'process' was called successfully yet
    isProcessed: boolean = false;

    // execStartTime is used for some additional calculations about summary data
    constructor(params: IDatasetParams) {

        // set the intervals
        if (params.trial && params.trial instanceof Trial) {
            this.cachedIntervals = {
                itemInterval: params.trial.itemInterval,
                elecInterval: params.trial.elecInterval,
                circInterval: params.trial.circInterval,
                pollInterval: params.trial.pollInterval,
                sysInterval: params.trial.sysInterval
            }
            this.trialId = params.trial.id;
            // LInk the trial passed in to this new dataset
            this.startedAt = params.trial.startedAt;
            this.endedAt = params.trial.endedAt;
        } else {
            this.cachedIntervals = params.intervals;
            this.trialId = params.trial as string;
        }
        if (this.cachedIntervals == undefined || this.trialId == undefined) {
            throw new Error("Cannot create dataset without intervals. Please pass a trial object, or trialID + intervals object")
        }

        // set raw system data, if exists
        this.rawSysData = params.rawSysData
        this.execStartTime = params.execStartTime;
    }

    skipProcess(dirPath: string) {
        // used to build the filepaths for later processing
        this.files = {
            itemData: path.join(dirPath, 'data', `${this.trialId}_item.jsonl`),
            elecData: path.join(dirPath, 'data', `${this.trialId}_elec.jsonl`),
            circData: path.join(dirPath, 'data', `${this.trialId}_circ.jsonl`),
            pollData: path.join(dirPath, 'data', `${this.trialId}_poll.jsonl`),
        }
    }

    // Loads files and processes data to generate metadata and usable datasets
    process(dirPath: string) {
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

        let execTime: number = (Number.parseFloat(perfTime)) * 1000;

        // Parse out our item information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.itemInterval) {
            let itemRaw = fs.readFileSync(path.join(dirPath, 'data', `${this.trialId}_item.jsonl`), 'utf8');
            this.itemStats = Dataset._parseGameFlowData(itemRaw, this.cachedIntervals.itemInterval)
        }
        // Parse out our electric information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.elecInterval) {
            let elecRaw = fs.readFileSync(path.join(dirPath, 'data', `${this.trialId}_elec.jsonl`), 'utf8');
            this.elecStats = Dataset._parseGameElectricData(elecRaw, this.cachedIntervals.elecInterval)
        }
        // Parse out our circuit information, passing in interval to help bind a 'data poll index' to a 'game tick'
        if (this.cachedIntervals.circInterval) {
            let circRaw = fs.readFileSync(path.join(dirPath, 'data', `${this.trialId}_circ.jsonl`), 'utf8');
            this.circStats = Dataset._parseGameCircuitData(circRaw, this.cachedIntervals.circInterval)
        }
        // Parse out our pollution information
        if (this.cachedIntervals.pollInterval) {
            let pollRaw = fs.readFileSync(path.join(dirPath, 'data', `${this.trialId}_poll.jsonl`), 'utf8');
            this.pollStats = Dataset._parseGamePollutionData(pollRaw, this.cachedIntervals.pollInterval)
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
        }

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
    get(filter: IDatasetFilter): DatasetFragment {
        // fragment will retrieve the needed data just after creation, or throw error trying. Everything can be chained off of here
        return new DatasetFragment(this, filter);
    }

    /*
    * Returns the item dataset in the IGameDataItem format, for easy usage outisde the package
    * -- label - if provided, will filter the results to only those that match the label (name). If not provided, or if 'all', all items will be returned
    * -- spec - if provided, will filter the results to only those that match the spec (cons/prod). If not provided, or if 'all', cons+prod will be returned
    * */
    getItemDataset(label?: string, spec?: string, scale?: number, radix?: number): IGameDataItem[] {
        if (!this.itemStats)
            return [];

        let dArr: IGameFlowTick[] = [];
        let results: IGameDataItem[] = [];
        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by
            dArr = this.itemStats.filter((i) => {
                return i.label == label;
            });
        } else {
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
        } else {
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
                })
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: pVal,
                    spec: 'prod'
                })
            }
        }

        return results
    }

    /*
    * Returns the elec dataset in the IGameDataFormat, for easy usage outside the package
    * -- label - if provided, will filter the results to only those that match the label (name). If not provided, or if 'all', all items will be returned
    * -- spec - if provided, will filter the results to only those that match the spec (cons/prod). If not provided, or if 'all', cons+prod will be returned.
    * -- network - if provided, will filter the results to only those that match the network id. If not provided, all networks will be returned
    * -- scale - if provided, will scale the results by the provided value (dividing by scale). If not provided, no scaling will be done. Recommended to use this as '1000' for kW, '1000000' for MW, etc
    * -- radix - if provided, will round the results to the provided radix. If not provided, no rounding will be done. Recommended to use this as '2' for 2 decimal places.
    * */
    getElectricDataset(label?: string, spec?: string, network?: number, scale?: number, radix?: number): IGameDataItem[] {
        if (!this.elecStats)
            return [];

        let dArr: IGameElectricTick[] = [];
        let results: IGameDataItem[] = [];

        // filter down by network, if provided
        if (network) {
            dArr = this.elecStats.filter((i) => {
                return i.networkId == network;
            });
        } else {
            dArr = this.elecStats;
        }

        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by
            dArr = dArr.filter((i) => {
                return i.label == label;
            });
        } else {
            // means that label either DOESNT exist, or is 'all'. So, use entire dataset, 1 record per tick.
            let gd = _.groupBy(dArr,'tick');

            let k = Object.keys(gd);
            let nArr = [];
            for (let i of k) {
                let v = gd[i];
                // summarize 'v' into 1 record, add to dArr
                nArr.push({
                    tick: i,
                    label: 'all',
                    cons: _.sumBy(v,'cons'),
                    prod: _.sumBy(v,'prod')
                })
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
        } else {
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
                })
                results.push({
                    tick: i.tick,
                    label: i.label,
                    value: pVal,
                    spec: 'prod'
                })
            }
        }

        return results;
    }

    /*
    * Returns the circuit  dataset in the IGameDataFormat, for easy usage outsid the package
    * -- label - if provided, will filter the results to only those signals that match the label (name). If not provided, or if 'all', all items will be returned
    * -- network - if provided, will filter the results to only those signals that match the network id. If not provided, all networks will be returned overlaid on top of each other.
    * */
    getCircuitDataset(label?: string, network?: number, scale?: number, radix?: number): IGameDataItem[] {
        if (!this.circStats)
            return [];

        let dArr: IGameCircuitTick[] = [];
        let results: IGameDataItem[] = [];
        if (label && label != 'all') {
            // means the label exists, and is some value we should filter by. Remove all entries that don't have a signla with this label
            dArr = this.circStats.filter((i) => {
                return i.signals.some((s) => {
                    return s.signal?.name == label;
                });
            })
        } else {
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
                if (label && label != 'all' && s.signal?.name != label)
                    continue;

                let val = s.count;
                if (scale)
                    val = val / scale;
                if (radix)
                    val = +val.toFixed(radix);

                results.push({
                    tick: i.tick,
                    label: network ? s.signal?.name : `${i.circuitId}:${s.signal?.name}`,
                    value: val,
                    spec: 'count'
                })
            }
        }

        return results;
    }

    /*
    * Returns the pollution dataset in the IGameDataFormat, for easy usage outside the package
    * No parameters are needed here - the pollution dataset is a single dataset, and is not broken down by network or label. Simple!
    * */
    getPollutionDataset(scale?: number, radix?: number): IGameDataItem[] {
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
            }
        })
    }

    /*
    * Private Static utility functions below - all used in the parsing of core data during the 'process' function
    * If any changes are needed to how data is processed, it's likely below.
    * */

    private static _parseGamePollutionData(raw: string, tickInterval: number): IGamePollutionTick[] {
        let results: IGamePollutionTick[] = [];
        let lines = raw.split('\n');

        // Now, need to sort through the list of lines and parse out the data
        for (let i = 0; i < lines.length - 1; i++) {
            let l = lines[i];

            // each line is a object with 1 field - pollution. This is a float
            let lData = JSON.parse(l);
            results.push({
                tick: (i + 1) * tickInterval,
                count: lData.pollution
            })
        }
        return results;
    }

    // Parses out the item flow stats from the raw loaded data.
    private static _parseGameFlowData(raw: string, tickInterval: number): IGameFlowTick[] {
        let results: IGameFlowTick[] = [];
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
                let ir: IGameFlowTick = itemMap[c];

                if (ir) {
                    // Update the cons value, as there is nothing else it can be.
                    ir.cons = lineParsed.cons[c];
                } else {
                    // No object record exists yet - create and set it
                    itemMap[c] = {
                        label: c,
                        tick: (i + 1) * tickInterval,
                        cons: lineParsed.cons[c],
                        prod: 0,
                    } as IGameFlowTick;
                }
            }

            let po = Object.keys(lineParsed.prod);
            for (let p of po) {

                // the item record if it exists
                let ir: IGameFlowTick = itemMap[p];

                if (ir) {
                    // Update the cons value, as there is nothing else it can be.
                    ir.prod = lineParsed.prod[p];
                } else {
                    // No object record exists yet - create and set it
                    itemMap[p] = {
                        label: p,
                        tick: (i + 1) * tickInterval,
                        cons: 0,
                        prod: lineParsed.prod[p],
                    } as IGameFlowTick;
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
    private static _parseGameElectricData(raw: string, tickInterval: number): IGameElectricTick[] {
        let results: IGameElectricTick[] = [];
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
                    let ir: IGameElectricTick = itemMap[c];

                    if (ir) {
                        // Update the cons value, as there is nothing else it can be.
                        ir.cons = kData.cons[c];
                    } else {
                        // No object record exists yet - create and set it
                        itemMap[c] = {
                            networkId: Number.parseInt(lineKeys[j]),
                            label: c,
                            tick: (i + 1) * tickInterval,
                            cons: kData.cons[c],
                            prod: 0,
                        } as IGameElectricTick;
                    }
                }

                let po = Object.keys(kData.prod);
                for (let p of po) {

                    // the item record if it exists
                    let ir: IGameElectricTick = itemMap[p];

                    if (ir) {
                        // Update the prod value, as there is nothing else it can be.
                        ir.prod = kData.prod[p];
                    } else {
                        // No object record exists yet - create and set it
                        itemMap[p] = {
                            networkId: Number.parseInt(lineKeys[j]),
                            label: p,
                            tick: (i + 1) * tickInterval,
                            cons: 0,
                            prod: kData.prod[p]
                        } as IGameElectricTick;
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
    private static _parseSystemTickData(raw: string, tickInterval: number): ISystemTick[] {
        let lines = raw.split('\n');
        // First line is headers, so we remove it
        lines.shift();
        // Now we have an array of strings, each string being a line of csv data
        let results: ISystemTick[] = [];
        let currentTickItem: ISystemTick = null;
        let currentSetCount: number = 0;
        let runningTimestamp: number = 0;
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
                }
            } else {
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
    private static _parseGameCircuitData(raw: string, tickInterval: number): IGameCircuitTick[] {
        let results: IGameCircuitTick[] = [];
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
                    signals: kData.signals as IGameCircuitSignal[]
                });
            }
        }
        return results;
    }
}

// The base class of many subsets of the Dataset
// Fragment makes up a single smaller subset of data from a Dataset
// Ratio makes up a comparable ratio of 2 fragments
// all share the same functionality


/*
* GOALS
* 1. Dataset rework - the 'get' and 'per' functionality will now operate on entire datasets, point by point.
* 2. Will always use the 'dir' and 'count' resulting datatype, so it can be used for signal and other information as well
*     - dir would be prod or  cons, OR if its a signal, would be the signal ID
* */

// This class represents a single piece of a dataset that was retrieved - a summary value of everything in the dataset with a filter
// From there, it can then be chained with another dataset request to produce a final 'DatasetRatio'
// Can be used on item data, electric data, and pollution data.
export class DatasetFragment implements IDatasetTemplate {

    readonly dataset: Dataset;

    get desc() {
        if (this.category === 'item') {
            return `${this.label} items ${this.specifier == 'prod' ? 'produced' : 'consumed'}`
        } else if (this.category === 'electric') {
            return `${this.label} ${this.specifier == 'prod' ? 'power produced' : 'consumed power'}`
        } else if (this.category === 'pollution') {
            return `pollution ${this.specifier == 'prod' ? 'produced' : 'consumed'}`
        } else if (this.category === 'circuit') {
            return `circuit ${this.label} value on ${this.specifier}`
        }
    }

    // the 'label' used to filter results down from the dataset. Will differ depending on the category
    label: string;

    // the 'category' of data that this represents. Changes which source we read from in the dataset.
    category: 'item' | 'electric' | 'circuit' | 'pollution';

    // Direction is a specifier, changing depending on category used. If 'item' or 'electric', will be cons, prod, or 'all'. If 'circuit', will be the signal ID. If 'pollution', is not used
    specifier: string

    // Network filter - only used for electric and circuit data. otherwise undefined
    network?: number;

    // the scale value - divide all data in this dataset by this
    scale?: number;

    // the radix value - will round all data to this many decimal points
    radix?: number;

    // the array of values that this dataset fragment represents - this is the 'raw' data that we are summarizing. Each index of values lines  up to the same index in ticks
    values: IGameDataItem[];

    // the interval that this dataset was recorded at. WE CANNOT COMPARE DATA FROM DIFFERENT INTERVALS!!
    // Math is done 1-1 on each array, by tick. So if they don't have a matching tick in the other dataset, it will be skipped
    // this is just because of the basic nature of this, improvements can be made in the future
    interval: number;

    // total sum of the Values array
    total: number;

    // min/max values of the Values array
    min: number;
    max: number;

    // average and stddev values, plus median
    avg: number;
    std: number;

    // category is what data we are selecting from - assumed to be 'items' or 'electricity' or 'pollution'
    // filter should also be 'pollution' if grabbing that
    constructor(dataset: Dataset, filter: IDatasetFilter) {
        this.dataset = dataset;
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
        } else if (this.category == 'electric') {
            this.values = this.dataset.getElectricDataset(this.label, this.specifier, this.network, this.scale, this.radix);
        } else if (this.category == 'circuit') {
            this.values = this.dataset.getCircuitDataset(this.label, this.network, this.scale, this.radix);
        } else if (this.category == 'pollution') {
            this.values = this.dataset.getPollutionDataset(this.scale, this.radix);
        }

        if (this.values)
            this.recalculate();
        else
            console.log(this);
    }

    recalculate() {
        // calcs summary values from values array
        if (this.values && this.values.length > 0) {
            this.total = _.sumBy(this.values, 'value');
            this.min = _.minBy(this.values, 'value')?.value
            this.max = _.maxBy(this.values, 'value')?.value;
            this.avg = _.meanBy(this.values, 'value');
            const avg = this.avg;

            // really don't want to include the mathjs library if I don't have to
            this.std = Math.sqrt(this.values.reduce(function (sq, n) {
                return sq + Math.pow(n.value - avg, 2);
            }, 0) / (this.values.length - 1));
        } else  {
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
    apply(func: (arr: IGameDataItem[]) => IGameDataItem[]) {
        this.values = func(this.values);
        this.recalculate();
    }

    /*
    * This function is used to 'chain' 2  dataset fragments together. This will take the current fragment as the 'top' in the ratio, and the given fragment as the 'bottom'.
    * So, this can then produce a dataset such that 'iron-plates produced' per 'pollution produced' can be calculated.
    * */
    per(filter: IDatasetFilter | DatasetFragment): DatasetRatio {

        let bottomFragment: DatasetFragment;
        if ((filter as DatasetFragment)?.values) {
            // if we are given a DatasetFragment, we can just use that directly
            return new DatasetRatio(this, filter as DatasetFragment);
        } else {
            bottomFragment = new DatasetFragment(this.dataset, filter as IDatasetFilter);
            // Create a new DatasetRatio using this fragment as the top, and the bottom fragment as the bottom
            return new DatasetRatio(this, bottomFragment);
        }
    }

}

// The final 'ratio' of some dataset, of <key> per <key>.
export class DatasetRatio implements IDatasetTemplate {

    get desc() {
        return this.top.desc + ' per ' + this.bottom.desc;
    }

    // Describe what this represents
    get descData() {
        return `on average, ${this.avg} ${this.desc}`
    }

    top: DatasetFragment;
    bottom: DatasetFragment;

    // the 'label' used to filter results down from the dataset. Will differ depending on the category
    label: string;

    // the 'category' of data that this represents. Changes which source we read from in the dataset.
    category: string;

    // Direction is a specifier, changing depending on category used. If 'item' or 'electric', will be cons, prod, or 'all'. If 'circuit', will be the signal ID. If 'pollution', is not used
    specifier: string

    // the scale value - divide all data in this dataset by this
    scale?: number;

    // the radix value - will round all data to this many decimal points
    radix?: number;

    // the array of values that this dataset fragment represents - this is the 'raw' data that we are summarizing. Each index of values lines  up to the same index in ticks
    values: IGameDataItem[];

    // the interval that this dataset was recorded at. WE CANNOT COMPARE DATA FROM DIFFERENT INTERVALS!!
    // Math is done 1-1 on each array, by tick. So if they don't have a matching tick in the other dataset, it will be skipped
    // this is just because of the basic nature of this, improvements can be made in the future
    interval: number;

    // total sum of the Values array
    total: number;

    // min/max values of the Values array
    min: number;
    max: number;

    // average and stddev values, plus median
    avg: number;
    std: number;


    // Will take in  2 datasets, and be able to return various information about its ratio between the two
    constructor(top: DatasetFragment, bottom: DatasetFragment, dataSettings?: IDatasetFilter) {
        if (!top || !bottom)
            throw new Error('Both top and bottom are required to create a DatasetRatio');

        if (top.interval != bottom.interval)
            throw new Error('Both top and bottom must have the same interval to create a DatasetRatio. Top: ' + top.interval + ' Bottom: ' + bottom.interval);

        this.label = dataSettings?.label ? dataSettings?.label : `${top.label} / ${bottom.label}`;
        this.category = dataSettings?.category ? dataSettings?.category : `${top.category} / ${bottom.category}`;
        this.specifier = dataSettings?.spec ? dataSettings?.spec : `${top?.specifier} / ${bottom?.specifier}`;

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
        const bottomMap = _.groupBy(this.bottom.values, 'tick')

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
                })
                continue;
            }

            // We will sum all bottom values together, and then calculate the ratio
            const bottomSum = _.sumBy(bottom, 'value');
            this.values.push({
                tick: top.tick,
                value: top.value / bottomSum,
                label: top.label,
                spec: top.spec,
            })
        }

        this.recalculate();
    }

    recalculate() {
        // calcs summary values from values array
        if (this.values && this.values.length > 0) {
            this.total = _.sumBy(this.values, 'value');
            this.min = _.minBy(this.values, 'value').value
            this.max = _.maxBy(this.values, 'value').value;
            this.avg = _.meanBy(this.values, 'value');
            const avg = this.avg;

            // really don't want to include the mathjs library if I don't have to
            this.std = Math.sqrt(this.values.reduce(function (sq, n) {
                return sq + Math.pow(n.value - avg, 2);
            }, 0) / (this.values.length - 1));
        } else  {
            this.total = 0;
            this.min = 0;
            this.max = 0;
            this.avg = 0;
            this.std = 0;
        }
    }
}

export interface IDatasetFilter {
    category: 'item' | 'electric' | 'circuit' | 'pollution';
    label?: string;
    spec?: 'cons' | 'prod' | 'all';
    network?: number;

    // The number to divide every value in this dataset by
    scale?: number;

    // Rounding to this number of decimal places
    radix?: number;
}
