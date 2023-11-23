import {ITrialParams, Trial, TTrialStages} from "../Trial";
import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {SavedSource} from "./SavedSource";
import {Source} from "../Source";
import {JoinColumn} from "typeorm/browser";

@Entity('trials')
export class SavedTrial extends Trial {

    @PrimaryColumn()
    id: string;

    @Column({
        nullable: true,
    })
    name: string;

    @Column({
        nullable: true,
    })
    desc: string;

    @Column({
        nullable: false,
        type: 'nvarchar'
    })
    stage: TTrialStages;

    @ManyToOne(() => SavedSource)
    source: SavedSource

    @Column({
        nullable: false,
    })
    length: number

    @Column({
        nullable: false,
    })
    tickInterval: number

    @Column({
        nullable: false,
    })
    initialBots: number

    @Column({
        nullable: false,
    })
    recordItems: boolean

    @Column({
        nullable: false,
    })
    recordElectric: boolean

    @Column({
        nullable: false,
    })
    recordCircuits: boolean

    @Column({
        nullable: false,
    })
    recordPollution: boolean

    @Column({
        nullable: false,
    })
    recordSystem: boolean

    @Column({
        nullable: true
    })
    startedRunAt: Date

    @Column({
        nullable: true
    })
    startedAt: Date

    @Column({
        nullable: true
    })
    endedAt: Date

    @Column({
        nullable: true,
        type: 'simple-array'
    })
    textLogs: string[]

    @Column({
        nullable: true,
        type: 'simple-json'
    })
    metadata: any

    @Column({
        nullable: true,
    })
    createdAt: Date

    constructor(params: ITrialParams | Trial) {
        let isCopy = false;
        if ((params as Trial)?.id) {
            isCopy = true;
        }
        super(isCopy ? null : params);
        if (isCopy) {
            const trial = params as Trial;
            this.id = trial.id;
            this.stage = trial.stage;
            this.name = trial.name;
            this.desc = trial.desc;
            this.length = trial.length;
            this.tickInterval = trial.tickInterval;
            this.initialBots = trial.initialBots;
            this.recordItems = trial.recordItems;
            this.recordElectric = false // trial.recordElectric;
            this.recordCircuits = false // trial.recordCircuits;
            this.recordPollution = trial.recordPollution;
            this.recordSystem = trial.recordSystem;
            this.startedRunAt = trial.startedRunAt;
            this.startedAt = trial.startedAt;
            this.endedAt = trial.endedAt;
            this.textLogs = trial.textLogs;
            this.metadata = trial.metadata;

            if (trial.source.constructor.name == 'SavedSource')
                this.source = trial.source as SavedSource
            else
                this.source = new SavedSource(trial.source)

        }
        // need to validate source if created here WITHOUT copy
        if (!isCopy && this?.source && this?.source.constructor.name == 'Source') {
            this.source = new SavedSource(this.source)
        }
    }


}