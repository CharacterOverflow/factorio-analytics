import fs from "fs-extra";

export class Mod {

    name: string;
    version: string;

    get file(): string {
        return this.name + '_' + this.version + '.zip'
    }

    constructor(raw: string) {

        if (!raw)
            return;

        this.name = raw.endsWith('.zip') ? raw.substring(0, raw.length - 4) : raw;

        // Find the first '.', which will help is identify the version number and string format
        let firstDotIndex = this.name.indexOf('.')
        let lastUnderscoreIndex = this.name.lastIndexOf('_');
        if (firstDotIndex === -1 || lastUnderscoreIndex === -1) {
            // no version, just mod name itself
            // Grab latest version from the API directly - THEN check the cache. We do this to check for mod updates
            this.version = 'latest'
        } else {
            // mod version, we can assume take LAST '_' until the end as version
            this.version = this.name.substring(lastUnderscoreIndex + 1);
        }
    }

}

export class ModList {

    name?: string;
    desc?: string;

    mods: Mod[] = [];

    // OPTIONAL - if set, points to the absolute path of a mod-settings.dat file. Is copied whenever this modlist is applied
    settingsFile?: string;

    get factorioModFiles() {
        return this.mods.map((m) => {
            return m.file
        })
    }

    get factorioModListFormat() {
        return {
            mods: this.mods.map((m) => {
                return {
                    name: m.name,
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
    constructor(mods: string[], name?: string, desc?: string) {
        if (!mods)
            return;

        if (name)
            this.name = name;

        if (desc)
            this.desc = desc;

        for (let i = 0; i < mods.length; i++) {
            this.mods.push(new Mod(mods[i]));
        }
    }

}
