import path from "path";
import * as fs from "fs-extra";
import {Factory} from "../src/Factory";
import {FactoryDatabase} from "../src/FactoryDatabase";
import {Source} from "../src/Source";
import {Trial} from "../src/Trial";

async function main() {

    /*
    * #TODO
    *   - Add more logging - use ai if anything, but log constatntlyyyy anything big that happens
    * */

    await Factory.initialize({
        hideConsole: false,
        // user info is provided auto-magically from oldenv.txt
    })
    await FactoryDatabase.initialize();

    // Load trial requirements
    const bpFile = path.join(process.cwd(), 'factory/examples/45spm_base.bp');
    const bpString = await fs.readFile(bpFile, 'utf8');

    let obj = await Source.blueprintStringToObject(bpString)
    console.log(obj)

    // Create a Source for your blueprint string
    let mySource = new Source({
        name: '45spm_base',
        variant: 'blueprint',
        text: bpString,
        tags: ['test', 'test2'],
        desc: `Loaded from ${bpFile}`
    })

    // Save the Source to the database - OPTIONAL, but useful for tracking and recommended
    mySource = await FactoryDatabase.saveSource(mySource)

    // Loading this source later on can be done by using the ID
    // this ID can be listed from the database source list
    mySource = await FactoryDatabase.loadSource(mySource.id)

    // Create a Trial object
    let myTrial = new Trial({
        name: '45spm_base Trial 1',
        desc: 'Trial run for items and pollution - every second for 1 hour',
        source: mySource,
        length: 72000,
        tickInterval: 15,
        recordItems: true,
        // recordElectric: false, // CURRENTLY DISABLED, NOT FUNCTIONAL YET
        recordCircuits: false,
        recordPollution: false,
        recordSystem: false,
        initialBots: 50
    })

    // Save the Trial to the database - OPTIONAL, but useful for tracking and recommended
    myTrial = await FactoryDatabase.saveTrial(myTrial)

    // Analyze the trial
    // This will not only run the trial, but also clean up any/all data files.
    // All data files will be parsed, optionally saved to the database, summarized, and then deleted
    let results = await Factory.analyzeTrial(myTrial, true, true)

    // write the outputting result dataset - contains all data by category
    console.log(results)


}

main().then(async (t) => {
    console.log('Finished running miscTesting.ts');
}).catch((e) => {
    console.error(e);
})
