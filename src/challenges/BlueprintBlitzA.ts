import {BlueprintChallenge, IBlueprintChallengeScore} from "../BlueprintChallenge";
import {SourceBlueprintDetails} from "../Source";
import {Trial} from "../Trial";

/*
* This challenge is the first week of the blueprint blitz - a test of the systems that I have in place
* NAME: BlueprintBlitzA
* DESC: Create a early-game forge that can produce iron plates in a 16x24 area. Only certain entities are allowed, and
*      scoring rules are in place to discourage electricity usage and expensive entities
* MAX SIZE: 16x24
* ALLOWED ENTITIES - transport-belt, inserter, long-inserter, small-electric-pole, splitter, stone-furnace, underground-belt, burner-inserter
* TRIAL RUNTIME - 15 minutes (54000 ticks)
* SCORE BREAKDOWN:
* - Blueprint Design
*     - (-1) point for each entity that consumes electricity
* - Blueprint Results
*     - 1 point for each iron-plate produced
*
*
* need to load in files in the recipelister folder first to get all this data...
*
*
* */
export class BlueprintBlitzA extends BlueprintChallenge {
    name = 'BlueprintBlitzA';
    allowedEntities = [
        'transport-belt',
        'inserter',
        'long-handed-inserter',
        'small-electric-pole',
        'splitter',
        'stone-furnace',
        'underground-belt',
        'burner-inserter',
        'electric-energy-interface',
        'infinity-chest',
        'loader'
    ]
    entityCountRequirements = [
        {
            label: 'electric-energy-interface',
            minCount: 0,
            maxCount: 1
        },
        {
            label: 'infinity-chest',
            minCount: 3,
            maxCount: 3
        },
        {
            label: 'loader',
            minCount: 0,
            maxCount: 6
        }
    ]

    // dont need constructor - we are defining this challenge as a sub-class
    constructor() {
        super(null);
    }

    // /*
    // * How should we score the submission?
    // * */
    // scoreSubmission(bc: BlueprintChallenge, bp: SourceBlueprintDetails, trial: Trial): IBlueprintChallengeScore {
    //
    // }

}
