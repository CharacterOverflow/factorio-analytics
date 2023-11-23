/*
* Generic base class of the Trial OldSource object.
* */
import crypto from "crypto";
import path from "path";
import fs from "fs-extra";
import Blueprint from "factorio-blueprint"
import {ModList} from "./ModList";

export class OldSource {
    type: string;

    // MUST BE SET IN CHILD CONSTRUCTORS
    id: string;

    // basic name/desc fields for easy usage / display / organization in the future
    name?: string;
    desc?: string;
    tags: string[] = [];

    // Zip extension is not required, will be removed automatically
    // If no 'version' is specified, the API will be queried and the latest version will be used
    // if mods is undefined, no mods are used
    modList?: ModList

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

    ready: Promise<boolean> = null;

    async updateHash(): Promise<boolean> {
        throw new Error('Hashing in a non-typed OldSource not implemented - create a TrialSaveGame or TrialBlueprint instead');
    }

}

/*
* A trial that is running a savegame - special funtionality here for that
*
* Seeing as we dont have a blueprint to take a hash of for our 'primary key' id value, we instead will just generate an ID
*
* */
/*
export class SourceSaveGame extends OldSource {
    type: string = 'savegame';

    // the ID is generated from a hash of the savegame file - this way, identical savegames resolve to the same ID
    id: string;

    // Full absolute path of the save file that we're using. Absolute path is used to ensure we can load the file accurately
    // For the sake of easy usage in Factory.ts, it will ensure the save file exists at this location
    savePath: string;

    // returns only the filename of the save itself - .zip included
    get filename(): string {
        return path.basename(this.savePath)
    }

    constructor(savePath: string) {
        super();

        if (!savePath)
            return;

        this.savePath = savePath;
        this.hashFinished = this.updateHash();
    }

    async updateHash() {
        let buffer = await fs.readFile(this.savePath);
        this.id = crypto.createHash('sha256').update(buffer).digest('hex');
        return true
    }

    // because this is a save game, we need to do things a little differently. Instead of using a scenario, we will
    // make sure that our .zip file gets extracted and the needed lua files moved/updated

}*/

/*
* TODO
*  1. REMAKE SOURCE CLASSES TO JUST BE 1 CLASS
*  2. ADD DATABASE FUNCTIONALITY TO ALL CLASSES
*  3. MAKE BASE INTERFACE FOR ALL 'CORE' FIELDS IN A OBJECT
*       - TRIAL DERIVES FROM ITRIAL
*       - FRONTEND CAN JUST USE INTERFACE CLASSES, NEVER TOUCH SQLITE, just use interfaces
* */

/*
* A trial that is running a blueprint, placed into the template scenario to create a save game
* *//*
export class SourceBlueprint extends OldSource {
    type: string = 'blueprint';

    // the ID is generated from a hash of the blueprint string - this way, identical blueprints resolve to the same ID
    id: string;

    // the blueprint string itself
    bp: string

    // parsed  data of the blueprint
    data: any

    constructor(blueprint: string) {
        super();

        if (!blueprint)
            return;

        this.bp = blueprint.replaceAll('\n', '');
        this.hashFinished = this.updateHash();
        this.data = new Blueprint(this.bp, {checkWithEntityData: false})
    }

    async updateHash() {
        this.id = crypto.createHash('sha256').update(this.bp).digest('hex');
        return true;
    }

}
*/