import express, {Express} from 'express'
import * as http from 'http';
import cors from 'cors'
import fileUpload from "express-fileupload";
import * as path from "path";
import {Factory} from "./Factory";
import {FactoryDatabase} from "./FactoryDatabase";
import fs from "fs-extra";
import {ITrial, Trial} from "./Trial";
import {ISource, Source} from "./Source";
import {IModList, ModList} from "./ModList";
import {IGameFlow, IGameFlowRecordCounts, IGameFlowResults} from "./Dataset";
import {DatasetQuery, IDatasetQueryOptions} from "./DatasetAnalysis";
import {factory} from "ts-jest/dist/transformers/hoist-jest";
import {FactorioApi} from "./FactorioApi";

export class FactoryBackend {

    static app: Express;
    //static io: Server
    static server: http.Server

    static cachedDatasets: Map<string, IGameFlowResults> = new Map<string, IGameFlowResults>()

    static cacheDataset(results: IGameFlowResults, trialId: string, category: string) {
        results.cachedAt = new Date()
        FactoryBackend.cachedDatasets.set(trialId + '-' + category, results)
        // we can only have up to 10 datasets cached at once - for the sake of ram usage
        // look through the cache, and remove the oldest one if we have more than 10
        // dont use foreach
        if (FactoryBackend.cachedDatasets.size > 10) {
            let oldest: Date = new Date()
            let oldestKey: string = ''
            for (let key of FactoryBackend.cachedDatasets.keys()) {
                let d = FactoryBackend.cachedDatasets.get(key).cachedAt
                if (d < oldest) {
                    oldest = d
                    oldestKey = key
                }
            }
            FactoryBackend.cachedDatasets.delete(oldestKey)
        }
    }


    //static sockets: Map<string, Socket> = new Map<string, Socket>()

    static async startServer(port: number = 3001) {
        FactoryBackend.app = express()
        FactoryBackend.app.use(express.json())
        FactoryBackend.app.use(express.urlencoded({extended: true}))
        FactoryBackend.app.use(fileUpload({
            limits: {fileSize: 500 * 1024 * 1024},
        }));
        FactoryBackend.app.use('/', express.static('public'))
        FactoryBackend.app.get('/api/factoryStatus', (req, res) => {
            // what is the factory currently doing? Startup status? Running status? etc
            try {
                res.json({
                    startupStatus: Factory.initStatus,
                    isTrialRunning: Factory.isTrialRunning,
                    isFactorioRunning: Factory.factorioRunning,
                    version: Factory.factoryVersion
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/factoryPaths', (req, res) => {
            try {
                res.json({
                    factoryInstallPath: Factory.factoryInstallPath,
                    factoryDataPath: Factory.factoryDataPath,
                    factoryModsPath: Factory.modsPath,
                    factoryModsCachePath: Factory.modsCachePath,
                    factorySavesPath: Factory.savesPath,
                    factoryScenariosPath: Factory.scenariosPath
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/modCache', (req, res) => {
            try {
                res.json({
                    modCache: [...Factory.modCache]
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
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
                let params: ITrial = req.body
                let t = new Trial(params);
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
                let params: ISource = req.body
                let s = new Source(params);
                FactoryDatabase.saveSource(s).then(() => {
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
                let params: IModList = req.body
                let m = new ModList(params);
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
                let trial: Trial = new Trial(req.body)
                FactoryDatabase.saveTrial(trial, false).then((rettrial) => {
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
                    let src: Source;
                    if (req.body.id) {
                        FactoryDatabase.loadSource(req.body.id).then((source: Source) => {
                            Object.assign(source, req.body)
                            src = source
                            return FactoryDatabase.saveSource(src)
                        }).then((ret) => {
                            res.send(ret)
                        }).catch((err: any) => {
                            res.status(501).send(err)
                        })
                    } else {
                        // likely new source
                        src = new Source(req.body)
                        FactoryDatabase.saveSource(src).then((ret) => {
                            res.send(ret)
                        }).catch((err: any) => {
                            res.status(501).send(err)
                        })
                    }
                } catch (e) {
                    res.status(501).send(e)
                }
            }
        )
        FactoryBackend.app.post('/api/updateModList', (req, res) => {
            try {
                try {
                    let modList: ModList = new ModList(req.body)
                    // req.body.mods might not be a list of strings...
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
                FactoryDatabase.listTrials(count).then((trials: Trial[]) => {
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
                let count: number = req.query.count ? Number.parseInt(req.query.count) : 100
                let showText: string = req.query.showText ? req.query.showText : false
                FactoryDatabase.listSources(count).then((src: Source[]) => {
                    if (showText != 'true')
                        src = src.map((s) => {
                            s.text = undefined
                            return s
                        })

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
                FactoryDatabase.FactoryDB.getRepository(ModList).find({
                    take: count,
                }).then((modLists: ModList[]) => {
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
                FactoryDatabase.loadSource(id).then((source: Source) => {
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
        FactoryBackend.app.get('/api/loadDatasetMetadata', (req, res) => {
            try {
                let id: string = req.query.trialId
                if (!id)
                    throw new Error('Missing trialId')

                FactoryDatabase.loadDatasetMetadata(id).then((results: IGameFlowRecordCounts) => {
                    res.send(results)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(500).send(e)
            }

        })
        FactoryBackend.app.get('/api/loadDatasetRecords', (req, res) => {
            try {
                let id: string = req.query.id
                let category: string = req.query.category
                if (category != 'item' && category != 'electric' && category != 'circuit' && category != 'pollution' && category != 'system') {
                    res.status(501).send('Invalid category')
                    return
                }
                FactoryDatabase.loadDatasetRecords(id, category).then((results: IGameFlowResults) => {
                    res.send(results)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.get('/api/modManager/listMods', (req, res) => {
            // load the filter options - if searching by name, needs to match even partially to the 'name', 'summary', 'title', 'category'
            let textFilter: string = req.query.textFilter ? req.query.textFilter : ''
            let category: string = req.query.category ? req.query.category : ''


            try {
                let r = FactorioApi.cachedModList.results.filter((o) => {
                    if (category != '' && o.category != category)
                        return false
                    if (textFilter != '' && (
                        !o.name.toLowerCase().includes(textFilter.toLowerCase()) ||
                        !o.summary.toLowerCase().includes(textFilter.toLowerCase()) ||
                        !o.title.toLowerCase().includes(textFilter.toLowerCase()))
                    )
                        return false
                    return true
                })
                res.send(r)
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.get('/api/modManager/getModInfo', (req, res) => {
            try {
                if (!req.query.name) {
                    res.status(501).send('Missing name')
                    return
                }

                FactorioApi.getModInfo(req.query.name).then((modInfo) => {
                    res.send(modInfo)
                }).catch((e) => {
                    res.status(501).send(e)
                })
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.get('/api/cacheDataset/:id/:category', (req, res) => {
            try {
                // when a dataset is used, if it isn't cached already it will be
                // this function just does that process manually, if you know you're about to run a ton of queries at once

                // this will query a dataset with params and return results
                // the dataset being used (raw, with all data) will be cached for future usage
                // this means that if you 'query' the same dataset multiple times (after this first), it will be fast and not need to re-load records from sql
                let trialId: string = req.params.id
                let category: string = req.params.category
                FactoryDatabase.loadDatasetRecords(trialId, category).then((results: IGameFlowResults) => {
                    // cache dataset immediately
                    FactoryBackend.cacheDataset(results, trialId, category)

                    res.send('OK')
                }).catch((e) => {
                    res.status(501).send(e)
                })

            } catch (e) {
                res.status(500).send(e)
            }
        })
        /*
        * #todo
        *   should make a system where the backend can cache a 'DatasetQuery' in memory so long as its used once every 15 minutes or so
        * if it needs to be re-run, it gets re-run and set in memory
        * this means immediate calls after a query will be fast, and not require re-parsing tons of data
        * */
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
        FactoryBackend.app.get('/api/clearTrialData/:id', (req, res) => {
            try {
                FactoryDatabase.deleteTrialData(req.params.id).then((data) => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/deleteTrial/:id', (req, res) => {
            try {
                FactoryDatabase.deleteTrial(req.params.id).then((data) => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/deleteSource/:id', (req, res) => {
            try {
                FactoryDatabase.deleteSource(req.params.id).then((data) => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.get('/api/deleteModList/:id', (req, res) => {
            try {
                FactoryDatabase.deleteModList(req.params.id).then((data) => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(500).send(e)
            }
        })
        FactoryBackend.app.get('/api/markTrialComplete/:id', (req, res) => {
            try {
                FactoryDatabase.loadTrial(req.params.id).then((trial) => {
                    if (!trial)
                        throw new Error('Invalid trial')
                    trial.stage = 'complete'
                    return FactoryDatabase.saveTrial(trial)
                }).then((data) => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/testAndSaveCredentials', (req, res) => {
            try {
                const username = req.query.usr
                const token = req.query.token

                FactorioApi.initialize({
                    username: username,
                    token: token,
                    dataPath: Factory.factoryDataPath
                }).then(() => {
                    res.send('OK')
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/dbInfo', (req, res) => {
            try {
                if (FactoryDatabase.FactoryDB)
                    res.send({
                        type: FactoryDatabase.FactoryDB.options.type,
                        database: FactoryDatabase.FactoryDB.options.database,
                    })
                else
                    res.send('No database initialized')
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.post('/api/performTrialAction', async (req, res) => {
            try {
                let execution: 'prepare' | 'compile' | 'run' | 'analyze' = req.body.execution
                let trial: Trial = await FactoryDatabase.loadTrial(req.body.trial, true)
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
                    // special case here - if this has already been run, we need to clear database data before re-running
                    if (!!trial.endedAt)
                        await FactoryDatabase.deleteTrialData(trial.id)

                    Factory.analyzeTrial(trial, true, true).then((results: any) => {
                        // save to DB first!
                        FactoryDatabase.saveTrial(trial)
                        return {trial, results}
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
        FactoryBackend.app.get('/api/datasetQuery/:id/:category/:func/:chunk', async (req, res) => {
            try {
                // run a query based on passed in query params.
                // we wont send a whole dataset in the request - so, we'll need to query for the data here first, then apply the query, then return the results
                // query the Item table for the given dataset in queryid, then follow the filters as given in the r est of the query
                let trialId: string = req.params.id
                let category: string = req.params.category
                let func: string = req.params.func
                let chunkSize: number = req.params.chunkSize
                let options: IDatasetQueryOptions = req.query.options;
                let results = FactoryBackend.cachedDatasets.get(trialId + '-' + category)
                if (!results) {
                    results = await FactoryDatabase.loadDatasetRecords(trialId, category)
                    FactoryBackend.cacheDataset(results, trialId, category)
                    if (!results)
                        throw new Error('No data found for dataset')
                }

                let q = new DatasetQuery<IGameFlow>(results.data, options)
                if (func == 'uniqueLabels') {
                    let ret = q.uniqueLabels()
                    res.send(ret)
                    return
                } else if (func == 'queryOptions') {
                    q.dataset = undefined
                    res.send(q)
                    return
                } else if (func == 'summaryByTickChunk' && chunkSize > 0) {
                    let ret = q.summaryByTickChunk(q.dataset, chunkSize)
                    res.send(ret)
                    return
                } else if (func == 'summaryByLabel') {
                    let ret = q.summaryByLabel()
                    res.send(ret)
                    return
                } else if (func == 'groupByTickChunk' && chunkSize > 0) {
                    let ret = q.groupByTickChunk(q.dataset, chunkSize)
                    res.send(ret)
                    return
                } else if (func == 'groupByLabel') {
                    let ret = q.groupByLabel()
                    res.send(ret)
                    return
                } else
                    res.status(501).send('Invalid function')
            } catch (e) {
                res.status(501).send(e)
            }
        })
        FactoryBackend.app.get('/api/modManager/cacheModList/:id', (req, res) => {
            try {
                let id = req.params.id
                FactoryDatabase.loadModList(id).then((modlist) => {
                    return Factory.cacheModList(modlist)
                }).then((dat) => {
                    res.send(dat)
                }).catch((err: any) => {
                    res.status(501).send(err)
                })
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