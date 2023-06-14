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
import minimist from 'minimist';
import {Trial} from "../src/Trial";
import * as fs from "fs";
import {Factory} from "../src/Factory";
import path from "path";
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
}).then((trial) => {
    // Trial has been built! Ready for execution - inform user of how to run it
    Logging.log('info', `Done! You can now manually run the trial via CLI using the command above, or load Factorio (your installation used for this package) and start a new scenario called 'benchmark-cli'. As soon as you load in, the trial has started and will continue until you exit`);
}).then(() => {
    console.log('Done')
}).catch((e) => {
    console.error(e);
})
