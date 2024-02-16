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
import {FactoryLocalBackend} from "../src/FactoryLocalBackend";

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

    const bpString = await fs.readFile(bpFile, 'utf8');

    await Factory.initialize({
        installDir: '/home/overflow/Apps/factorio_auto_v5',
        hideConsole: false,
        build: 'alpha'
        // user info is provided auto-magically from oldenv.txt
    })
    await FactoryDatabase.initialize();
    let obj = await Source.blueprintStringToObject(bpString)
    console.log(obj);
}

main().then(async (t) => {

    console.log('Started');
}).catch((e) => {
    console.error(e);
})
