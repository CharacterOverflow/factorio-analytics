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
import fs from "fs-extra";
import crypto from "crypto";
import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";

/*
* Having either blueprint or saveGamePath is  required. one or the other! If both are passed in, an error will be thrown
* */

export class ISource {
    id?: string;
    blueprint?: string;
    saveGamePath?: string;
    name?: string;
    desc?: string;
    tags?: string[];
    modList?: ModList | IModList;
}

@Entity('sources')
export class Source implements ISource {

    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
    })
    variant: string;

    @Column({
        nullable: true,
        type: 'nvarchar'
    })
    name?: string;

    @Column({
        nullable: true,
        type: 'nvarchar'
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
        type: 'nvarchar'
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
        this.updateHash()
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

}