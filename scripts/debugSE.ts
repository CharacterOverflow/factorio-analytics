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
import {ModList} from "../src/ModList";
import {Source} from "../src/Source";
import {FactoryDatabase} from "../src/FactoryDatabase";
import {SavedTrial} from "../src/database/SavedTrial";
import {SavedSource} from "../src/database/SavedSource";
import {FactoryBackend} from "../src/FactoryBackend";
import {SavedModList} from "../src/database/SavedModList";

dotenv.config();

const saveFile = '/home/overflow/Apps/Factorio_SEServer/factorio/saves/SE_K2_E62.zip'

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
        // user info is provided auto-magically from .env
    })
    await FactoryDatabase.initialize()

    let modlist = await ModList.fromModListFile('/home/overflow/.factorio/mods/mod-list.json')
    let savedModList = new SavedModList(modlist)
    savedModList.settingsFile = '/home/overflow/.factorio/mods/mod-settings.dat'
    savedModList = await FactoryDatabase.saveModList(savedModList)

    await Factory.cacheModList(savedModList)

    let sesource = new SavedSource({
        saveGamePath: saveFile,
        name: 'SE_K2_E62',
        modList: savedModList,
    })
    await sesource.ready
    sesource = await FactoryDatabase.saveSource(sesource)

    let st = new SavedTrial({
        source: sesource,
        length: 7200,
        tickInterval: 60,
        recordItems: true,
        recordSystem: true,
        name: 'K2_SE_TEST_1',
        desc: 'Space exploration test 1  - just want to read some logs really'
    })
    let t = await FactoryDatabase.saveTrial(st)

    let results = await Factory.analyzeTrial(t)
    console.log(results)
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
