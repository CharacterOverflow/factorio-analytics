"use strict";
/*
* Runs a test of Factorio with the given parameters...
* 1. Path to file containing blueprint string
* 2. How many ticks to run for.
* 3. How many ticks between game data polls
* 4. Verbose option (default nothing, see URL for column options. 'all' for all. comma-separated list for multiple aka 'tick,timestamp,wholeUpdate')
*   - File location for verbose output is 5th arg
*
* CLI OPTIONS:
* --benchmark-sanitize
* --benchmark-verbose 'all' (see https://wiki.factorio.com/Command_line_parameters)
* > 'filename' pipes to file
* --benchmark-sanitize
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
;
const command_line_args_1 = __importDefault(require("command-line-args"));
const Trial_1 = require("../src/Trial");
const fs = __importStar(require("fs"));
const Factory_1 = require("../src/Factory");
dotenv.config();
const argOptions = [
    { name: 'name', alias: 'n', type: String, defaultOption: 'benchmark-test' },
    { name: 'bpFile', alias: 'b', type: String },
    { name: 'length', alias: 't', type: Number, defaultOption: 300 },
    { name: 'interval', alias: 'i', type: Number, defaultOption: 5 },
    { name: 'bots', type: Number },
];
const cliOptions = (0, command_line_args_1.default)(argOptions);
console.log('Reading in CLI args...');
console.table(cliOptions);
const length = cliOptions.ticks ? cliOptions.ticks : 300;
const interval = cliOptions.tickInterval ? cliOptions.tickInterval : 5;
const bots = cliOptions.bots;
Factory_1.Factory.initialize({
    installDir: process.env.FACTORIO_INSTALL,
    dataDir: process.env.FACTORIO_DATA,
}).then(() => {
    // Read file with blueprint string
    let bp = fs.readFileSync(cliOptions.bpFile, 'utf8');
    return new Trial_1.Trial({
        bp,
        length,
        interval,
        initialBots: bots,
    });
}).then((trial) => {
    return Factory_1.Factory.runTrial(trial);
}).then((trial) => {
    console.log(`Full exec time: ${trial.data.meta.execTime}`);
}).then(() => {
    console.log('Done');
}).catch((e) => {
    console.error(e);
});
//# sourceMappingURL=runTrial.js.map