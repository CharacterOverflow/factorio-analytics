import path from "path";
import {DataSource} from "typeorm";
import {Factory} from "./Factory";
import {SavedTrial} from "./database/SavedTrial";
import {SavedSource} from "./database/SavedSource";
import {SavedModList} from "./database/SavedModList";
import {SavedFlowRecord, SavedPollutionRecord, SavedSystemRecord} from "./database/SavedDataset";

export class FactoryDatabase {

    static FactoryDB: DataSource;

    static async initialize() {
        if (!Factory.factoryDataPath)
            throw new Error('Initialize Factory first - need paths set up')

        FactoryDatabase.FactoryDB = new DataSource({
            type: 'better-sqlite3',
            database: path.join(Factory.factoryDataPath, 'factory-storage', 'factory.db'),
            statementCacheSize: 500,
            synchronize: true,
            entities: [path.join(__dirname, 'database/*.js')]
        })
        await FactoryDatabase.FactoryDB.initialize()
        await FactoryDatabase.FactoryDB.synchronize(false)
    }

    static async deleteTrialData(trialId: string) {
        await FactoryDatabase.FactoryDB.getRepository('SavedFlowRecord').delete({
            trialId
        })
        await FactoryDatabase.FactoryDB.getRepository('SavedPollutionRecord').delete({
            trialId
        })
        await FactoryDatabase.FactoryDB.getRepository('SavedSystemRecord').delete({
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

    static async loadDataset(trialId: string, category: string) {
        switch (category) {
            case 'item':
                return await FactoryDatabase.FactoryDB.getRepository('SavedFlowRecord').find({
                    where: {
                        trialId,
                    }
                })
            case 'electric':
                throw new Error('Electric not supported')
            case 'circuit':
                throw new Error('Circuit not supported')
            case 'pollution':
                return await FactoryDatabase.FactoryDB.getRepository(SavedPollutionRecord).find({
                    where: {
                        trialId,
                    }
                })
            case 'system':
                return await FactoryDatabase.FactoryDB.getRepository('SavedSystemRecord').find({
                    where: {
                        trialId,
                    }
                })
        }
        throw new Error('Invalid category - ' + category)
    }

    static async listTrials(count: number = 1000) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedTrial').find({
            take: count
        })
    }

    static async listSources(count: number = 1000) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedSource').find({
            take: count,
        })
    }

    static async loadTrial(id: string, includeSource: boolean = true): Promise<SavedTrial> {
        return await FactoryDatabase.FactoryDB.getRepository(SavedTrial).findOne({
            where: {
                id
            },
            relations: includeSource ? [
                'source',
            ] : []
        })
    }

    static async loadSource(id: string, includeModList: boolean = true) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedSource').findOne({
            where: {
                id
            },
            relations: includeModList ? [
                'modList',
            ] : []
        })
    }

    static async loadModList(id: string) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedModList').findOne({
            where: {
                id
            }
        })
    }

    static async saveTrial(trial: SavedTrial, saveExtra: boolean = true) {
        if (saveExtra && trial.source) {
            await FactoryDatabase.saveSource(trial.source, true)
        }
        return await FactoryDatabase.FactoryDB.getRepository(SavedTrial).save(trial)
    }

    static async saveSource(source: SavedSource, saveExtra: boolean = true) {
        if (saveExtra && source.modList) {
            await FactoryDatabase.saveModList(source.modList)
        }
        return await FactoryDatabase.FactoryDB.getRepository('SavedSource').save(source)
    }

    static async saveModList(modList: SavedModList) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedModList').save(modList)
    }


    static async insertFlowRecords(records: SavedFlowRecord[]) {
        // chunk size of 1000 to start
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(SavedFlowRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertPollutionRecords(records: SavedPollutionRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(SavedPollutionRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertSystemRecords(records: SavedSystemRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(SavedSystemRecord).insert(records.slice(i, i + 1000))
        }
    }


}