
import * as fs from "fs-extra";
import {FactorioAnalyticsApi} from "../../src/FactorioAnalyticsApi";
import {Factory} from "../../src/Factory";
import {FactoryDatabase} from "../../src/FactoryDatabase";
import {Trial} from "../../src/Trial";
import {Source} from "../../src/Source";
import {ModList} from "../../src/ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord, GameFlowSystemRecord
} from "../../src/Dataset";


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
                GameFlowSystemRecord
            ]
        }
    ]);

    console.log('Factory started! running trial');

    const bpFile = '/home/overflow/Projects/factorio-analytics/factory/examples/45spm_base.bp'
    const bpStr = await fs.readFile(bpFile, 'utf8')

    // make a source, then run a trial with this source as well
    let source = new Source({
        name: '45spm_base',
        desc: 'Basic base blueprint',
        variant: 'blueprint',
        text: bpStr
    });
    let t = new Trial({
        name: '45spm_base 3_27_2024',
        desc: 'Basic base blueprint - long test. 108k ticks, 300 tick interval, all data recorded',
        source: source,
        length: 108000,
        tickInterval: 300,
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
