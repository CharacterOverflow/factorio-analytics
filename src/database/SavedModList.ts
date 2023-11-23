import {IModListParams, ModList} from "../ModList";
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity('modlists')
export class SavedModList extends ModList {

    @PrimaryColumn()
    id: string;

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
    mods: string[]

    @Column({nullable: true})
    settingsFile?: string;

    constructor(params: IModListParams | ModList) {
        let isCopy = false;
        if ((params as ModList)?.id) {
            isCopy = true;
        }
        super(isCopy && params ? null : params)
        if (isCopy) {
            const modList = params as ModList;
            this.id = modList.id;
            this.name = modList.name;
            this.desc = modList.desc;
            this.mods = modList.mods;
            this.settingsFile = modList.settingsFile;
            // nothing fancy to do from here
        }
    }

}