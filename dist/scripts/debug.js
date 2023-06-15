"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const minimist_1 = __importDefault(require("minimist"));
const Trial_1 = require("../src/Trial");
const fs = __importStar(require("fs"));
const Factory_1 = require("../src/Factory");
const path_1 = __importDefault(require("path"));
dotenv.config();
const argv = (0, minimist_1.default)(process.argv.slice(2));
console.log('Reading in CLI args...');
//console.table(argv);
const bpFile = path_1.default.join(process.cwd(), 'factory/examples/k2_starter.txt');
const length = 18000; /// 5 minutes
const itemInterval = 300;
const elecInterval = 60;
const circuitInterval = 300;
const pollInterval = 900;
const sysInterval = 60;
Factory_1.Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(() => {
    // Read file with blueprint string
    let bp = fs.readFileSync(bpFile, 'utf8');
    return new Trial_1.Trial({
        // Either a reference to the blueprint object, or a blueprint string itself to run
        bp,
        // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
        length: 108000,
        // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
        itemInterval: 300,
        // how many ticks between elec data polls (The power usage and production of the factory, per network)
        elecInterval: 60,
        // how many ticks between circ data polls (Each circuit network, and the signals on it)
        circInterval: 300,
        // how many ticks between Pollution data polls (The pollution of the factory, total)
        pollInterval: 900,
        // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
        sysInterval: 300,
        // how many logistic bots to start roboports with. If left as is, none will be placed
        initialBots: 300,
        // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
        raw: false
    });
}).then((trial) => {
    return Factory_1.Factory.runTrial(trial);
}).then((trial) => {
    // Trial was run. lets test using our datasets!
    let data = trial.data;
    // compare to if we do it all-in-one
    let ratioIronToCoal = data
        .get({ category: 'item', label: 'iron-plate', direction: 'prod' })
        .per({ category: 'item', label: 'coal', direction: 'cons' });
    // inserter power consumed vs ALL consumed
    let ratioInserterPowerVsAll = data
        .get({ category: 'electric', label: 'inserter', direction: 'cons' })
        .per({ category: 'electric', label: 'all', direction: 'cons' });
    let copperProduced = data.get({ label: 'copper-plate', direction: 'prod', category: 'item' });
    console.log(ratioIronToCoal.desc);
    console.log(ratioInserterPowerVsAll.desc);
    console.log('done!');
}).then(() => {
    console.log('Done');
}).catch((e) => {
    console.error(e);
});
//# sourceMappingURL=debug.js.map