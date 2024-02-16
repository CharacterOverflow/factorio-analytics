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
import express, {Express, urlencoded} from "express";
import * as http from "http";
import cluster from 'cluster'
import {Source} from "../Source";
import {FactoryDatabase} from "../FactoryDatabase";
import {Trial} from "../Trial";

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
    name: string

    // description of the trial
    desc: string
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
    modlist?: string[]

    // TRIAL PARAMS HERE - AFTER CREATION, IMMEDIATELY GETS RUN WHEN POSSIBLE
    trial?: ITrialIngest
}

// represents a new trial to execute - should contain information about source automatically
// class needed to easily create database entities and entries.
@Entity('factory_request')
export class FactoryApiExecutionRequest {

    // A always-unique identifier for the trial going to be run. NOT the same as trialID
    @PrimaryGeneratedColumn('uuid')
    executionId: string;

    @Column()
    trialId: string;

    @Column()
    loggedAt: Date;

    @Column({
        nullable: true
    })
    allocatedAt: Date;

}

@Entity('factory_status')
export class FactoryApiExecutionStatus {

    @PrimaryColumn()
    executionId: string

    @Column()
    loggedAt: Date

    @Column()
    worker: string

    @Column({
        nullable: true
    })
    success: boolean
}

// STATIC CLASS - used to set up the web server and functionality to start/stop the cluster.
// script will use this to start the server
export class FactoryApiIngestServer {

    //static app: Express;

    //static server: http.Server

    static startServer(port: number = 3001, instances: number = 8) {
        if (cluster.isPrimary) {
            console.log(`Primary server starting on port ${port} with ${instances} instances`)
            for (let i = 0; i < instances; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died`);
            })

        } else {
            const ex = express();
            ex.use(express.json())
            ex.use(urlencoded({extended: true, limit: '100mb'}))

            ex.post('/submit', (req, res) => {
                let body = req.body as FactoryApiIngest
                if (body?.variant === 'source') {
                    if (body.source != undefined) {
                        let s = new Source({
                            text: body.source,
                            variant: 'blueprint'
                        })

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
                    // #TODO implement this, add new execution request as well
                    let er = new FactoryApiExecutionRequest()
                    let tin = body.trial as ITrialIngest
                    if (tin && tin?.source) {
                        // if the source is over 40 characters and starts with 0e, make a source first
                        if (tin?.source.length > 40 && tin?.source.startsWith('0e')) {
                            let s = new Source({
                                text: tin.source,
                                variant: 'blueprint'
                            })
                            FactoryDatabase.saveSource(s).then((s) => {
                                tin.source = s.id
                                let trial = new Trial({
                                    source: s,
                                    length: body.trial.length ?? 36000,
                                    tickInterval: body.trial.tickInterval ?? 300,
                                    initialBots: 200,
                                    recordItems: body.trial.recordItems ?? false,
                                    recordElectric: body.trial.recordElectric ?? false,
                                    recordCircuits: body.trial.recordCircuit ?? false,
                                    recordPollution: body.trial.recordPollution ?? false,
                                    recordSystem: body.trial.recordSystem ?? false,
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
                            FactoryDatabase.loadSource(tin.source).then((s) => {
                                let trial = new Trial({
                                    source: s,
                                    length: body.trial.length ?? 36000,
                                    tickInterval: body.trial.tickInterval ?? 300,
                                    initialBots: 200,
                                    recordItems: body.trial.recordItems ?? false,
                                    recordElectric: body.trial.recordElectric ?? false,
                                    recordCircuits: body.trial.recordCircuit ?? false,
                                    recordPollution: body.trial.recordPollution ?? false,
                                    recordSystem: body.trial.recordSystem ?? false,
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
