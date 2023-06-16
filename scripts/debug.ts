/*
* Blueprint-Scripts CLI - runTrial.(ts/js)
*
* PURPOSE - to run a Blueprint string that is currently saved in a file, and have the data saved into a local folder
* Very basic, just meant to serve as a CLI method to call 'runTrial' essentially. Afterwards, then writes the exact 'Trial'
* to the current directory, so it can be used for other purposes.
*
* Data written out will be be directed to a JSON file by default, but if CSV is desired use --csv (or -c) flag
*
* */

import * as dotenv from 'dotenv';
import {Trial} from "../src/Trial";
import * as fs from "fs";
import {Factory} from "../src/Factory";
import path from "path";
import {Dataset} from "../src/Dataset";

dotenv.config();

const bpFile = path.join(process.cwd(), 'factory/examples/smallbasev2.txt');

Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(() => {
    // Read file with blueprint string
    let bp = fs.readFileSync(bpFile, 'utf8');

    return new Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp,

        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 108000,

        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 300,

        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 30,

        // how many ticks between circ data polls (Each circuit network, and the signals on it)
        circInterval: 300,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 900,

        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,

        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,

        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    })
}).then((trial) => {
    return Factory.runTrial(trial);
}).then((trial) => {
    // Trial was run. lets test using our datasets!
    let data: Dataset = trial.data;

    // compare to if we do it all-in-one
    let ratioIronToCoal = data
        .get({category: 'item', label: 'iron-plate', direction: 'prod'})
        .per({category: 'item', label: 'coal', direction: 'cons'});

    // inserter power consumed vs ALL consumed
    let ratioInserterPowerVsAll = data
        .get({category: 'electric', label: 'inserter', direction: 'cons'})
        .per({category: 'electric', label: 'all', direction: 'cons'});


    let copperProduced = data.get({label: 'copper-plate', direction: 'prod', category: 'item'});

    console.log(ratioIronToCoal.descData);
    console.log(ratioInserterPowerVsAll.descData);
    console.log(`${copperProduced.min} - ${copperProduced.max} (${copperProduced.avg}) += ${copperProduced.std} ` + copperProduced.desc);
    console.log('done!');

}).then(() => {
    console.log('Done')
}).catch((e) => {
    console.error(e);
})
