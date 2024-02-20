import {FactoryApiExecutionStatus, FactoryApiIngest, ITrialIngest} from "./api/FactoryApiIngest";
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

export type TFactoryApiQueryVariant = 'status' | 'source' | 'modlist' | 'trial' | 'data_items' | 'data_electric' | 'data_circuit' | 'data_pollution' | 'data_system' | 'data_all'

/*
* implement and use the API here for the package itself
* IN THE FUTURE - this should have an option to take all requests and save them LOCALLY to a database (sqlite)
*   - this way, any subsequent requests for data (if the trial is done) can be done locally
* */
export class FactorioAnalyticsApi {
    // no need to 'startup' or anything else here - just static paths that can access the API

    static async submit( params: FactoryApiIngest ) {
        // submit a new request to the API - same params and everything
        const resp = await axios.post('https://api.factorioanalytics.com/submit', params);
        if (resp.status === 200)
            return resp.data
        else
            throw new Error('Failed to submit request')
    }

    static async submitSource( bpStr: string ): Promise<string> {
        const params: FactoryApiIngest = {
            variant: 'source',
            source: bpStr
        }
        const resp = await FactorioAnalyticsApi.submit(params)
        return resp.data
    }

    static async submitTrial( trialParams: ITrialIngest ) {
        const params: FactoryApiIngest = {
            variant: 'trial',
            trial: trialParams
        }
        const resp = await FactorioAnalyticsApi.submit(params)
        return resp.data
    }

    static async submitModList( mods: string[]) {
        throw new Error('Not yet implemented - while modding works, starting small and simple first')
    }

    static async query( variant: TFactoryApiQueryVariant, id: string ) {
        const resp = await axios.get(`https://api.factorioanalytics.com/query/${id}/${variant}`);
        if (resp.status === 200)
            return resp.data
        else
            throw new Error('Failed to query - ' + resp.statusText)
    }

    static async queryTrial( id: string ): Promise<ITrial> {
        const resp = await FactorioAnalyticsApi.query('trial', id)
        return resp.data as ITrial
    }

    static async querySource( id: string ): Promise<string> {
        const resp = await FactorioAnalyticsApi.query('source', id)
        return resp.data as string
    }

    static async queryStatus( execId: string ): Promise<FactoryApiExecutionStatus> {
        const resp = await FactorioAnalyticsApi.query('status', execId)
        return resp.data as FactoryApiExecutionStatus
    }

    static async queryItemData( id: string ): Promise<IGameFlowItemTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_items', id)
        return resp.data as IGameFlowItemTick[]
    }

    static async queryElectricData( id: string ): Promise<IGameFlowElectricTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_electric', id)
        return resp.data as IGameFlowElectricTick[]
    }

    static async queryCircuitData( id: string ): Promise<IGameFlowCircuitTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_circuit', id)
        return resp.data as IGameFlowCircuitTick[]
    }

    static async queryPollutionData( id: string ): Promise<IGameFlowPollutionTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_pollution', id)
        return resp.data as IGameFlowPollutionTick[]
    }

    static async querySystemData( id: string ): Promise<IGameFlowSystemTick[]> {
        const resp = await FactorioAnalyticsApi.query('data_system', id)
        return resp.data as IGameFlowSystemTick[]
    }

    static async queryAllData( id: string ): Promise<{
        item: IGameFlowItemTick[],
        electric: IGameFlowElectricTick[],
        circuit: IGameFlowCircuitTick[],
        pollution: IGameFlowPollutionTick[],
        system: IGameFlowSystemTick[]
    }> {
        const resp = await FactorioAnalyticsApi.query('data_all', id);
        return resp.data as {
            item: IGameFlowItemTick[],
            electric: IGameFlowElectricTick[],
            circuit: IGameFlowCircuitTick[],
            pollution: IGameFlowPollutionTick[],
            system: IGameFlowSystemTick[]
        }
    }




/*
    static async submitTrial( trialParams: ITrial ) {
        // if the ITrial references a source object, use just the ID as source
        // if it references a bpstring, leave it as is. Will be converted on the server
        let trialParams = {
            variant: 'trial',
            trial: {
                source: trialParams?.source?.id ?? trialParams.source,
                length: trialParams?.length,
                tickInterval: trialParams?.tickInterval,
                initialBots: trialParams?.initialBots,
                recordItems: trialParams?.recordItems,
                recordElectric: trialParams?.recordElectric,
                recordCircuits: trialParams?.recordCircuits,
                recordPollution: trialParams?.recordPollution,
                recordSystem: trialParams?.recordSystem
            }
        }
        // doesnt blueprint descriptions change the hash? Need to hash the blueprint itself not the entire json.. fuck
        let source = trialParams.source
        if (source?.id)
            trialParams.source = source?.id
    }*/

}
