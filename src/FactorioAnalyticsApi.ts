import {
    FactoryApiExecutionRequest,
    FactoryApiExecutionStatus,
    FactoryApiIngest,
    ITrialIngest
} from "./api/FactoryApiIngest";
import axios from "axios";
import {ITrial} from "./Trial";
import {ISource} from "./Source";
import {
    IGameFlowCircuitTick,
    IGameFlowElectricResults,
    IGameFlowElectricTick,
    IGameFlowItemTick,
    IGameFlowPollutionTick, IGameFlowSystemTick
} from "./Dataset";

export type TFactoryApiQueryVariant =
    'status'
    | 'source'
    | 'modlist'
    | 'trial'
    | 'data_item'
    | 'data_electric'
    | 'data_circuit'
    | 'data_pollution'
    | 'data_system'
    | 'data_all'

/*
* implement and use the API here for the package itself
* IN THE FUTURE - this should have an option to take all requests and save them LOCALLY to a database (sqlite)
*   - this way, any subsequent requests for data (if the trial is done) can be done locally
* */
export class FactorioAnalyticsApi {
    // no need to 'startup' or anything else here - just static paths that can access the API
    static async queryStatusOnTick(execId: string, interval: number = 2000): Promise<FactoryApiExecutionStatus> {
        if (interval && interval < 2000)
            interval = 2000

        return await new Promise((resolve, reject) => {
            let retryCount = 0;
            let handle = setInterval(async () => {
                try {
                    let status = await FactorioAnalyticsApi.queryStatus(execId)
                    retryCount = 0;
                    if (status?.success != null) {
                        clearInterval(handle)
                        resolve(status)
                    }
                } catch (e) {
                    retryCount++;
                    if (retryCount > 2) {
                        clearInterval(handle)
                        reject(e)
                    }
                }
            }, interval)
        })
    }

    static async submit(params: FactoryApiIngest) {
        // submit a new request to the API - same params and everything
        const resp = await axios.post('https://api.factorioanalytics.com/submit', params);
        if (resp.status === 200)
            return resp.data
        else
            throw new Error('Failed to submit request')
    }

    static async submitSource(bpStr: string): Promise<string> {
        const params: FactoryApiIngest = {
            variant: 'source',
            source: bpStr
        }
        return await FactorioAnalyticsApi.submit(params)
    }

    static async submitTrial(trialParams: ITrialIngest): Promise<FactoryApiExecutionRequest> {
        const params: FactoryApiIngest = {
            variant: 'trial',
            trial: trialParams
        }
        return await FactorioAnalyticsApi.submit(params)
    }

    static async submitModList(mods: string[]) {
        throw new Error('Not yet implemented - while modding works, starting small and simple first')
    }

    static async query(variant: TFactoryApiQueryVariant, id: string) {
        const resp = await axios.get(`https://api.factorioanalytics.com/query/${id}/${variant}`);
        if (resp.status === 200)
            return resp.data
        else
            throw new Error('Failed to query - ' + resp.statusText)
    }

    static async queryTrial(id: string): Promise<ITrial> {
        const resp = await FactorioAnalyticsApi.query('trial', id)
        return resp as ITrial
    }

    static async querySource(id: string): Promise<string> {
        const resp = await FactorioAnalyticsApi.query('source', id)
        return resp as string
    }

    static async queryStatus(execId: string): Promise<FactoryApiExecutionStatus> {
        const resp = await FactorioAnalyticsApi.query('status', execId)
        return resp as FactoryApiExecutionStatus
    }

    static async queryItemData(id: string): Promise<IGameFlowItemTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_item', id)
        return resp as IGameFlowItemTick[]
    }

    static async queryElectricData(id: string): Promise<IGameFlowElectricTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_electric', id)
        return resp as IGameFlowElectricTick[]
    }

    static async queryCircuitData(id: string): Promise<IGameFlowCircuitTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_circuit', id)
        return resp as IGameFlowCircuitTick[]
    }

    static async queryPollutionData(id: string): Promise<IGameFlowPollutionTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_pollution', id)
        return resp as IGameFlowPollutionTick[]
    }

    static async querySystemData(id: string): Promise<IGameFlowSystemTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_system', id)
        return resp as IGameFlowSystemTick[]
    }

    static async queryAllData(id: string): Promise<{
        item: IGameFlowItemTick[],
        electric: IGameFlowElectricTick[],
        circuit: IGameFlowCircuitTick[],
        pollution: IGameFlowPollutionTick[],
        system: IGameFlowSystemTick[]
    }> {
        const resp = await FactorioAnalyticsApi.query('data_all', id);
        return resp as {
            item: IGameFlowItemTick[],
            electric: IGameFlowElectricTick[],
            circuit: IGameFlowCircuitTick[],
            pollution: IGameFlowPollutionTick[],
            system: IGameFlowSystemTick[]
        }
    }

}
