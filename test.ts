import test from 'ava';
//import {Factory, Trial} from "./dist";
import fs from "fs-extra";
import {Factory} from "./src/Factory";
import {Trial} from "./src/Trial";
import {Logging} from "./src/Logging";

const fn = () => 'foo';
require('dotenv').config();

test.serial('fn() returns foo', t => {
    t.is(fn(), 'foo');
});

/*
* Unit tests are not yet implemented, but AVA is set now set up and capable.
*
* I expect to be adding tests one by one as I go, for now this is left as-is.
*
* Need to test...
*
* - Building a trial
* - Running a trial
* - Building a trial with mods
* - Running a trial with mods
* - Compile a custom scenario
* - Process results of a trial
*
* */
/*
test.serial('Basic Factory Run A', async t => {
    await Factory.initialize({
        installDir: '/home/overflow/Apps/factorio_auto/',
    })
    const bpA = fs.readFileSync('./factory/examples/1200spm_base.bp', 'utf8');

    let trialA = new Trial({
        bp: bpA,
        length: 36000,
        itemInterval: 150,
        elecInterval: 150,
        circInterval: 150,
        pollInterval: 150,
        sysInterval: 150
    })

    await Factory.runTrial(trialA);

    let fragIron = trialA.data.get({
        category: 'item',
        label: 'iron-plate',
        spec: 'all'
    })
    fragIron.recalculate()
    let fragCopper = trialA.data.get({
        category: 'item',
        label: 'copper-plate',
        spec: 'all'
    })
    fragCopper.recalculate()

    console.log(fragIron.total)
    console.log(fragCopper.total)

    fs.writeFileSync('/home/overflow/Projects/factorio-analytics/test_results2.json', JSON.stringify({
        fragIron, fragCopper
    }));

    Logging.log('info', 'TESTING - Trial has been run!');

    // {"label":"water","tick":60,"cons":180,"prod":0}
    // ensure we have water consumption on this test - implies the rest of the blueprint is running



})
*/
