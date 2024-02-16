/*
* Worker for the factory API
* not actually anything web or API related - besides the fact that it actively watches the database for new requests, then runs them.
* After it runs, it updates the database and this is used by 'query' to return data
*
*
* This worker is going to be running on different servers, and there will be tons of instances all looking at different installs of Factorio
* Each worker will be started independently, and will be responsible for a single 'factory' that can process trials
*
* It should start by querying the DB Request table, looking for a trial not allocated.
*
* try inserting to status table - if it fails, then another worker has already taken it
* if success, update the 'request' table to show that it's allocated
*
* now you can continue to run the trial
*
*
* */
import {FactoryDatabase} from "../FactoryDatabase";
import {Trial} from "../Trial";
import {Source} from "../Source";
import {ModList} from "../ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord,
    GameFlowSystemRecord
} from "../Dataset";
import {FactoryApiExecutionRequest, FactoryApiExecutionStatus} from "./FactoryApiIngest";
import {Factory} from "../Factory";
import {randomUUID} from "crypto";
import {Logging} from "../Logging";
import {IsNull} from "typeorm";

export class FactoryApiWorker {

    static worker: string;

    static async initialize() {
        // startup factory
        await Factory.initialize({
            hideConsole: false,
            updateInstall: true
        })

        FactoryApiWorker.worker = process.env.NAME ?? randomUUID()

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

        // now that we're connected and have a working factory, we can start processing requests!
        // this is a loop that will run forever, and will only stop when the process is killed
        // start a 'timeout' callback to run the main loop - once one is done, call process again, else start callback
        FactoryApiWorker.startTick()

    }

    static startTick() {
        let tResp = FactoryApiWorker.tick();
        tResp.then(() => {
            setTimeout(() => {
                FactoryApiWorker.startTick()
            }, 500)
        }).catch((e) => {
            if (e)
                Logging.log('error', e)
            setTimeout(() => {
                FactoryApiWorker.startTick()
            }, 500)
        })
    }

    static async tick() {
        try {
            // grab request, then try reserving it.
            let nr = await this.grabNewRequest();
            if (nr && !nr.allocatedAt) {
                await FactoryDatabase.FactoryDB.getRepository(FactoryApiExecutionStatus).insert({
                    executionId: nr.executionId,
                    loggedAt: new Date(),
                    worker: FactoryApiWorker.worker
                })
                await FactoryDatabase.FactoryDB.getRepository(FactoryApiExecutionRequest).update({
                    executionId: nr.executionId
                }, {
                    allocatedAt: new Date()
                })


                try {
                    // process this request
                    await this.processExec(nr)

                    await FactoryDatabase.FactoryDB.getRepository(FactoryApiExecutionStatus).update({
                        executionId: nr.executionId
                    }, {
                        success: true
                    })
                } catch (e) {
                    // if the error occurred and is caught here, update factory status for this request to success: false
                    Logging.log('error', e)
                    await FactoryDatabase.FactoryDB.getRepository(FactoryApiExecutionStatus).update({
                        executionId: nr.executionId
                    }, {
                        success: false
                    })
                }
            }
        } catch (e) {
            // if the error occurred and is caught here, ignore and move on
        }
    }

    static async grabNewRequest() {
        return await FactoryDatabase.FactoryDB.getRepository(FactoryApiExecutionRequest).findOne({
            where: {
                allocatedAt: IsNull()
            },
            order: {
                loggedAt: 'ASC'
            }
        })
    }

    static async processExec(exec: FactoryApiExecutionRequest) {
        // load the request and the related trial and needed info to run it all
        let trial = await FactoryDatabase.loadTrial(exec.trialId)
        if (!trial)
            throw new Error('Trial not found')

        // analyze trial with save options on
        await Factory.analyzeTrial(trial, true, true)

        // nothing more to do here - trial has been run and saved. return!
        return

    }

}
