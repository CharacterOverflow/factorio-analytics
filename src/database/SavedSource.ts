import {ISourceParams, Source} from "../Source";
import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {SavedModList} from "./SavedModList";

@Entity('sources')
export class SavedSource extends Source {

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

    @ManyToOne(() => SavedModList)
    modList?: SavedModList

    @Column({
        nullable: false,
        type: 'nvarchar'
    })
    text: string;

    constructor(params: ISourceParams | Source) {
        let isCopy = false;
        if ((params as Source)?.id) {
            isCopy = true;
        }
        super(isCopy && params ? null : params, isCopy);
        // now, we continue... if we copy, we take all the vars from source up now
        // otherwise... there isn't much  else to do!
        if (isCopy) {
            const source = params as Source;
            this.id = source.id;
            this.variant = source.variant;
            this.name = source.name;
            this.desc = source.desc;
            this.tags = source.tags;
            this.text = source.text;

            if (source.modList && source.modList.id && source.modList.constructor.name == 'SavedModList') {
                this.modList = source.modList as SavedModList
            } else if (source.modList)
                this.modList = new SavedModList(source.modList);
            else
                this.modList = null

            this._hashFinished = new Promise<boolean>((resolve) => resolve(true))
        }
    }

}