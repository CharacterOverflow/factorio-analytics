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
import path from "path";
import {Factory} from "../src/Factory";
import {SourceBlueprint} from "../src/TrialSource";
import {ModList} from "../src/ModList";

dotenv.config();

const bpFile = path.join(process.cwd(), 'factory/examples/45spm_base.bp');

/*
* CREATE A WAY TO START FACTORY RUNNER WITHOUT INDIVIDUAL VALUES - RATHER, A CONFIG FILE
* specify path, or leave default for 'factory.config.json'
*
* if installed as a package, needs to be easy to use with raw values - dont need to say modlist name, rather list the mods you want to have!
* or scenario - list the scenario name that should be present, no questions asked if it does or not
*
* etc etc
*
* otherwise, API can go from DB mostly and allow user to change things on the frontend
*
* */

Factory.initialize({
    installDir: '/home/overflow/Apps/factorio_auto_v2',
    hideConsole: false
    // user info is provided auto-magically from .env
}).then(async () => {
    console.log('SETUP DEBUG STAGE 1 COMPLETE');

    // lets try running a blueprint test
    let bp = fs.readFileSync(bpFile, 'utf8');

    let source = new SourceBlueprint(bp);

    await source.hashFinished;
    return new Trial({
        source,
        length: 7200,
        tickInterval: 60,
        initialBots: 200,
        recordSystem: false,
        recordCircuits: true,
        recordPollution: true,
    })

}).then(async (t) => {
    let results = await Factory.analyzeTrial(t);
    console.log('TRIAL RUN!');
}).catch((e) => {
    console.error(e);
})
/*
Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli-v1.2',
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
        elecInterval: 300,

        // how many ticks between circ data polls (Each circuit network, and the signals on it)
        circInterval: 300,

        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 300,

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

    let d1 = data
        .get({category: 'electric', label: 'inserter', spec: 'cons', scale: 1000, radix: 2})

    // compare to if we do it all-in-one
    let ratioIronToCoal = data
        .get({category: 'item', label: 'iron-plate', spec: 'prod'})
        .per({category: 'item', label: 'coal', spec: 'cons'});

    // inserter power consumed vs ALL consumed
    let ratioInserterPowerVsAll = data
        .get({category: 'electric', label: 'inserter', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // Assembnler-2 power consumed vs ALL consumed
    let ratioAssembler2PowerVsAll = data
        .get({category: 'electric', label: 'assembling-machine-2', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // Assembnler-2 power consumed vs ALL consumed
    let ratioRefineryPowerVsAll = data
        .get({category: 'electric', label: 'oil-refinery', spec: 'cons', scale: 1000, radix: 2})
        .per({category: 'electric', label: 'all', spec: 'cons', scale: 1000, radix: 2});

    // ratio of iron-plates produced per 10 pollution generated
    let ratioIronToPollution = data
        .get({category: 'item', label: 'iron-plate', spec: 'prod', radix: 1})
        .per({category: 'pollution', label: 'all', scale: 10, radix: 2});

    // Ratio of coal consumed per 100 pollution generated
    let ratioCoalToPollution = data
        .get({category: 'item', label: 'coal', spec: 'cons', radix: 1})
        .per({category: 'pollution', label: 'all', scale: 100, radix: 2});

    // Ratio of iron plates produced per 1000w consumed
    let ratioIronToElectric = data
        .get({category: 'item', label: 'iron-plate', spec: 'prod', radix: 1})
        .per({category: 'electric', label: 'all', scale: 1000000, radix: 2});

    // I DONT KNOW WHY, BUT I HAVE TO MULTIPLY ALL ELECTRIC VALUES BY 2 TO GET THEIR ACTUAL ELECTRIC VALUE!! WTF

    console.log(ratioIronToCoal.descData);
    console.log(ratioInserterPowerVsAll.descData);
    console.log(ratioAssembler2PowerVsAll.descData);
    console.log(ratioRefineryPowerVsAll.descData);
    console.log(ratioIronToPollution.descData);
    console.log(ratioCoalToPollution.descData);
    console.log(ratioIronToElectric.descData);
    console.log('done!');

}).then(() => {
    console.log('Done')
}).catch((e) => {
    console.error(e);
})
*/
