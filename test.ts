/*
* THIS UNIT TESTING IS EXTREMELY, INCREDIBLY, BASIC. IT NEEDS TO BE IMPROVED FOR FUTURE VERSIONS!!!!
* This is my first time really using Jest (used AVA in the past), so right now I just have a basic init test and a basic trial test.
* Running a second trial in this file will not work, as it tries to run them side-by-side async. This is not supported by the Factory,
* as the executable can only be running once. I need to do more work here setting up tests so that they can be run SEQUENTIALLY, which
* requires a bit more learning and setup as far as I understand right now. I'll get there before v1.1, as I want reliable testing before adding more features
* */
import {Factory} from "./src/Factory";
import {Trial} from "./src/Trial";
import fs from "fs-extra";
import path from "path";

require('dotenv').config();

import 'jest'
import {Logging} from "./src/Logging";

jest.setTimeout(30000)

test('Hello World Test', () => {
    expect(true).toBe(true)
});

/*
test('#2 | Build and run a basic trial', async function () {

    let bp = await fs.readFile(path.join(process.cwd(), 'factory', 'examples', 'smallbase.txt'), 'utf8');
    let trial = new Trial({
        bp,
        length: 60,
        interval: 1,
        initialBots: 150
    })

    await Factory.runTrial(trial);

    await expect(trial.data.itemStats.length > 100).toBe(true);

});
*/
test('#1 | Build and run a complex trial, doing basic analysis as well', async function () {
    // Initialize the factory
    await Factory.initialize({
        // INSTALL DIR of factorio - inside this folder should be others like 'bin' and 'data'
        installDir: process.env.FACTORIO_INSTALL,

        // DATA DIR of factorio - inside this folder should be others like 'mods' and 'scenarios'. This is the user information about factorio
        // NOTE - If you have installed Factorio to a custom location yourself (ie, not through Steam or any other launcher), this will be the same as the installDir
        dataDir: process.env.FACTORIO_DATA,

        // The name to use for the scenario. This will be the name of the folder inside the 'scenarios' folder
        scenarioName: 'unit-test',

        // Whether or not we want to hide console logs to the user. Will still be written to file
        hideConsoleLogs: true
    });

    let bp = await fs.readFile(path.join(process.cwd(), 'factory', 'examples', 'smallbasev2.txt'), 'utf8');
    let trial = new Trial({
        // Blueprint string to run a trial for
        bp,
        //
        length: 7200,
        itemInterval: 300,
        elecInterval: 300,
        circInterval: 600,
        pollInterval: 300,
    });

    await Factory.runTrial(trial);
    const data = trial.data;

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

    Logging.log('info',ratioIronToCoal.descData);
    Logging.log('info',ratioInserterPowerVsAll.descData);
    Logging.log('info',ratioAssembler2PowerVsAll.descData);
    Logging.log('info',ratioRefineryPowerVsAll.descData);
    Logging.log('info',ratioIronToPollution.descData);
    Logging.log('info',ratioCoalToPollution.descData);
    Logging.log('info',ratioIronToElectric.descData);

    await expect(trial.data.itemStats.length > 100).toBe(true);

});

