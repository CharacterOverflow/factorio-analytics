import path from "path";
import {DataSource} from "typeorm";
import {Factory} from "./Factory";
import {Trial} from "./Trial";
import {Source} from "./Source";
import {ModList} from "./ModList";
import {
    GameFlowCircuitRecord,
    GameFlowElectricRecord,
    GameFlowItemRecord,
    GameFlowPollutionRecord,
    GameFlowSystemRecord, IGameFlowRecordCounts, IGameFlowResults
} from "./Dataset";
import {FactorioApi} from "./FactorioApi";
import {Logging} from "./Logging";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import {BetterSqlite3ConnectionOptions} from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions";

export class FactoryDatabase {

    //static FactoryDB: DataSource;
    static get FactoryDB(): DataSource | undefined {
        if (FactoryDatabase.DefaultSource)
            return FactoryDatabase.SourcesMap.get(FactoryDatabase.DefaultSource)
        else return undefined
    }
    static SourcesMap: Map<string, DataSource> = new Map<string, DataSource>();
    static DefaultSource: string;

    static async initialize(datasources: PostgresConnectionOptions[] | BetterSqlite3ConnectionOptions[] = []) {
        Logging.log('info', 'Initializing Factory Database')

        if (!Factory.factoryDataPath)
            throw new Error('Initialize Factory first - need paths set up')

        if (datasources.length > 0) {
            // use the specified datasources instead of the default sqlite one
            // first source added is made default
            for (let ds of datasources) {
                await FactoryDatabase.configureDataSource(ds.name, ds)
            }
        } else {
            await FactoryDatabase.configureDataSource('default', {
                type: 'better-sqlite3',
                database: path.join(Factory.factoryDataPath, 'factory-storage', 'factory.db'),
                statementCacheSize: 500,
                synchronize: true,
                entities: [Trial, Source, ModList,
                    GameFlowItemRecord,
                    GameFlowElectricRecord,
                    GameFlowCircuitRecord,
                    GameFlowPollutionRecord,
                    GameFlowSystemRecord
                ]
            })
        }
    }

    static setSourceAsDefault(name: string) {
        if (!FactoryDatabase.SourcesMap.has(name))
            throw new Error(`Datasource ${name} does not exist`)
        FactoryDatabase.DefaultSource = name
    }

    static async configureDataSource(name: string, datasource: PostgresConnectionOptions | BetterSqlite3ConnectionOptions) {
        Logging.log('info', `Configuring datasource ${name}`)
        if (FactoryDatabase.SourcesMap.has(name))
            throw new Error(`Datasource ${name} already exists`)

        let ds = new DataSource(datasource)
        await ds.initialize()
        await ds.synchronize(false)
        FactoryDatabase.SourcesMap.set(name, ds)
        if (!FactoryDatabase.DefaultSource)
            FactoryDatabase.DefaultSource = name
        Logging.log('info', `Datasource ${name} synchronized`)
    }

    static async removeDataSource(name: string) {
        Logging.log('info', `Removing datasource ${name}`)
        if (!FactoryDatabase.SourcesMap.has(name))
            throw new Error(`Datasource ${name} does not exist`)

        let ds = FactoryDatabase.SourcesMap.get(name)
        if (ds) {
            await ds.destroy()
            FactoryDatabase.SourcesMap.delete(name)
            if (FactoryDatabase.DefaultSource == name) {
                FactoryDatabase.DefaultSource = undefined
                // set a new default
                if (FactoryDatabase.SourcesMap.size > 0)
                    FactoryDatabase.DefaultSource = FactoryDatabase.SourcesMap.keys().next().value
            }
        }

        Logging.log('info', `Datasource ${name} removed`)
    }

    static async deleteTrialData(trialId: string) {
        Logging.log('info', `Deleting trial data for trial ${trialId}`)
        await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).delete({
            trialId
        })
        await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).delete({
            trialId
        })
        await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).delete({
            trialId
        })
        await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).delete({
            trialId
        })
        let t = await FactoryDatabase.loadTrial(trialId, false)
        if (t) {
            t.startedRunAt = null;
            t.startedAt = null;
            t.endedAt = null;
            t.textLogs = []
            t.metadata = null
            t.rawSystemText = null
            t.itemMetadata = null
            t.pollutionMetadata = null
            t.stage = 'new'
            return await FactoryDatabase.saveTrial(t);
        }
    }

    static async loadDatasetMetadata(trialId: string): Promise<IGameFlowRecordCounts> {
        Logging.log('info', `Loading dataset metadata for trial ${trialId}`)
        // need to load the trial data, then generate 'generic' summary to return
        if (!trialId)
            throw new Error('Invalid trialId')

        // STOP!!!! Dont actually analyze data here - this is just meant to return info like number of records, etc
        let itemRecords = await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).count({where: {trialId}})
        let electricRecords = await FactoryDatabase.FactoryDB.getRepository(GameFlowElectricRecord).count({where: {trialId}})
        let circuitRecords = await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).count({where: {trialId}})
        let pollutionRecords = await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).count({where: {trialId}})
        let systemRecords = await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).count({where: {trialId}})

        return {
            item: itemRecords,
            electric: electricRecords,
            circuit: circuitRecords,
            pollution: pollutionRecords,
            system: systemRecords,
        }

    }

    static async loadDatasetRecords(trialId: string, category: string): Promise<IGameFlowResults> {
        Logging.log('info', `Loading dataset records for trial ${trialId} in category ${category}`)
        switch (category) {
            case 'item':
                return {
                    data: await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).find({
                        where: {
                            trialId,
                        }
                    }),
                }
            case 'electric':
                throw new Error('Electric not yet supported')
            case 'circuit':
                return {
                    data: await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).find({
                        where: {
                            trialId,
                        }
                    }),
                }
            case 'pollution':
                return {
                    data: await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).find({
                        where: {
                            trialId,
                        }
                    }),
                }
            case 'system':
                return {
                    data: await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).find({
                        where: {
                            trialId,
                        }
                    }),
                }
        }
        throw new Error('Invalid category - ' + category)
    }

    static async listTrials(count: number = 1000) {
        return await FactoryDatabase.FactoryDB.getRepository(Trial).find({
            take: count
        })
    }

    static async listSources(count: number = 1000) {
        return await FactoryDatabase.FactoryDB.getRepository(Source).find({
            take: count,
        })
    }

    static async loadTrial(id: string, includeSource: boolean = true): Promise<Trial> {
        let t = await FactoryDatabase.FactoryDB.getRepository(Trial).findOne({
            where: {
                id
            },
            relations: includeSource ? [
                'source'
            ] : []
        })
        if (includeSource)
            t.source = await FactoryDatabase.loadSource(t.source.id, includeSource)
        return t;
    }

    static async loadSource(id: string, includeModList: boolean = true) {
        return await FactoryDatabase.FactoryDB.getRepository(Source).findOne({
            where: {
                id
            },
            relations: includeModList ? [
                'modList',
            ] : []
        })
    }

    static async loadModList(id: string) {
        return await FactoryDatabase.FactoryDB.getRepository(ModList).findOne({
            where: {
                id
            }
        })
    }

    static async deleteTrial(id: string) {
        Logging.log('info', `Deleting trial ${id}`)
        await FactoryDatabase.deleteTrialData(id)
        await FactoryDatabase.FactoryDB.getRepository(Trial).delete({
            id
        })
    }

    static async deleteSource(id: string) {
        Logging.log('info', `Deleting source ${id}`)
        await FactoryDatabase.FactoryDB.getRepository(Source).delete({
            id
        })
    }

    static async deleteModList(id: string) {
        Logging.log('info', `Deleting mod list ${id}`)
        await FactoryDatabase.FactoryDB.getRepository(ModList).delete({
            id
        })
    }

    static async saveTrial(trial: Trial, saveExtra: boolean = true) {
        Logging.log('info', `Saving trial ${trial.id}`)
        if (saveExtra && trial.source) {
            await FactoryDatabase.saveSource(trial.source, true)
        }
        return await FactoryDatabase.FactoryDB.getRepository(Trial).save(trial)
    }

    static async saveSource(source: Source, saveExtra: boolean = true) {
        Logging.log('info', `Saving source ${source.id}`)
        if (saveExtra && source.modList) {
            await FactoryDatabase.saveModList(source.modList)
        }
        return await FactoryDatabase.FactoryDB.getRepository(Source).save(source)
    }

    static async saveModList(modList: ModList) {
        Logging.log('info', `Saving mod list ${modList.id}`)
        return await FactoryDatabase.FactoryDB.getRepository(ModList).save(modList)
    }


    static async insertItemRecords(records: GameFlowItemRecord[]) {
        // chunk size of 1000 to start
        Logging.log('info', `Inserting ${records.length} item records for trial ${records[0].trialId}`)
        for (let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertElectricRecords(records: GameFlowElectricRecord[]) {
        Logging.log('info', `Inserting ${records.length} electric records for trial ${records[0].trialId}`)
        for (let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowElectricRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertCircuitRecords(records: GameFlowCircuitRecord[]) {
        Logging.log('info', `Inserting ${records.length} circuit records for trial ${records[0].trialId}`)
        for (let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertPollutionRecords(records: GameFlowPollutionRecord[]) {
        Logging.log('info', `Inserting ${records.length} pollution records for trial ${records[0].trialId}`)
        for (let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertSystemRecords(records: GameFlowSystemRecord[]) {
        Logging.log('info', `Inserting ${records.length} system records for trial ${records[0].trialId}`)
        for (let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).insert(records.slice(i, i + 1000))
        }
    }


}
