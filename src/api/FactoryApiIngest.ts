/*
* cluster web server that INGESTS new SUBMISSIONS into the database
* - inserts trials
* - inserts sources
* - inserts modlists
* - etc etc etc. Basically, the web server that takes in new data from the user and puts it into the database
*
* starting the injest server should also start database connections and ensure objects area valid
*
* */


import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import express, {urlencoded} from "express";
import cluster from 'cluster'
import {Source, SourceBlueprintDetails} from "../Source";
import {FactoryDatabase} from "../FactoryDatabase";
import {Trial} from "../Trial";
import {ModList} from "../ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord,
    GameFlowSystemRecord
} from "../Dataset";

export interface ITrialIngest {

    // the source to run
    source: string

    // length of time to run the trial for (ticks)
    // DEFAULT 36000 (10 minutes)
    length: number

    // tick interval between data polls (every X ticks, data is collected)
    // DEFAULT 300 (every 5 seconds)
    tickInterval: number

    // record item data?
    // DEFAULT ALL FALSE
    recordItems?: boolean

    // record electric data?
    // DEFAULT ALL FALSE
    recordElectric?: boolean

    // record circuit data?
    // DEFAULT ALL FALSE
    recordCircuit?: boolean

    // record pollution data?
    // DEFAULT ALL FALSE
    recordPollution?: boolean

    // record system data?
    // DEFAULT ALL FALSE
    recordSystem?: boolean

    // name of the trial
    name?: string

    // description of the trial
    desc?: string
}

// Template of what every single 'post' request should look like in the body here
/*
* Source - uploading a new blueprint. return the hash of the source after making sure it exists
* Modlist - uploading a modlist. Cannot be done alone, MUST reference a source to set to this modlist. Any modlists not set to a source are deleted after 24 hours
* Trial - submitting a new trial to run. Must reference a source. If the source does not exist or other checks fail, return errors. Else, return the trial id and execution id
* */
export class FactoryApiIngest {
    variant: 'source' | 'modlist' | 'trial'
    // ONLY ALLOWED PARAM FOR SOURCE IS BLUEPRINT STRING - no tags or descriptions
    source?: string

    // ONLY ALLOWED PARAM FOR MODLIST IS ARRAY OF STRINGS OF MODS_VERSIONS - no tags or descriptions
    modList?: string[]

    // TRIAL PARAMS HERE - AFTER CREATION, IMMEDIATELY GETS RUN WHEN POSSIBLE
    trial?: ITrialIngest
}

// represents a new trial to execute - should contain information about source automatically
// class needed to easily create database entities and entries.
@Entity('factory_request')
export class FactoryApiExecutionRequest {

    // A always-unique identifier for the trial going to be run. NOT the same as trialID
    @PrimaryGeneratedColumn('uuid')
    execution_id: string;

    @Column({name: 'trial_id'})
    trialId: string;

    @Column({name: 'logged_at'})
    loggedAt: Date;

    @Column({
        name: 'allocated_at',
        nullable: true
    })
    allocatedAt: Date;

}

@Entity('factory_status')
export class FactoryApiExecutionStatus {

    @PrimaryColumn()
    execution_id: string

    @Column({
        name: 'logged_at'
    })
    loggedAt: Date

    @Column()
    worker: string

    @Column({
        nullable: true
    })
    success: boolean
}

/*
* This class will represent a 'quick' source submission and trial.
* Returned will be the source ID and execution ID of the submission.
* Ideal for most basic things you want tested. For higher detail / custom params, use the FactoryApiIngest class
* */
export class FactoryApiIngestQuick {
    // Blueprint string. only thing allowed!
    blueprintStr?: string

    // Modlist string list.
    modList?: string[]

    constructor(bpStr: string, modList: string[] = []) {
        if (!bpStr)
            throw new Error('No blueprint string provided')
        if (!Source.isBlueprintString(bpStr))
            throw new Error('Invalid blueprint provided - must be a blueprint string!')

        this.blueprintStr = bpStr
        this.modList = modList
    }

}

// STATIC CLASS - used to set up the web server and functionality to start/stop the cluster.
// script will use this to start the server
export class FactoryApiIngestServer {

    //static app: Express;

    //static server: http.Server

    static async startServer(port: number = 3001, instances: number = 8) {

        if (cluster.isPrimary) {
            console.log(`Primary server starting on port ${port} with ${instances} instances`)
            for (let i = 0; i < instances; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker) => {
                console.log(`worker ${worker.process.pid} died`);
            })

        } else {
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
            const ex = express();
            ex.use(express.json())
            ex.use(urlencoded({extended: true, limit: '300mb'}))

            ex.get('/', (req, res) => {
                res.status(200).send('OK')
            })

            ex.post('/quickSubmit', (req, res) => {
                let body = req.body as FactoryApiIngestQuick
                if (Source.isBlueprintString(body.blueprintStr)) {
                    let s = new Source({
                        text: Source.anonymizeBlueprintString(body.blueprintStr),
                        variant: 'blueprint',
                        modList: body.modList ? new ModList({mods: body.modList}) : undefined
                    })
                    FactoryDatabase.saveSource(s).then(async (s) => {
                        // first, run a query to see if we've already run this default trial. If we have, just return the trial ID
                        let r = await FactoryDatabase.checkIfTrialExists(s.id, 36000, 300, true, false, true, true, true)
                        if (r) {
                            res.status(200).json({
                                trialId: r
                            })
                            return;
                        }
                        let trial = new Trial({
                            source: s,
                            length: 36000,
                            tickInterval: 300,
                            initialBots: 200,
                            recordItems: true,
                            recordElectric: true,
                            recordCircuits: true,
                            recordPollution: true,
                            recordSystem: true,
                        })
                        FactoryDatabase.saveTrial(trial, false).then((t) => {
                            let er = new FactoryApiExecutionRequest()
                            er.trialId = t.id
                            er.loggedAt = new Date()
                            FactoryDatabase.FactoryDB.getRepository('FactoryApiExecutionRequest').save(er).then((er) => {
                                res.status(200).json(er)
                            })
                        }).catch((e) => {
                            res.status(500).send(e)
                        })
                    }).catch((e) => {
                        res.status(500).send(e)
                    })
                } else
                    res.status(400).send('Invalid blueprint string')
            });

            ex.post('/submit', (req, res) => {
                let body = req.body as FactoryApiIngest
                if (body?.variant === 'source') {
                    if (body.source != undefined) {
                        let s = new Source({
                            text: Source.anonymizeBlueprintString(body.source),
                            variant: 'blueprint'
                        })
                        let sd = new SourceBlueprintDetails(s)
                        if (!sd.hasRequiredEntities())
                            return res.status(400).send('Invalid blueprint string - must contain a combinator, infinity chest, or infinity pipe')

                        // save the source
                        FactoryDatabase.saveSource(s).then((s) => {
                            // respond with s.id
                            res.status(200).send(s.id)
                        })
                    } else
                        res.status(400).send('No source provided')
                    // handle source
                } else if (body?.variant === 'modlist') {
                    res.status(400).send('Modlist not yet supported')
                    // handle modlist
                } else if (body?.variant === 'trial') {
                    // handle trial
                    let er = new FactoryApiExecutionRequest()
                    let tin = body.trial as ITrialIngest
                    if (tin && tin?.source) {
                        // if the source is over 40 characters and starts with 0e, make a source first
                        if (Source.isBlueprintString(tin.source)) {
                            let bpStr = Source.anonymizeBlueprintString(tin.source)
                            let s = new Source({
                                text: bpStr,
                                variant: 'blueprint'
                            })
                            FactoryDatabase.saveSource(s).then(async (s) => {
                                tin.source = s.id
                                // 1 more step is needed here. Check to see if the trial requested already exists. If it does, return the trial ID
                                let r = await FactoryDatabase.checkIfTrialExists(s.id,
                                    body.trial.length ?? Trial.timeToTicks(15),
                                    body.trial.tickInterval ?? Trial.secondsToTicks(5),
                                    body.trial.recordItems ?? true,
                                     body.trial.recordElectric ?? false,
                                    body.trial.recordCircuit ?? true,
                                    body.trial.recordPollution ?? true,
                                     body.trial.recordSystem ?? true )

                                if (r) {
                                    res.status(200).json({
                                        trialId: r
                                    })
                                    return;
                                }
                                // create the trial we are going to run based on the settings here
                                // NOTE - the defaults here should be suitable for MOST cases
                                let trial = new Trial({
                                    source: s,
                                    length: body.trial.length ?? Trial.timeToTicks(15),
                                    tickInterval: body.trial.tickInterval ?? Trial.secondsToTicks(5),
                                    initialBots: 200,
                                    recordItems: body.trial.recordItems ?? true,
                                    recordElectric: body.trial.recordElectric ?? false,
                                    recordCircuits: body.trial.recordCircuit ?? true,
                                    recordPollution: body.trial.recordPollution ?? true,
                                    recordSystem: body.trial.recordSystem ?? true,
                                })
                                FactoryDatabase.saveTrial(trial, false).then((t) => {
                                    er.trialId = t.id
                                    er.loggedAt = new Date()
                                    return FactoryDatabase.FactoryDB.getRepository('FactoryApiExecutionRequest').save(er)
                                }).then((er) => {
                                    res.status(200).json(er)
                                }).catch((e) => {
                                    res.status(500).send(e)
                                })
                            })
                        } else {
                            // source is likely an ID - find it first, then create the trial
                            FactoryDatabase.loadSource(tin.source).then(async (s) => {
                                tin.source = s.id
                                // 1 more step is needed here. Check to see if the trial requested already exists. If it does, return the trial ID
                                let r = await FactoryDatabase.checkIfTrialExists(s.id,
                                    body.trial.length ?? Trial.timeToTicks(15),
                                    body.trial.tickInterval ?? Trial.secondsToTicks(5),
                                    body.trial.recordItems ?? true,
                                    body.trial.recordElectric ?? false,
                                    body.trial.recordCircuit ?? true,
                                    body.trial.recordPollution ?? true,
                                    body.trial.recordSystem ?? true )

                                if (r) {
                                    res.status(200).json({
                                        trialId: r
                                    })
                                    return;
                                }
                                // create the trial we are going to run based on the settings here
                                // NOTE - the defaults here should be suitable for MOST cases
                                let trial = new Trial({
                                    source: s,
                                    length: body.trial.length ?? Trial.timeToTicks(15),
                                    tickInterval: body.trial.tickInterval ?? Trial.secondsToTicks(5),
                                    initialBots: 200,
                                    recordItems: body.trial.recordItems ?? true,
                                    recordElectric: body.trial.recordElectric ?? false,
                                    recordCircuits: body.trial.recordCircuit ?? true,
                                    recordPollution: body.trial.recordPollution ?? true,
                                    recordSystem: body.trial.recordSystem ?? true,
                                })
                                FactoryDatabase.saveTrial(trial, false).then((t) => {
                                    er.trialId = t.id
                                    er.loggedAt = new Date()
                                    return FactoryDatabase.FactoryDB.getRepository('FactoryApiExecutionRequest').save(er)
                                }).then((er) => {
                                    res.status(200).json(er)
                                }).catch((e) => {
                                    res.status(500).send(e)
                                })
                            })
                        }
                    } else
                        res.status(400).send('No source provided')
                } else
                    res.status(400).send('Invalid variant')
            })

            ex.listen(port, () => {
                console.log(`Server instance started on port ${port}`)
            })
        }
    }


}
