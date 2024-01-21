/*
* A BLUEPRINT CHALLENGE is a new object, intended to outline the 'goal' of some blueprint that should be created
* it has constraints and limits, maybe even  extremely specific rules like 'a belt must be placed at 2,1'
* */

import {BlueprintDetails, SourceBlueprintDetails} from "./Source";
import {Trial} from "./Trial";

export interface IBlueprintChallengeSetup {
    name: string;
    allowedItems?: string[];
    bannedItems?: string[];
    entityCountRequirements?: IEntityCountRange[];
}

export class BlueprintChallenge {

    // Name of the challenge itself
    name: string;

    // the 'whitelist' for items that are allowed to be used in the blueprint. If empty, all items are allowed
    allowedEntities: string[] = [];

    // the 'banlist' for items that are NOT allowed to be used in the blueprint. If empty, no items are banned
    bannedEntities: string[] = [];

    // anything listed here is a REQUIREMENT for the blueprint to be considered 'valid'
    entityCountRequirements: IEntityCountRange[] = [];

    /*
    * Should return true if the blueprint is valid, false if not
    * Can be over-ridden by the user, but should call SUPER to get the default behavior first
    * */
    validateSubmission(bc: BlueprintChallenge, bp: SourceBlueprintDetails): boolean {
        // if the bannedEntities list > 0 and if the blueprint has any entities that are in the 'bannedEntities' list, it is invalid
        // if the allowedEntities list > 0 and if the blueprint has any entities that are NOT in the 'allowedEntities' list, it is invalid
        // lastly, if the entity count in the blueprint is not between the min and max of the entityCountRequirements, it is invalid
        // if something is not defined (ie, min or max), it is ignored
        let valid = true;
        let labels = Object.keys(bp.entityCounts);
        this.validationErrors = [];

        // filter out any entities that are banned
        if (this.bannedEntities.length > 0) {
            for (let e of labels) {
                if (this.bannedEntities.includes(e)) {
                    valid = false;
                    this.validationErrors.push(`Entity ${e} is banned and cannot be used in this blueprint`);
                }
            }
        }

        // filter out the allow list
        if (this.allowedEntities.length > 0) {
            for (let e of labels) {
                if (!this.allowedEntities.includes(e)) {
                    valid = false;
                    this.validationErrors.push(`Entity ${e} is not in the allowed list and cannot be used in this blueprint`);
                }
            }
        }

        // check entity count requirements
        if (this.entityCountRequirements.length > 0) {
            for (let e of this.entityCountRequirements) {
                let count = bp.entityCounts[e.label];
                if (e.maxCount != undefined && count > e.maxCount) {
                    valid = false;
                    this.validationErrors.push(`Entity ${e.label} has a count of ${count}, which is greater than the max allowed of ${e.maxCount}`);
                }
                if (e.minCount != undefined && count < e.minCount) {
                    valid = false;
                    this.validationErrors.push(`Entity ${e.label} has a count of ${count}, which is less than the min allowed of ${e.minCount}`);
                }
            }
        }
        return valid
    }
    validationErrors: string[] = [];

    scoreSubmission(bc: BlueprintChallenge, bp: SourceBlueprintDetails, trial: Trial): IBlueprintChallengeScore {
        // score the submission
        // by default - there is NO score functionality and an error will be thrown
        // some sub-classes might have a score built in for easy usage (like, score of items produced within x ticks)
        throw new Error(`Score function not implemented by default`)
    }

    constructor(params: IBlueprintChallengeSetup,
                validateSubmission?: (bc: BlueprintChallenge, bp: SourceBlueprintDetails) => boolean,
                scoreSubmission?: (bc: BlueprintChallenge, bp: SourceBlueprintDetails, trial: Trial) => IBlueprintChallengeScore) {
        if (!params)
            return

        this.name = params.name;
        this.allowedEntities = params.allowedItems ?? [];
        this.bannedEntities = params.bannedItems ?? [];
        this.entityCountRequirements = params.entityCountRequirements ?? [];

        if (validateSubmission)
            this.validateSubmission = validateSubmission
        if (scoreSubmission)
            this.scoreSubmission = scoreSubmission

    }

}

export interface IBlueprintChallengeScore {
    submission: SourceBlueprintDetails;
    trial: Trial;
    totalScore: number;
    breakdown: IBlueprintChallengeScoreBreakdown[]
}

export interface IBlueprintChallengeScoreBreakdown {
    // name of the scoring rule - ie, 'create as many belts as possible'
    name: string

    // explanation of score math in text
    desc: string

    // score for this rule - positive if adds, negative if subtracts
    score: number
}

export interface IEntityCountRange {
    label: string;
    maxCount?: number;
    minCount?: number;
}
