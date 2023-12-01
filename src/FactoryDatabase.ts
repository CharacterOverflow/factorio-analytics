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
    GameFlowSystemRecord
} from "./Dataset";

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
                return await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).find({
                    where: {
                        trialId,
                    }
                })
            case 'electric':
                throw new Error('Electric not supported')
            case 'circuit':
                return await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).find({
                    where: {
                        trialId,
                    }
                })
            case 'pollution':
                return await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).find({
                    where: {
                        trialId,
                    }
                })
            case 'system':
                return await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).find({
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

    static async loadTrial(id: string, includeSource: boolean = true): Promise<Trial> {
        return await FactoryDatabase.FactoryDB.getRepository(Trial).findOne({
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

    static async saveTrial(trial: Trial, saveExtra: boolean = true) {
        if (saveExtra && trial.source) {
            await FactoryDatabase.saveSource(trial.source, true)
        }
        return await FactoryDatabase.FactoryDB.getRepository(Trial).save(trial)
    }

    static async saveSource(source: Source, saveExtra: boolean = true) {
        if (saveExtra && source.modList) {
            await FactoryDatabase.saveModList(source.modList)
        }
        return await FactoryDatabase.FactoryDB.getRepository('SavedSource').save(source)
    }

    static async saveModList(modList: ModList) {
        return await FactoryDatabase.FactoryDB.getRepository('SavedModList').save(modList)
    }


    static async insertItemRecords(records: GameFlowItemRecord[]) {
        // chunk size of 1000 to start
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowItemRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertElectricRecords(records: GameFlowElectricRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowElectricRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertCircuitRecords(records: GameFlowCircuitRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowCircuitRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertPollutionRecords(records: GameFlowPollutionRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowPollutionRecord).insert(records.slice(i, i + 1000))
        }
    }

    static async insertSystemRecords(records: GameFlowSystemRecord[]) {
        for(let i = 0; i < records.length; i += 1000) {
            await FactoryDatabase.FactoryDB.getRepository(GameFlowSystemRecord).insert(records.slice(i, i + 1000))
        }
    }


}