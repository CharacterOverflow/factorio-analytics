"use strict";
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
const Logging_1 = require("../src/Logging");
dotenv.config();
const argv = (0, minimist_1.default)(process.argv.slice(2));
console.log('Reading in CLI args...');
console.table(argv);
const bpFile = argv.bpFile ? argv.bpFile : (argv.b ? argv.b : null);
const length = argv.length ? argv.length : (argv.l ? argv.l : 18000); // 5 minutes
const itemInterval = argv.item ? argv.item : (argv.i ? argv.i : 300);
const elecInterval = argv.elec ? argv.elec : (argv.e ? argv.e : null);
const circuitInterval = argv.circ ? argv.circ : (argv.c ? argv.c : null);
const pollInterval = argv.pollution ? argv.pollution : (argv.p ? argv.p : null);
const sysInterval = argv.sys ? argv.sys : (argv.s ? argv.s : null);
const raw = argv.raw ? argv.raw : (argv.r ? argv.r : false);
Factory_1.Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
    scenarioName: 'benchmark-cli',
    hideConsoleLogs: false
}).then(() => {
    // Read file with blueprint string
    let bp = fs.readFileSync(bpFile, 'utf8');
    return new Trial_1.Trial({
        bp,
        length,
        itemInterval: itemInterval,
        elecInterval: elecInterval,
        circInterval: circuitInterval,
        pollInterval: pollInterval,
        sysInterval: sysInterval,
        raw: raw
    });
}).then((trial) => {
    return Factory_1.Factory.buildTrial(trial);
}).then(() => {
    // Trial has been built! Ready for execution - inform user of how to run it
    Logging_1.Logging.log('info', `Done! You can now manually run the trial via CLI using the command above, or load Factorio (your installation used for this package) and start a new scenario called 'benchmark-cli'. As soon as you load in, the trial has started and will continue until you exit`);
}).then(() => {
    console.log('Done');
}).catch((e) => {
    console.error(e);
});
//# sourceMappingURL=buildTrial.js.map