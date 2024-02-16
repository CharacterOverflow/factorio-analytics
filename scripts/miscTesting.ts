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

require('dotenv').config();

async function main() {

    /*
    * #TODO
    *   - Add more logging - use ai if anything, but log constatntlyyyy anything big that happens
    * */

    await Factory.initialize({
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
    ])

    //const circuitTestBp = await fs.readFile('/home/overflow/Projects/factorio-analytics/factory/examples/circuit_test.txt', 'utf8');
    const scienceTestBp = await fs.readFile('/home/overflow/Projects/factorio-analytics/factory/examples/45spm_base.bp', 'utf-8');

    // try running a basic new trial. circuts to test with for now
    let sciSource = new Source({
        text: scienceTestBp,
        variant: 'blueprint',
        name: 'Sci Test',
        desc: 'A simple test to see if sci data is being recorded properly',
        tags: ['test']
    })

    let trial = new Trial({
        source: sciSource,
        length: 7200 * 2,
        tickInterval: 60,
        initialBots: 200,
        recordItems: true,
        recordSystem: true,
        recordCircuits: true,
        recordPollution: true,
    })

    await FactoryDatabase.saveTrial(trial, true)

    try {
        let data = await Factory.analyzeTrial(trial,true ,true)
        return data;
    } catch (e) {
        console.log(e)
    }

    //let s = source.gridSize


}

main().then(async (t) => {
    console.log('Finished running miscTesting.ts');
}).catch((e) => {
    console.error(e);
})
