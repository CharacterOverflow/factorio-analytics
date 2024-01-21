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

import {IModList, ModList} from "./ModList";
import crypto from "crypto";
import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import * as zlib from "zlib";
import {Logging} from "./Logging";
import _ from "lodash";

/*
* Having either blueprint or saveGamePath is  required. one or the other! If both are passed in, an error will be thrown
* */

export class ISource {
    id?: string;
    text?: string;
    variant?: string;
    name?: string;
    desc?: string;
    tags?: string[];
    modList?: ModList | IModList;
}

@Entity('source')
export class Source implements ISource {

    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
    })
    variant: string;

    @Column({
        nullable: true,
        type: 'varchar'
    })
    name?: string;

    @Column({
        nullable: true,
        type: 'varchar'
    })
    desc?: string;

    @Column({
        nullable: false,
        type: 'simple-array'
    })
    tags: string[] = []

    @ManyToOne(() => ModList)
    modList?: ModList

    @Column({
        nullable: false,
        type: 'varchar'
    })
    text: string;

    static ensureObject(source: ISource): Source {
        let a = source as Source
        if (a?.updateHash)
            return a;
        else if (source)
            return new Source(source)
        else
            return undefined
    }

    constructor(params: ISource = null) {
        // if no params, just return empty. Used as template for Object.assign to take over
        if (!params)
            return;

        this.name = params.name;
        this.desc = params.desc;
        this.tags = params.tags ? params.tags : [];
        this.modList = params.modList ? ModList.ensureObject(params.modList) : undefined

        // only need 'text' if the 'id' is not set. if id is already set, dont need text here
        if (!params.variant || (!params.text && !params.id))
            throw new Error('Need both variant and text fields to create a Source');

        if (params.text) {
            if (params.variant == 'blueprint') {
                this.variant = params.variant;
                this.text = params.text.replaceAll('\n', '');
            } else if (params.variant == 'savegame') {
                this.variant = params.variant;
                this.text = params.text
            } else
                throw new Error('Must have either blueprint or savegame variant specified in creating a Source');
            this.updateHash()
        } else if (params.id) {
            this.id = params.id;
        } else
            throw new Error('Need either text or id to create a Source');
    }

    updateHash(): boolean {
        if (this.text) {
            this.id = crypto.createHash('sha256').update(this.text).digest('hex');
            return true;
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

    // Load blueprint from an existing one
    static blueprintStringToObject(bpStr: string): any {
        const version = bpStr.slice(0, 1);
        if (version !== '0') {
            throw new Error('Unknown Blueprint Prefix, blueprint may be partial or too old/new');
        }
        let data: any = null;
        try {
            data = JSON.parse(
                zlib
                    .inflateSync(Buffer.from(bpStr.slice(1), 'base64'))
                    .toString('utf8'),
            );
        } catch (e) {
            Logging.log('error', e);
            throw e;
        }
        return data
    }


}

export interface BlueprintDetails {
    icons: any[];
    entities: any[];
    tiles: any[];
    item: string;
    version: number;
}

export interface BlueprintBookDetails {
    blueprints: BlueprintDetails[];
    item: string;
    label: string;
}

/*
* Class intended for getting more details about a blueprint. Caches the parsed data and has computed / functions available
* to access data about the blueprint
* */
export class SourceBlueprintDetails extends Source {
    constructor(params: ISource = null) {
        super(params);
        if (this.variant != 'blueprint')
            throw new Error('Blueprint details can only be created from a blueprint source');

        let pdata = Source.blueprintStringToObject(this.text);
        if (pdata?.blueprint)
            this.data = pdata.blueprint;
        else if (pdata?.blueprint_book)
            throw new Error('Cannot use Blueprint Book - only single blueprints')
        else
            throw new Error('Blueprint data not found in blueprint string');

        // now need to offset the coordinates so that the top left is 0,0
        // positive goes down and right, negative goes up and left
        this.normalizeCoordinates()
    }

    normalizeCoordinates() {
        let minX = _.minBy(this.data.entities, (e) => e.position.x).position.x
        let minY = _.minBy(this.data.entities, (e) => e.position.y).position.y
        // go through all entities and tiles, subtract minX and minY from each coordinate
        if (this.data.entities)
            for (let e of this.data.entities) {
                e.position.x -= minX
                e.position.y -= minY
            }
        if (this.data.tiles)
            for (let t of this.data.tiles) {
                t.position.x -= minX
                t.position.y -= minY
            }
    }

    data: BlueprintDetails;

    /*need separate class altogether for 'challenge' setup
    * define...
    * - allowedItems (label names) - if set, ONLY these items are allowed, else all are allowed
    * - bannedItems (label names) - if set, these items are banned, else none are banned
    * Can set up both or either, rules are combined. In some cases you may want to just ban 1 item, or only allow specific items
    * - scoreFunction - function that will take in a COMPLETED trial and return a score
    *   - expected to be a user-set function.
    * - scoreExplainedFunction - function that will take in a COMPLETED trial and return a string explaining the score breakdown
    *
    * */

    get entityCounts(): { [key: string]: number } {
        let counts = {};
        for (let e of this.data.entities) {
            if (!counts[e.name])
                counts[e.name] = 0;
            counts[e.name] += 1;
        }
        return counts;
    }

    get gridRange(): { minX: number, maxX: number, minY: number, maxY: number } {
        return {
            minX: _.minBy(this.data.entities, (e) => e.position.x).position.x,
            maxX: _.maxBy(this.data.entities, (e) => e.position.x).position.x,
            minY: _.minBy(this.data.entities, (e) => e.position.y).position.y,
            maxY: _.maxBy(this.data.entities, (e) => e.position.y).position.y
        }
    }

    get gridSize(): { x: number, y: number } {
        // grab min and max of x,y
        let gr = this.gridRange;

        return {x: Math.abs(gr.maxX - gr.minX) + 1, y: Math.abs(gr.maxY - gr.minY) + 1}
    }

}
