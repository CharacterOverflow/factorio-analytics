import path from "path";
import * as fs from "fs-extra";
import {Factory} from "../src/Factory";
import {FactoryDatabase} from "../src/FactoryDatabase";
import {Source, SourceBlueprintDetails} from "../src/Source";
import {Trial} from "../src/Trial";
import {ModList} from "../src/ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord, GameFlowSystemRecord
} from "../src/Dataset";
import {
    FactoryApiExecutionRequest,
    FactoryApiExecutionStatus
} from "../src/api/FactoryApiIngest";
import {FactorioAnalyticsApi} from "../src/FactorioAnalyticsApi";

require('dotenv').config();

async function main() {

    /*
    * #TODO
    *   - Add more logging - use ai if anything, but log constatntlyyyy anything big that happens
    * */
    //const bpPath = '/home/overflow/Projects/factorio-analytics/factory/examples/1200spm_base.bp'
    const bpPath = '/home/overflow/Projects/factorio-analytics/factory/examples/circuit_test.txt'
    //const bpStr = fs.readFileSync(bpPath, 'utf-8')
    const bpStr = '0eNqdmOtu4yAQhV+l4rdTmasvr7KqVk5CKyQHW0BWG0V+95Ja6lZd487Mr8gEPh+O4TD2nR3Hq52D84n1d3a28RTcnNzkWc+Sjenp0cQq5k6Tj6z/dWfRvflhfPROt9nmbi7ZS+7hh8vjKqbJ28PrNfjhZNmSR/qz/ct6vlQ/jk1h8HGeQjoc7Zi+DBbLS8WsTy45u6r4uLj99tfL0YZML9y/YvMU3TqfO8ukg6rYLf90y0PPN4r4R5lHl1Ju+x9gVkD7rLO+swv2tP6rNoASLEvsyFJQSr0D0VDInhLzCTnm4TYcnI82bPuknvVKaiBONaVFsAM238FiA9zCwRqluCOAQYp5jXBZoDRzjkBLHFrA/RA4PyScLHFkhbCjxtmhEWiOQxu4HxznB2IX1jhyC7cD6UYHJ+MeoajBbuBsFhwMxrksBNwLXHAI+B7EbW6hKEdKDtTN81tjywC1iTGEaC9JaihhXoK1lPguwTpscbJplqwpGVrQJDklNUswgaybtucnCflSUqQIKVhiYQu67dkZQmKUFDWU1SkKsJayEkowyhlRYKma4FiJxQk1E4fEqhKEmglGloQaAUZWhLoGRtb4kxwGNviTHAaGV2LIx9fiD3IYGP4+pFFgDS/D1A74pVo/NvRfvnhUbBwyKbd93KBif2yIa/+Wq6YTTas6aTqzLO8qG5or'

    /*await Factory.initialize({
        hideConsole: false,
        // user info is provided auto-magically from oldenv.txt
    })
    await FactoryDatabase.initialize([
        {
            name: 'cache',
            type: 'postgres',
            host: process.env.PG_CACHE_HOST,
            port: parseInt(process.env.PG_CACHE_PORT),
            username: process.env.PG_CACHE_USER,
            password: process.env.PG_CACHE_PASS,
            poolSize: 4,
            synchronize: true,
            entities: [
                Trial,
                Source,
                ModList,
                GameFlowItemRecord,
                GameFlowElectricRecord,
                GameFlowCircuitRecord,
                GameFlowPollutionRecord,
                GameFlowSystemRecord,
                FactoryApiExecutionRequest,
                FactoryApiExecutionStatus
            ]
        }, {
            name: 'storage',
            type: 'postgres',
            host: process.env.PG_STORAGE_HOST,
            port: parseInt(process.env.PG_STORAGE_PORT),
            username: process.env.PG_STORAGE_USER,
            password: process.env.PG_STORAGE_PASS,
            poolSize: 4,
            synchronize: true,
            entities: [
                Trial,
                Source,
                ModList,
                GameFlowItemRecord,
                GameFlowElectricRecord,
                GameFlowCircuitRecord,
                GameFlowPollutionRecord,
                GameFlowSystemRecord,
                FactoryApiExecutionRequest,
                FactoryApiExecutionStatus
            ]
        }
    ])*/

    // query the public api!
    let t = await FactorioAnalyticsApi.query('trial', '39ac9173-562b-4f68-8e0d-03b85dc77eee')
    let s = await FactorioAnalyticsApi.query('source', t.source)

    console.log(t)

    //let s = source.gridSize


}

main().then(async (t) => {
    console.log('Finished running miscTesting.ts');
}).catch((e) => {
    console.error(e);
})
