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
import * as fs from "fs-extra";
import path from "path";
import {Factory} from "../src/Factory";
import {ModList} from "../src/ModList";
import {Source} from "../src/Source";
import {FactoryDatabase} from "../src/FactoryDatabase";
import {FactoryBackend} from "../src/FactoryBackend";
import {DatasetQuery} from "../src/DatasetAnalysis";
import {IGameFlowItemTick} from "../src/Dataset";
import {FactorioApi} from "../src/FactorioApi";

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

async function main() {
    console.log('SETUP DEBUG STAGE 1 COMPLETE');

    await Factory.initialize({
        installDir: '/home/overflow/Apps/factorio_auto_v3',
        hideConsole: false
        // user info is provided auto-magically from oldenv.txt
    })
    await FactoryDatabase.initialize()
    await FactoryBackend.startServer();

    //const circuitTestBp = await fs.readFile('/home/overflow/Projects/factorio-analytics/factory/examples/circuit_test.txt', 'utf8');
    const scienceTestBp = await fs.readFile('/home/overflow/Projects/factorio-analytics/factory/examples/45spm_base.bp', 'utf-8');

    let s = await FactoryDatabase.listSources(50)

    // try running a basic new trial. circuts to test with for now
    let sciSource = new Source({
        text: scienceTestBp,
        variant: 'blueprint',
        name: 'Sci Test',
        desc: 'A simple test to see if sci data is being recorded properly',
        tags: ['test']
    })

    let trial = new Trial({
        source: sciSource,
        length: 7200 * 2,
        tickInterval: 60,
        initialBots: 200,
        recordItems: true,
        recordSystem: true,
        recordCircuits: true,
        recordPollution: true,
    })

    await FactoryDatabase.saveTrial(trial, true)

    try {
        let data = await Factory.analyzeTrial(trial, true, true)

        let q1 = new DatasetQuery<IGameFlowItemTick>(data.items.data, {
            smoothing: 5,
            valueField: 'cons',
            labelFilter: 'copper-plate'
            // only use excludeEmpty if making a scatter plot of 'produced per tick' or something
        })
        let ul = q1.uniqueLabels();
        let gl = q1.groupByLabel();
        let g2 = q1.groupByTickChunk(q1.dataset, 1800)
        let sl = q1.summaryByLabel();
        let tc = q1.summaryByTickChunk(q1.dataset, 1800)
        let mlist = await FactorioApi.listFactorioMods(undefined, 'max')
        console.log(data, ul, gl, g2, sl, tc);
    } catch (e) {
        console.log(e)
    }




    // lets try running a blueprint test
    // let bp = fs.readFileSync(bpFile, 'utf8');
    //
    // let source = new SavedSource({
    //     blueprint: bp,
    //     name: '45spm_base',
    // });

    // let t = new SavedTrial({
    //     source,
    //     length: 7200,
    //     tickInterval: 60,
    //     initialBots: 200,
    //     recordSystem: true,
    //     recordCircuits: true,
    //     recordPollution: true,
    // })
    //await t.ready
    //await FactoryDatabase.saveTrial(t);
    //let v = await FactoryDatabase.loadTrial(t.id);

    //let results = await Factory.analyzeTrial(t, true);

    //await FactoryDatabase.saveTrial(t, false)

}

main().then(async (t) => {

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
