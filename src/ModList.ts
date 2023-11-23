import fs from "fs-extra";
import crypto, {randomUUID} from "crypto";
import {SavedModList} from "./database/SavedModList";

export interface IModListParams {
    name?: string
    desc?: string
    mods?: string[]
    settingsFile?: string
}

export class ModList {

    // id is determined by the hash of the mods array
    id?: string;

    name?: string;
    desc?: string;

    mods: string[] = [];

    // OPTIONAL - if set, points to the absolute path of a mod-settings.dat file. Is copied whenever this modlist is applied
    settingsFile?: string;

    static async fromModListFile(filepath: string): Promise<ModList> {
        let fd = await fs.readJSON(filepath)
        return new ModList({
            name: 'New Modlist',
            desc: 'Created from mod-list.json',
            mods: fd.mods.filter((m) => {
                return m.name !== 'base'
            }).map((m: any) => {
                return m.name
            })
        })
    }
    get modFileNames() {
        return this.mods.map((m) => {
          if (m.endsWith('.zip'))
              return m
            else
                return m + '.zip'
        })
    }

    get factorioModListFormat() {
        return {
            mods: this.mods.map((m) => {
                return {
                    name: m.split('_')[0],
                    enabled: true
                }
            })
        }
    }

    // writes the mod-list.json file format - filepath should be absolute, and have 'mod-list.json' (or whatever filename) at the end
    async writeModListFile(filepath: string) {
        await fs.writeFile(filepath, JSON.stringify(this.factorioModListFormat, null, 4))
    }

    // takes in an array of mod names, supports many naming types
    // converts name into a name+version object, if no version is specified it will be queried from the API, and the latest version will be locked in
    constructor(params: IModListParams) {
        if (!params)
            return;

        this.id = randomUUID();
        this.name = params.name;
        this.desc = params.desc;
        this.settingsFile = params.settingsFile;

        if (!params.mods)
            params.mods = []
        else if (params.mods.length > 0) {
            for (let i = 0; i < params.mods.length; i++) {
                let mod = params.mods[i]
                mod = mod.endsWith('.zip') ? mod.substring(0, mod.length - 4) : mod;

                // Find the first '.', which will help is identify the version number and string format
                let firstDotIndex = this.name.indexOf('.')
                let lastUnderscoreIndex = this.name.lastIndexOf('_');
                if (firstDotIndex === -1 || lastUnderscoreIndex === -1) {
                    // no version, just mod name itself
                    // set to latest. When mod caching comes around to check it, will grab latest version and change this
                    mod = mod + '_latest.zip'
                }
                this.mods.push(mod);
            }
        }
    }

}
