/*
* Default web server that serves the API for the factory
* should be very simple to start with - direct trials and sources, no 'listing' - you gotta know what you're looking for.
* no user or session management either
*
* */
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

import cors from 'cors'
import express, {urlencoded} from "express";
import cluster from 'cluster'
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
import path from "path";

// STATIC CLASS - used to set up the web server and functionality to start/stop the cluster.
// script will use this to start the server
export class FactoryApiQueryServer {

    //static app: Express;

    //static server: http.Server

    static async startServer(port: number = 3009, instances: number = 8) {
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
            //trust proxy
            //ex.set('trust proxy', true)
            ex.use(express.json())
            ex.use(urlencoded({extended: true, limit: '100mb'}))


            const corsOptions = {
                origin: ['https://api.factorioanalytics.com', 'https://www.factorioanalytics.com'],
                optionsSuccessStatus: 200, // For legacy browser support
                methods: "GET, POST", // allows different HTTP methods
                mimeTypes: "application/json, application/javascript",
            }

            //ex.use(cors());
            // allow all mime types
            ex.use(cors(corsOptions));

            ex.use(express.static(path.join(process.cwd(), 'public')))

            ex.get('/query/:id/:variant', (req, res) => {
                try {
                    let id = req.params.id
                    let variant = req.params.variant

                    switch (variant) {
                        case 'source_raw':
                            FactoryDatabase.FactoryDB.getRepository('Source').findOne({
                                where: {
                                    id: id
                                }
                            }).then((s) => {
                                if (s)
                                    res.status(200).send(s.text)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'status':
                            FactoryDatabase.findStatusAndTrialOfExecution(id).then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'source':
                            // do source stuff. grab from DB and return it
                            FactoryDatabase.FactoryDB.getRepository('Source').findOne({
                                where: {
                                    id: id
                                }
                            }).then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'modlist':
                            // do modlist stuff
                            FactoryDatabase.FactoryDB.getRepository('ModList').findOne({
                                where: {
                                    id: id
                                }
                            }).then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'trial':
                            // do trial stuff
                            FactoryDatabase.FactoryDB.getRepository('Trial').findOne({
                                where: {
                                    id: id
                                },
                                relations: ['source']
                            }).then((s) => {
                                if (s) {
                                    s.source = s.source.id
                                    res.status(200).send(s)
                                } else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'data_item':
                            // do data_items stuff
                            FactoryDatabase.loadDatasetRecords(id, 'item').then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            });
                            break;
                        case 'data_electric':
                            // do data_electric stuff
                            res.status(400).send('Electric not yet supported')
                            break;
                        case 'data_circuit':
                            // do data_circuit stuff
                            FactoryDatabase.loadDatasetRecords(id, 'circuit').then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'data_pollution':
                            // do data_pollution stuff
                            FactoryDatabase.loadDatasetRecords(id, 'pollution').then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'data_system':
                            // do data_system stuff
                            FactoryDatabase.loadDatasetRecords(id, 'system').then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        case 'data_all':
                            // do data_all stuff
                            FactoryDatabase.loadDatasetRecords(id, 'all').then((s) => {
                                if (s)
                                    res.status(200).send(s)
                                else
                                    res.status(404).send('Not found')
                            }).catch((e) => {
                                res.status(500).send(e)
                            })
                            break;
                        default:
                            res.status(400).send('Invalid variant')
                            break;
                    }

                } catch (e) {
                    res.status(501).send(e)
                }
            })

            ex.get('/check/:id', (req, res) => {
                // checks if a source exists already or not
                let id = req.params.id
                FactoryDatabase.FactoryDB.getRepository('Source').exists({
                    where: {
                        id: id
                    }
                }).then((s) => {
                    if (s != null)
                        res.status(200).send(s)
                    else
                        res.status(404).send('Not found')
                }).catch((e) => {
                    res.status(500).send(e)
                })
            })

            ex.get('/analysis/largestTrialForSource/:id', (req, res) => {
                let id = req.params.id
                FactoryDatabase.findLargestTrialOfSource(id).then((s) => {
                    if (s)
                        res.status(200).send(s)
                    else
                        res.status(404).send('Not found')
                }).catch((e) => {
                    res.status(500).send(e)
                })
            })

            ex.get('/analysis/defaultTrialForSource/:id', (req, res) => {
                let id = req.params.id;
                FactoryDatabase.checkIfDefaultTrialExists(id).then((s) => {
                    if (s)
                        res.status(200).send(s)
                    else
                        res.status(404).send('Not found')
                }).catch((e) => {
                    res.status(500).send(e)
                })
            })


            // need a path for...
            /*
            * 1. Check if a Source has been submitted and saved yet
            * 2. Retrieve the most complete dataset for a Source (add to normal query functionality)
            * 3. Retrieve a summary of the largest dataset for a Source
            * */

            ex.listen(port, () => {
                console.log(`Server instance started on port ${port}`)
            })
        }
    }


}
