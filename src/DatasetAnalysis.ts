import {
    IGameFlow, IGameFlowCircuitResults,
    IGameFlowCircuitTick, IGameFlowItemResults,
    IGameFlowItemTick, IGameFlowPollutionResults,
    IGameFlowPollutionTick, IGameFlowResults, IGameFlowSystemResults,
    IGameFlowSystemTick,
    IPlotData
} from "./Dataset";
import _, {Dictionary} from "lodash";
import {Logging} from "./Logging";


/*
* Need a class that can be overridden to provide some details of a dataset
* should give good helper functions for use in the class only (protected)
* This will be used to replace 'averageConsByLabel' by just replacing it with a 'object' representing the math done
* Users can then use their own analysis as well from this package
* This also means that the 'return' values should be in an array
* */

export interface IDatasetQueryOptions {
    startTick?: number
    endTick?: number
    labelFilter?: string,
    valueField?: 'cons' | 'prod' | 'count' | string,
    smoothing?: number,
    excludeEmpty?: boolean
}

export interface IDatasetStats {
    valueField: string,
    sum: number,
    min: number,
    max: number,
    avg: number,
    count: number,
    stddev: number,
    description?: string
}

// A query, meant to filter a dataset (of some type) and return a new dataset
export class DatasetQuery<TickType extends IGameFlow> implements IDatasetQueryOptions {

    dataset: TickType[];

    // Info about the dataset
    startTick: number;
    endTick: number;
    labelFilter: string;
    valueField: 'cons' | 'prod' | 'count' | string;
    smoothing: number;
    excludeEmpty: boolean;
    tickInterval: number;

    constructor(dataRecords: TickType[], options: IDatasetQueryOptions) {
        this.dataset = dataRecords;

        // calculate TickInterval by taking the difference in ticks between the first 2 ticks of the dataset
        this.calculateTickInterval()

        this.labelFilter = options?.labelFilter;
        this.valueField = options?.valueField;
        this.smoothing = options?.smoothing;
        this.excludeEmpty = options?.excludeEmpty;
        this.startTick = options?.startTick ?? this.findStartTick(this.dataset)
        this.endTick = options?.endTick ?? this.findEndTick(this.dataset)

        if (options?.startTick || options?.endTick)
            this.dataset = this.trimToFilter(this.dataset)

        if (this.labelFilter || this.valueField || this.excludeEmpty)
            this.dataset = this.applyFilter(this.dataset)
    }

    calculateTickInterval() {
        // uses  built in  dataset on construction
        // dataset can contain many records for 1 tick - need to find the first 2 unique tick values
        // then subtract to find the interval

        let firstTick = _.minBy(this.dataset, 'tick').tick;
        let secondTick = _.minBy(_.filter(this.dataset, (o: any) => {
            return o.tick != firstTick
        }), 'tick').tick;
        this.tickInterval = secondTick - firstTick;
        return this.tickInterval
    }

    uniqueLabels(dataset: TickType[] = this.dataset): string[] {
        return _.uniq(_.map(dataset, 'label'))
    }

    groupByLabel(dataset: TickType[] = this.dataset): Dictionary<TickType[]> {
        return _.groupBy(dataset, (o: any) => {
            return o.label
        })
    }

    groupByTickChunk(dataset: TickType[], tickChunkSize: number): Dictionary<TickType[]> {
        // take the math.floor() value and multiply by tickChunkSize to get the start tick
        return _.groupBy(dataset, (o: any) => {
            return Math.floor(o.tick / tickChunkSize) * tickChunkSize
        })
    }

    summaryByLabel(dataset: TickType[] = this.dataset): Dictionary<IDatasetStats> {

        // this will also require the 'valueField' to be set, so we know which field to target
        // this will return a dictionary of labels, with the valueField as the value field used
        // instead of returning the records themselves, find the min, max, avg, count, stddev
        if (!this.valueField)
            throw new Error('Cannot create summary by label! Value field is null - don\'t know what field to use for value');

        let ret: Dictionary<IDatasetStats> = {}
        let grouped = this.groupByLabel(dataset)

        for (let label in grouped) {
            let values = _.map(grouped[label], this.valueField);
            // desc should describe what the data represents - so "'valueField' of "=
            ret[label] = {
                description: `${this.valueField} of ${label} per ${this.tickInterval} ticks`,
                valueField: this.valueField,
                sum: _.sum(values),
                min: _.min(values),
                max: _.max(values),
                avg: _.sum(values) / values.length,
                count: values.length,
                // calculate standard deviation
                stddev: DatasetAnalysis.calculateStdDev(values)
            }
        }
        return ret;
    }

    summaryByTickChunk(dataset: TickType[] = this.dataset, tickChunkSize: number = 600, convertToSeconds: boolean = true): Dictionary<IDatasetStats> {
        Logging.log('info', `Creating summary by tick chunk of ${tickChunkSize} ticks for dataset of ${dataset.length} records`)

        // this will also require the 'valueField' to be set, so we know which field to target
        // this will return a dictionary of labels, with the valueField as the value field used
        // instead of returning the records themselves, find the min, max, avg, count, stddev
        if (!this.valueField)
            throw new Error('Cannot create summary by tick chunk! Value field is null - don\'t know what field to use for value');

        // Also going to require label filter here - otherwise, data doesnt mean much summarized
        if (!this.labelFilter)
            throw new Error('Cannot create summary by tick chunk! Label filter is null - don\'t know what label to use for filtering');

        // #TODO implement changes here to convert to seconds if needed. build desc separately first

        let ret: Dictionary<IDatasetStats> = {}
        let grouped = this.groupByTickChunk(dataset, tickChunkSize)

        // Could translate this to 'items' per second ((value * tickInterval) / 60)
        for (let label in grouped) {
            let values = _.map(grouped[label], this.valueField);
            // desc should describe what the data represents - so "'valueField' of "=
            ret[label] = {
                description: `${this.valueField}` + (this.labelFilter ? ` of ${this.labelFilter}` : '') + ` from ${label} to ${Number.parseInt(label) + tickChunkSize} per ${this.tickInterval} ticks`,
                valueField: this.valueField,
                sum: _.sum(values),
                min: _.min(values),
                max: _.max(values),
                avg: _.sum(values) / values.length,
                count: values.length,
                // calculate standard deviation
                stddev: DatasetAnalysis.calculateStdDev(values)
            }
        }
        return ret;
    }

    // Trims the dataset to be within startTick and endTick, if set
    // if ONE not set, fill as needed with min/max. If BOTH not set, do nothing, return dataset
    protected trimToFilter(dataset?: TickType[]): TickType[] {
        if (!this.startTick)
            this.startTick = this.findStartTick(dataset)
        if (!this.endTick)
            this.endTick = this.findEndTick(dataset)
        return _.filter(dataset, (o: any) => {
            return o.tick >= this.startTick && o.tick <= this.endTick
        })
    }

    /*
    * Using labelField, valueField, smoothing, and excludeEmpty, filter the dataset as follows
    * 1. if labelField is set, filter out all ticks that 'label' do not match the labelField
    * 2. if valueField is set and excludeEmpty is true, filter out all ticks that tick['valueField'] is 0
    * */
    protected applyFilter(dataset: TickType[]): TickType[] {
        return _.filter(dataset, (t) => {
            if (this.labelFilter && t.label != this.labelFilter)
                return false;
            if (this.valueField && this.excludeEmpty && t[this.valueField] == 0)
                return false;
            return true;
        })
    }

    /*
    * Queries the dataset, finding the first tick that matches the labelField
    * Does not filter on ticks, but does filter on the rest (empty, label, etc etc)
    * */
    protected findStartTick(dataset: TickType[]): number {
        return _.minBy(dataset, (t) => {
            return t.tick
        }).tick
    }

    /*
    * Queries the dataset, finding the last tick that matches the labelField
     */
    protected findEndTick(dataset: TickType[]): number {
        return _.maxBy(dataset, (t) => {
            return t.tick
        }).tick
    }
}

export class DatasetAnalysis {

    static calculateStdDev(array: number[]): number {
        if (array.length === 0)
            return 0

        let sum = array.reduce((a, b) => a + b, 0);
        let avg = sum / array.length;

        let sqDiffSum = array.map(n => Math.pow(n - avg, 2))
            .reduce((a, b) => a + b, 0);

        return Math.sqrt(sqDiffSum / array.length);
    }

    public static createPlotDataFromDataset(dataset: IGameFlowItemTick[] | IGameFlowCircuitTick[] |
                                                IGameFlowPollutionTick[] | IGameFlowSystemTick[],
                                            startTick: number, endTick: number, labelField: string,
                                            valueField: 'cons' | 'prod' | 'count' | string, smoothing: number = 1,
                                            excludeEmpty: boolean = false): IPlotData[] {

        Logging.log('info', `Creating plot data from dataset of ${dataset.length} records`)

        // takes a subset of the dataset, returning a new dataset with only the specified range
        // if data uses cons/prod, those fields are used, otherwise Count is looked for. Else, throws error
        if (dataset.length == 0)
            return []

        if (!valueField)
            throw new Error("Cannot create plot data! Value field is null - don't know what field to use for 'y' coordinate");

        // a labelField is not 'required' - if not provided, results may contain mixed labels (items)

        let ret: IPlotData[] = []
        let tempDs = new DatasetQuery<IGameFlow>(dataset, {
            startTick,
            endTick,
            labelFilter: labelField,
            valueField,
            smoothing,
            excludeEmpty
        })

        // convert into our x,y format, using valueField as the y value
        ret = _.map(tempDs, (o: any) => {
            return {
                x: o.tick,
                y: o[valueField],
                label: o.label,
                tag: valueField
            }
        })

        // smooth our data if need be
        if (smoothing > 1) {
            ret = DatasetAnalysis.smoothData(ret, smoothing)
        }

        return ret;
    }


    static smoothData(data: IPlotData[], smooth: number): IPlotData[] {
        Logging.log('info', `Smoothing ${data.length} data points with smooth factor of ${smooth}`)
        let smoothedData: IPlotData[] = [];
        if (smooth >= 1 && data.length >= smooth) {
            for (let i = 0; i < data.length - smooth + 1; i++) {
                const windowData = data.slice(i, i + smooth);

                const sum = windowData.reduce((acc, cur) => acc + cur.y, 0);
                const average = sum / smooth;

                smoothedData.push({
                    x: data[i + Math.floor(smooth / 2)].x,
                    y: average,
                    label: data[i + Math.floor(smooth / 2)].label,
                    tag: data[i + Math.floor(smooth / 2)].tag
                });
            }
            Logging.log('verbose', `Smoothed ${data.length} down to ${smoothedData.length}`)
        } else
            smoothedData = data;
        return smoothedData;
    }

    public static createSubsetOfDataset(dataset: IGameFlow[],
                                        startTick: number, endTick: number, labelField: string = null, excludeEmpty: boolean = false) {
        return _.filter(dataset, (o: any) => {
            return o.tick >= startTick && o.tick <= endTick && ((labelField && o.label == labelField) || !labelField)
        })
    }

    public static createSummaryOfGenericDataset(result: IGameFlowResults, startTick: number = undefined, endTick: number = undefined): IGameFlowResults {
        Logging.log('info', `Creating summary of generic dataset of ${result.data.length} records`)

        if (!result)
            throw new Error('Cannot create summary of generic dataset! Input is null');


        let tempDs: IGameFlow[] = result.data
        if (startTick != undefined && endTick != undefined) {
            tempDs = DatasetAnalysis.createSubsetOfDataset(tempDs, startTick, endTick)
        }
        result.data = tempDs;

        result.minTick = _.minBy(result.data, 'tick')?.tick;
        result.maxTick = _.maxBy(result.data, 'tick')?.tick;
        result.labels = _.uniq(_.map(result.data, 'label'));
        return result;
    }

    public static createSummaryOfItemDataset(result: IGameFlowItemResults, startTick: number = undefined, endTick: number = undefined): IGameFlowItemResults {
        Logging.log('info', `Creating summary of item dataset of ${result.data.length} records`)
        // passed in is the 'empty' version, with only data and trial defined
        // we now need to do all the math here
        if (!result)
            throw new Error('Cannot create summary of item dataset! Input is null');

        // filter out data (ticks)
        let tempDs: IGameFlowItemTick[] = result.data
        if (startTick != undefined && endTick != undefined) {
            tempDs = DatasetAnalysis.createSubsetOfDataset(tempDs, startTick, endTick)
        }
        result.data = tempDs;

        // create summary data - generics first, then our own
        result = (this.createSummaryOfGenericDataset(result) as IGameFlowItemResults)
        //
        // // prepare maps
        // result.averageConsByLabel = {};
        // result.averageProdByLabel = {};
        //
        // // for each label, we need to calculate the average consumption and production
        // let secondsLength = result.trial.length / (60)
        // for (let l of result.labels) {
        //     let lData = _.filter(result.data, (o: any) => {
        //         return o.label == l
        //     })
        //     let totalCons = _.sumBy(lData, 'cons');
        //     let totalProd = _.sumBy(lData, 'prod');
        //
        //     result.averageConsByLabel[l] = totalCons / secondsLength;
        //     result.averageProdByLabel[l] = totalProd / secondsLength;
        // }
        return result;
    }

    public static createSummaryOfCircuitDataset(result: IGameFlowCircuitResults, startTick: number = undefined, endTick: number = undefined): IGameFlowCircuitResults {
        Logging.log('info', `Creating summary of circuit dataset of ${result.data.length} records`)
        // passed in is the 'empty' version, with only data and trial defined
        // we now need to do all the math here
        if (!result)
            throw new Error('Cannot create summary of circuit dataset! Input is null');

        // filter out data (ticks)
        let tempDs: IGameFlowCircuitTick[] = result.data
        if (startTick != undefined && endTick != undefined) {
            tempDs = DatasetAnalysis.createSubsetOfDataset(tempDs, startTick, endTick)
        }
        result.data = tempDs;

        // need to implement more here for summary data - for now, just subsets if provided
        return result;
    }

    public static createSummaryOfPollutionDataset(result: IGameFlowPollutionResults, startTick: number = undefined, endTick: number = undefined): IGameFlowPollutionResults {
        Logging.log('info', `Creating summary of pollution dataset of ${result.data.length} records`)
        // passed in is the 'empty' version, with only data and trial defined
        // we now need to do all the math here
        if (!result)
            throw new Error('Cannot create summary of pollution dataset! Input is null');

        // filter out data (ticks)
        let tempDs: IGameFlowPollutionTick[] = result.data
        if (startTick != undefined && endTick != undefined) {
            tempDs = DatasetAnalysis.createSubsetOfDataset(tempDs, startTick, endTick)
        }
        result.data = tempDs;

        // need to implement more here for summary data - for now, just subsets if provided
        return result;
    }

    public static createSummaryOfSystemDataset(result: IGameFlowSystemResults, startTick: number = undefined, endTick: number = undefined): IGameFlowSystemResults {
        Logging.log('info', `Creating summary of system dataset of ${result.data.length} records`)
        // passed in is the 'empty' version, with only data and trial defined
        // we now need to do all the math here
        if (!result)
            throw new Error('Cannot create summary of system dataset! Input is null');

        // filter out data (ticks)
        let tempDs: IGameFlowSystemTick[] = result.data
        if (startTick != undefined && endTick != undefined) {
            tempDs = DatasetAnalysis.createSubsetOfDataset(tempDs, startTick, endTick)
        }
        result.data = tempDs;

        // need to implement more here for summary data - for now, just subsets if provided
        return result;
    }

}
