import express, {Express} from 'express'
import * as http from 'http';
import cors from 'cors'
import fileUpload from "express-fileupload";
import * as path from "path";
import {ITrialParams, Trial} from "./Trial";
import {Factory} from "./Factory";
import {SavedTrial} from "./database/SavedTrial";
import {FactoryDatabase} from "./FactoryDatabase";
import {ISourceParams} from "./Source";
import {SavedSource} from "./database/SavedSource";
import {IModListParams, ModList} from "./ModList";
import {SavedModList} from "./database/SavedModList";
import fs from "fs-extra";

export class FactoryBackend {

    static app: Express;
    //static io: Server
    static server: http.Server
    //static sockets: Map<string, Socket> = new Map<string, Socket>()

    static async startServer(port: number = 3001) {
        FactoryBackend.app = express()
        FactoryBackend.app.use(express.json())
        FactoryBackend.app.use(express.urlencoded({extended: true}))
        FactoryBackend.app.use(fileUpload({
            limits: {fileSize: 500 * 1024 * 1024},
        }));
        FactoryBackend.app.use('/', express.static('public'))
        FactoryBackend.app.post('/upload/savegame', (req, res) => {
            let fileNames = Object.keys(req.files);
            // we just grab the first file and upload it - rest are ignored
            let file = req.files[fileNames[0]];
            file.mv(path.join(Factory.factoryDataPath, 'saves-upload', file.name), function (err) {
                if (err) {
                    res.status(501).send(err)
                } else {
                    res.send('ok')
                }
            })
        })
        FactoryBackend.app.get('/api/listSaves', (req, res) => {
            try {
                fs.readdir(path.join(Factory.factoryDataPath, 'saves-upload')).then((files) => {
                    res.send(files.map((f) => {
                        return path.join(Factory.factoryDataPath, 'saves-upload', f)
                    }))
                }).catch((e) => {
                    res.status(501).send(e)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/createTrial', (req, res) => {
            try {
                let params: ITrialParams = req.body
                let t = new SavedTrial(params);
                FactoryDatabase.saveTrial(t).then(() => {
                    res.send(t)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/createSource', (req, res) => {
            try {
                let params: ISourceParams = req.body
                let s = new SavedSource(params);
                s.ready.then(() => {
                    FactoryDatabase.saveSource(s)
                }).then(() => {
                    res.send(s)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/createModList', (req, res) => {
            try {
                let params: IModListParams = req.body
                let m = new SavedModList(params);
                FactoryDatabase.saveModList(m).then(() => {
                    res.send(m)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/updateTrial', (req, res) => {
            try {
                let trial: SavedTrial = new SavedTrial(null)
                Object.assign(trial, req.body)
                FactoryDatabase.saveTrial(trial).then((rettrial) => {
                    res.send(rettrial)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/updateSource', (req, res) => {
                try {
                    try {
                        let src: SavedSource = new SavedSource(null)
                        Object.assign(src, req.body)
                        src.updateHash().then(() => {
                            return FactoryDatabase.saveSource(src)
                        }).then((retsrc) => {
                            res.send(retsrc)
                        }).catch((err: any) => {
                            res.status(501).send(err)
                        })
                    } catch (e) {
                        res.status(501).send(e)
                    }
                } catch (e) {
                    res.status(501).send(e)
                }
            }
        )
        FactoryBackend.app.post('/api/updateModList', (req, res) => {
            try {
                try {
                    let modList: SavedModList = new SavedModList(null)
                    Object.assign(modList, req.body)
                    FactoryDatabase.saveModList(modList).then(() => {
                        res.send(modList)
                    }).catch((err: any) => {
                        res.status(501).send(err)
                    })
                } catch (e) {
                    res.status(501).send(e)
                }
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/listTrials', (req, res) => {
            try {
                let count: number = req.query.count ? req.query.count : 100
                FactoryDatabase.listTrials(count).then((trials: SavedTrial[]) => {
                    res.send(trials)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/listSources', (req, res) => {
            try {
                let count: number = req.query.count ? req.query.count : 100
                FactoryDatabase.listSources(count).then((src: SavedSource[]) => {
                    res.send(src)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/listModLists', (req, res) => {
            try {
                let count: number = req.query.count ? req.query.count : 100
                FactoryDatabase.FactoryDB.getRepository('SavedModList').find({
                    take: count,
                }).then((modLists: SavedModList[]) => {
                    res.send(modLists)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/loadTrial', (req, res) => {
            try {
                let id: string = req.query.id
                FactoryDatabase.loadTrial(id).then((trial: Trial) => {
                    res.send(trial)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/loadSource', (req, res) => {
            try {
                let id: string = req.query.id
                FactoryDatabase.loadSource(id).then((source: SavedSource) => {
                    res.send(source)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }

        })
        FactoryBackend.app.get('/api/loadModList', (req, res) => {
            try {
                let id: string = req.query.id
                FactoryDatabase.loadModList(id).then((modlist: ModList) => {
                    res.send(modlist)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.send(e)
            }
        })
        FactoryBackend.app.get('/api/loadDataset', (req, res) => {
            try {
                let id: string = req.query.id
                let category: string = req.query.category
                if (category != 'item' && category != 'electric' && category != 'circuit' && category != 'pollution' && category != 'system') {
                    res.status(501).send('Invalid category')
                    return
                }
                FactoryDatabase.loadDataset(id, category).then((records: any[]) => {
                    res.send(records)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.post('/api/deleteTrialData', (req, res) => {
            try {
                let id = req.body.id
                FactoryDatabase.deleteTrialData(id).then((data) => {
                    res.send(data)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/performTrialAction', async (req, res) => {
            try {
                let execution: 'prepare' | 'compile' | 'run' | 'analyze' = req.body.execution
                let trial: SavedTrial = await FactoryDatabase.loadTrial(req.body.trial)
                if (execution == 'prepare') {
                    Factory.prepareTrial(trial).then(() => {
                        return FactoryDatabase.saveTrial(trial)
                    }).then((rtrial) => {
                        res.send(JSON.stringify({
                            trial: rtrial,
                            results: undefined
                        }))
                    }).catch((e) => {
                        res.status(501).send(e)
                    })
                } else if (execution == 'compile') {
                    Factory.compileTrial(trial).then(() => {
                        return FactoryDatabase.saveTrial(trial)
                    }).then((rtrial) => {
                        res.send(JSON.stringify({
                            trial: rtrial,
                            results: undefined
                        }))
                    }).catch((e) => {
                        res.status(501).send(e)
                    })
                } else if (execution == 'run') {
                    Factory.runTrial(trial).then(() => {
                        // save to DB first!
                        return FactoryDatabase.saveTrial(trial)
                    }).then((rtrial) => {
                        res.send(JSON.stringify({
                            trial: rtrial,
                            results: undefined
                        }))
                    }).catch((e) => {
                        res.status(501).send(e)
                    })
                } else if (execution == 'analyze') {
                    Factory.analyzeTrial(trial, true).then((results: any) => {
                        // save to DB first!
                        FactoryDatabase.saveTrial(trial)
                        return {trial,results}
                    }).then(({trial, results}) => {
                        trial.rawSystemText = undefined
                        res.send(JSON.stringify({
                            trial: trial
                        }))
                    }).catch((e) => {
                        res.status(501).send(e)
                    })
                } else
                    res.status(501).send('Invalid execution type')
            } catch (e) {
                res.status(501).send(e)
            }
        })


        FactoryBackend.server = http.createServer(FactoryBackend.app)
        /*FactoryBackend.io = new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >(FactoryBackend.server)*/


        return await new Promise((resolve) => {
            console.log('starting server on 3001')
            FactoryBackend.server.listen(port, () => {
                resolve(null)
            })
        })

    }

}