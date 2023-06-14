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
const file = argv.file ? argv.file : (argv.f ? argv.f : null);

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
    return Factory.runTrial(trial, raw);
}).then((trial) => {
    // Trial was run. We will now write data out - if file was provided, we write there, otherwise we write to current directory
    Logging.log('info','Writing trial data to file');
    if (file) {
        fs.writeFileSync(file, JSON.stringify(trial), 'utf8');
    } else {
        fs.writeFileSync(path.join(process.cwd(), `${trial.id}.json`), JSON.stringify(trial), 'utf8');
    }
}).then(() => {
    console.log('Done')
}).catch((e) => {
    console.error(e);
})
