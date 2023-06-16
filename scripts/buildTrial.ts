/*
* Blueprint-Scripts CLI - buildTrial.(ts/js)
*
* PURPOSE - to setup a blueprint string to be used in a trial, but do NOT run the trial itself.
* This is useful for debugging - you can run the trial manually by copying the benchmark-cli folder from 'scenarios' to 'saves'
* Inside factorio, you should be able to go to 'Load Game' and see the benchmark-cli game there. Load it up, and the trial should start!
* Files will still be written  out according to settings, but there is no management code waiting for the trial to finish to cleanup / parse data.
* Look in script-output/data for data files.
*
* */

import * as dotenv from 'dotenv';
import minimist from 'minimist';
import {Trial} from "../src/Trial";
import * as fs from "fs";
import {Factory} from "../src/Factory";
import {Logging} from "../src/Logging";

dotenv.config();
const argv = minimist(process.argv.slice(2));

console.log('Reading in CLI args...');
console.table(argv);

const bpFile = argv.bpFile ? argv.bpFile : (argv.b ? argv.b : null);
const length = argv.length ? argv.length : (argv.l ? argv.l : 18000);   // 5 minutes

const itemInterval = argv.item ? argv.item : (argv.i ? argv.i : 300);
const elecInterval = argv.elec ? argv.elec : (argv.e ? argv.e : null);
const circuitInterval = argv.circ ? argv.circ : (argv.c ? argv.c : null);
const pollInterval = argv.pollution ? argv.pollution : (argv.p ? argv.p : null);
const sysInterval = argv.sys ? argv.sys : (argv.s ? argv.s : null);

const raw = argv.raw ? argv.raw : (argv.r ? argv.r : false);

Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(() => {
    // Read file with blueprint string
    let bp = fs.readFileSync(bpFile, 'utf8');

    return new Trial({
        bp,
        length,
        itemInterval: itemInterval,
        elecInterval: elecInterval,
        circInterval: circuitInterval,
        pollInterval: pollInterval,
        sysInterval: sysInterval,
        raw: raw
    })
}).then((trial) => {
    return Factory.buildTrial(trial);
}).then(() => {
    // Trial has been built! Ready for execution - inform user of how to run it
    Logging.log('info', `Done! You can now manually run the trial via CLI using the command above, or load Factorio (your installation used for this package) and start a new scenario called 'benchmark-cli'. As soon as you load in, the trial has started and will continue until you exit`);
}).then(() => {
    console.log('Done')
}).catch((e) => {
    console.error(e);
})
