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


import express, {Express, urlencoded} from "express";
import * as http from "http";
import cluster from 'cluster'
import {FactoryDatabase} from "../FactoryDatabase";

// STATIC CLASS - used to set up the web server and functionality to start/stop the cluster.
// script will use this to start the server
export class FactoryApiQueryServer {

    //static app: Express;

    //static server: http.Server

    static startServer(port: number = 3009, instances: number = 8) {
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

            ex.get('/', (req, res) => {
                res.status(200).send('OK')
            })

            ex.get('/query/:id/:variant', (req, res) => {
                try {
                    let id = req.params.id
                    let variant = req.params.variant

                    switch (variant) {
                        case 'status':
                            FactoryDatabase.FactoryDB.getRepository('FactoryApiExecutionStatus').findOne({
                                where: {
                                    executionId: id
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

            ex.listen(port, () => {
                console.log(`Server instance started on port ${port}`)
            })
        }
    }


}
