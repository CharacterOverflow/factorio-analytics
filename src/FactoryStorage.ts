
// storage system for anything Factory
// Uses typeorm when available, otherwise stores locally to JSON files
import {DataSource} from "typeorm";
import fs from "fs-extra";
import path from "path";
import {Trial} from "./Trial";
import {TrialSource} from "./TrialSource";
import {ModList} from "./ModList";
import {IDatasetCombinedResults} from "./Dataset";

export class FactoryStorage {

    private static dbConnection: DataSource;

    private static dataDir = path.join(process.cwd(),'factory','data');

    static async initialize(source: DataSource) {
        if (source) {
            await source.initialize();
            this.dbConnection = source;
        } else {
            this.dbConnection = null;

            await fs.ensureDir(path.join(FactoryStorage.dataDir,'trials'));
            await fs.ensureDir(path.join(FactoryStorage.dataDir,'sources'));
            await fs.ensureDir(path.join(FactoryStorage.dataDir,'results'));
            await fs.ensureDir(path.join(FactoryStorage.dataDir,'modlists'));

        }
    }

    static async disconnect() {
        await this.dbConnection.destroy();
    }

    /*TRIAL SPECIFIC FUNCTIONS*/

    static async getTrialById(id: string) {

    }

    static async saveTrial(t: Trial) {

    }

    static async deleteTrial(id: string) {

    }

    /*SOURCE SPECIFIC FUNCTIONS*/

    static async getSourceById(id: string) {

    }

    static async saveSource(s: TrialSource) {

    }

    static async deleteSource(id: string) {

    }

    /*MODLIST specific functions*/

    static async getModListById(id: string) {

    }

    static async saveModList(m: ModList) {

    }

    static async deleteModList(id: string) {

    }

    /*TRIAL RESULT functions*/

    static async getTrialResultsById(id: string) {

    }

    static async saveTrialResults(tr: IDatasetCombinedResults) {

    }

    static async deleteTrialResults(id: string) {

    }

}
