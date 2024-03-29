import {FactoryDatabase} from "../src/FactoryDatabase";
import {Trial} from "../src/Trial";
import {Source} from "../src/Source";
import {ModList} from "../src/ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord, GameFlowSystemRecord
} from "../src/Dataset";
import {
    FactoryApiExecutionStatus,
    FactoryApiExecutionRequest
} from "../src/api/FactoryApiIngest";
import {FactoryApiQueryServer} from "../src/api/FactoryApiQuery";

require('dotenv').config();

async function main() {
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

    FactoryApiQueryServer.startServer()
}

main().then((t) => {
    console.log('done')
}).catch((e) => {
    console.error(e);
})
