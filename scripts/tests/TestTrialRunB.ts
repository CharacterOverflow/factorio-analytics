
import * as fs from "fs-extra";
import {Factory} from "../../src/Factory";
import {FactoryDatabase} from "../../src/FactoryDatabase";
import {Trial} from "../../src/Trial";
import {Source} from "../../src/Source";
import path from "path";
import {ModList} from "../../src/ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord, GameFlowSystemRecord
} from "../../src/Dataset";
import {FactoryApiExecutionRequest, FactoryApiExecutionStatus} from "../../src/api/FactoryApiIngest";


require('dotenv').config();

async function main() {

    // startup factory
    await Factory.initialize({
        hideConsole: false,
        updateInstall: true
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
        }, /*{
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
                }*/
    ])

    console.log('Factory started! running trial');

    const bpFile = path.join(process.cwd(), 'factory/examples/electric_study_2.bp');
    const bpStr = await fs.readFile(bpFile, 'utf8')

    // make a source, then run a trial with this source as well
    let source = new Source({
        name: 'Electric Testing',
        desc: 'Gathering electric data for analysis',
        variant: 'blueprint',
        text: bpStr
    });
    let t = new Trial({
        source: source,
        length: 3600,
        tickInterval: 60,
        initialBots: 150,
        recordItems: true,
        recordElectric: true,
        recordCircuits: true,
        recordPollution: true,
        recordSystem: true
    });
    await FactoryDatabase.saveTrial(t, true);

    // run trial
    await Factory.analyzeTrial(t, true, true);

    console.log('trial done!');
}

main().then((t) => {
    console.log('Worker Started!')
}).catch((e) => {
    console.error(e);
})
