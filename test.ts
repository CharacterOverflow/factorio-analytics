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

jest.setTimeout(30000)

test('Hello World Test', () => {
    expect(true).toBe(true)
});

/*
*   ||| LOCAL TESTS - FACTORIO EXECUTABLE. This is the 'Factory' container testing
*  */
test('#1 | Basic initialization, no execution', async function () {

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

    await expect(Factory.sandboxLua).toBeDefined();
})
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
test('#2 | Build and run a complex trial, doing basic analysis as well', async function () {
    let bp = await fs.readFile(path.join(process.cwd(), 'factory', 'examples', 'smallbasev2.txt'), 'utf8');
    let trial = new Trial({
        // Blueprint string to run a trial for
        bp,
        //
        length: 7200,
        itemInterval: 300,
        elecInterval: 60,
        circInterval: 600,
        pollInterval: 900,
    });

    await Factory.runTrial(trial);

    // Get iron plates per coal used
    let iRatio = trial.data.get({category: 'item', label: 'iron-plate', direction: 'prod'})
        .per(trial.data.get({category: 'item', label: 'coal', direction: 'cons'}));

    // get the copper plates made per electricity used
    let cRatio = trial.data.get({category: 'item', label: 'copper-plate', direction: 'prod'})
        .per(trial.data.get({category: 'electric', label: 'all', direction: 'cons'}));

    await expect(trial.data.itemStats.length > 100).toBe(true);

});

