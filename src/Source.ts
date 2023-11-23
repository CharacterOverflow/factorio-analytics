/*
* Each class should work like this....
*
* Take 'source' as an example
*
* 1. class called 'Source' - this is the CORE class. It will have functionality that should USE the data and provide info
*   - REQUIRED to be creatable on the frontend easily too - nothing fancy in constructors or for setup
* 2. class called 'SavedSource' - this is the class that will be derived from Source, and has the ability to save data
*   - should NEVER EVER be used on the frontend, only on the backend
*   - Any sources sent back/forth will be as a Source, not SavedSource
*   - needs to have a constructor that can take a Source and create a SavedSource from it, or the same params as Source
*   - include a 'save' method that will save the data to the database in the class itself
*   - static load and loadMany functions as well - make all functionality derived from here
*
* */

import {ModList} from "./ModList";
import fs from "fs-extra";
import crypto from "crypto";

/*
* Having either blueprint or saveGamePath is  required. one or the other! If both are passed in, an error will be thrown
* */
export interface ISourceParams {
    blueprint?: string;
    saveGamePath?: string;
    name?: string;
    desc?: string;
    tags?: string[];
    modList?: ModList;
}

export class Source {

    // This ID is different - is the HASHED ID of the source, not generated
    // this is so that we can match identical sources together for higher tier analysis
    id: string;
    variant: string

    // DESCRIPTIVE / ORGANIZATIONAL HELPERS
    name?: string;
    desc?: string;
    tags: string[] = [];

    // MODLIST - LOOK HERE FOR MORE MOD SETUP INFO, MODLIST CONTROLS ALL MODS
    modList?: ModList;

    // 'text' holds  the RAW data of the source - either path to savegame, or blueprint string
    text: string;

    protected _hashFinished: Promise<boolean> = null;

    get ready(): Promise<boolean> {
        if (this._hashFinished == null)
            return new Promise<boolean>((resolve) => {
                resolve(false)
            })
        else
            return this._hashFinished;
    }

    constructor(params: ISourceParams = null, avoidHash = false) {
        // if no params, just return empty. Used as template for Object.assign to take over
        if (!params)
            return;

        this.name = params.name;
        this.desc = params.desc;
        this.tags = params.tags ? params.tags : [];
        this.modList = params.modList;
        if (params.blueprint && params.saveGamePath)
            throw new Error('Cannot have both blueprint and savegame path specified in creating a Source');

        if (params.blueprint) {
            this.variant = 'blueprint';
            this.text = params.blueprint.replaceAll('\n', '');
        } else if (params.saveGamePath) {
            this.variant = 'savegame';
            this.text = params.saveGamePath
        } else
            throw new Error('Must have either blueprint or savegame path specified in creating a Source');

        if (!avoidHash)
            this._hashFinished = this.updateHash();
    }

    async updateHash(): Promise<boolean> {
        if (this.text) {
            if (this.variant == 'blueprint') {
                this.id = crypto.createHash('sha256').update(this.text).digest('hex');
                return true;
            } else if (this.variant == 'savegame') {
                // DO I NEED TO HASH SAVEGAME?
                // IF USER UPLOADS A NEW SAVE, CAN RENAME IT EASILY, THEN USE NEW NAME. CAN JUST HASH SAVEGAME PATH!
                // will change this if it becomes an issue
                let buffer = await fs.readFile(this.text);
                this.id = crypto.createHash('sha256').update(buffer).digest('hex');
                return true
            } else {
                throw new Error('Invalid variant for Source');
            }
        } else {
            // need to return false here - we are likely on the web!!
            return false
        }
    }

    addTag(tag: string) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }

    removeTag(tag: string) {
        if (this.tags.includes(tag)) {
            this.tags.splice(this.tags.indexOf(tag), 1);
        }
    }

}