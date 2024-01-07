import fs from "fs-extra";
import crypto, {randomUUID} from "crypto";
import {Column, Entity, PrimaryColumn} from "typeorm";
import {lastIndexOf} from "lodash";
import {Logging} from "./Logging";

export interface IModList {
    id?: string
    name?: string
    desc?: string
    mods: string[]
}

@Entity('modlist')
export class ModList implements  IModList {

    @PrimaryColumn()
    id?: string;

    @Column({
        nullable: true
    })
    name?: string;

    @Column({
        nullable: true
    })
    desc?: string;

    @Column({
        nullable: false,
        type: 'simple-array'
    })
    mods: string[] = [];

    static ensureObject(modList: IModList): ModList {
        let a = modList as ModList
        if (a && a?.modFileNames)
            return a;
        else if (modList)
            return new ModList(modList)
        else
            return new ModList({
                name: 'New Modlist',
                desc: 'Created by default',
                mods: []
            })
    }

    static async fromModListFile(filepath: string): Promise<ModList> {
        Logging.log('info', `Loading mod list from ${filepath}`)
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
        Logging.log('info', `Writing mod list to ${filepath}`)
        await fs.writeFile(filepath, JSON.stringify(this.factorioModListFormat, null, 4))
    }

    // takes in an array of mod names, supports many naming types
    // converts name into a name+version object, if no version is specified it will be queried from the API, and the latest version will be locked in
    constructor(params: IModList) {
        if (!params)
            return;

        this.id = params.id ?? randomUUID();
        this.name = params.name;
        this.desc = params.desc;

        if (!params.mods)
            params.mods = []
        else if (params.mods.length > 0) {
            for (let i = 0; i < params.mods.length; i++) {
                let mod = params.mods[i]

                // remove .zip if it exists at the end
                mod = mod.endsWith('.zip') ? mod.substring(0, mod.length - 4) : mod;

                // Find the first '.', which will help is identify the version number and string format
                let firstDotIndex = this.name.indexOf('.')
                let lastUnderscoreIndex = this.name.lastIndexOf('_');
                if (firstDotIndex === -1 || lastUnderscoreIndex === -1) {
                    // no version, just mod name itself
                    // check to make sure the version here isn't 'latestl' already - else, add it
                    if (!mod.endsWith('_latest'))
                        mod = mod + '_latest'
                }
                this.mods.push(mod);
            }
        }
    }

    static parseModName(rawName: string): string {
        let mod = rawName
        mod = mod.endsWith('.zip') ? mod.substring(0, mod.length - 4) : mod;

        // Find the first '.', which will help is identify the version number and string format
        let firstDotIndex = this.name.indexOf('.')
        let lastUnderscoreIndex = this.name.lastIndexOf('_');
        if (firstDotIndex === -1 || lastUnderscoreIndex === -1) {
            // no version, just mod name itself
            // set to latest. When mod caching comes around to check it, will grab latest version and change this
            mod = mod + '_latest.zip'
        }
        return mod
    }

}
