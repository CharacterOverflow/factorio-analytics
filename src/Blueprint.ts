import crypto from "crypto";

/*
* This class will represent a single BLUEPRINT (aka a Factory or Design) that we want to be able to use
* This blueprint will be used NOT ONLY to run the benchmark, but also to draw information about the blueprint itself such
* as entities, pollution, energy usage, and more.
*
* At a minimum, a blueprint requires a blueprint string to be valid. However, more  details can always be added / generated
* */
export class Blueprint {

    // the 'ID' of a blueprint is simple the hash of its blueprint value
    id: string

    // CANNOT CHANGE - make a new blueprint if this is going to change
    readonly bp: string;

    constructor(bp: string) {
        this.bp = bp.replaceAll('\n', '');
        this.parse();
    }

    // parses blueprint to fill out data in this class
    parse() {
        if (!this.id)
            this.id = crypto.createHash('sha256').update(this.bp).digest('hex');

    }

    // What other details should be included in this class? Open the blueprint and list entities? What is needed?
    // This is being left a full complete class as I expect many things to be added here in the future
    // #TODO

}
