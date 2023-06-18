"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const Logging_1 = require("./Logging");
const winston_1 = __importDefault(require("winston"));
const Dataset_1 = require("./Dataset");
class Factory {
    // Grab the LUA sandboxfile from the scenario dir
    static get sandboxLua() {
        return path_1.default.join(Factory.scenario, 'sandbox.lua');
    }
    static get scenario() {
        return path_1.default.join(Factory.dataDir, 'scenarios', Factory.scenarioName);
    }
    static get executable() {
        return path_1.default.join(Factory.installDir, 'bin', 'x64', 'factorio');
    }
    static initialize(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.installDir = params.installDir;
            this.dataDir = params.dataDir;
            this.sessionId = (0, crypto_1.randomUUID)();
            if (params.scenarioName)
                Factory.scenarioName = params.scenarioName;
            // setup logging
            const logFormat = winston_1.default.format.printf(function (info) {
                return `${info.timestamp}-${info.level}: ${Object.keys(info).length <= 3 ? info.message : JSON.stringify(info, null, 4)}`;
            });
            if (params.hideConsoleLogs === true) {
                Logging_1.Logging.startLogger([
                    new winston_1.default.transports.File({
                        filename: path_1.default.join(process.cwd(), 'factory.log'),
                        level: 'info'
                    })
                ]);
            }
            else {
                Logging_1.Logging.startLogger([
                    new winston_1.default.transports.Console({
                        level: 'info',
                        format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
                    }),
                    new winston_1.default.transports.File({
                        filename: path_1.default.join(process.cwd(), 'factory.log'),
                        level: 'info'
                    })
                ]);
            }
            Logging_1.Logging.log('info', Object.assign({ message: 'Factory initializing - logger started' }, params));
            // Setup mod and scenario information
            yield Factory.setupModsAndScenario();
            // Lastly, validate!
            yield Factory.validateInitialization();
        });
    }
    // Ensure everything is set up and ready to go
    static validateInitialization() {
        return __awaiter(this, void 0, void 0, function* () {
            // Make sure our factorio executable exists.
            let execExists = fs_extra_1.default.pathExists(Factory.executable);
            // Make sure our scenario exists
            let scenarioExists = fs_extra_1.default.pathExists(Factory.scenario);
            // ...with a valid file to write into (sandbox.lua)
            let scenarioLuaExists = fs_extra_1.default.pathExists(Factory.sandboxLua);
            // This will 'throw' an error if any of the above fail harshly, or will be thrown if they return false below
            let d = yield Promise.all([execExists, scenarioExists, scenarioLuaExists]);
            if (d[0] === false)
                throw new Error('Factorio executable not found at ' + Factory.executable);
            if (d[1] === false)
                throw new Error('Scenario directory not found at ' + Factory.scenario);
            if (d[2] === false)
                throw new Error('Scenario LUA file not found at ' + Factory.sandboxLua);
        });
    }
    static setupModsAndScenario() {
        return __awaiter(this, void 0, void 0, function* () {
            Logging_1.Logging.log('info', { message: `Moving template scenario to location ${path_1.default.join(Factory.dataDir, 'scenarios', 'scenario')}` });
            try {
                yield fs_extra_1.default.copy(path_1.default.join(__dirname, '../', '../', 'factory', 'scenario'), Factory.scenario, { overwrite: true });
            }
            catch (e) {
                Logging_1.Logging.log('info', { message: `Failed to copy scenario to ${Factory.scenario} - trying again with different path, this is likely due to running unit tests` });
                yield fs_extra_1.default.copy(path_1.default.join(__dirname, '../', 'factory', 'scenario'), Factory.scenario, { overwrite: true });
            }
            // write required mods (there really aren't any "required", but for some of the more advanced features we need the recipe-lister mod to provide us with recipes.
            // this is not automatic either yet - running a scenario or starting a new game is required on this installation first before recipe data is available. After this is done once, the crafting
            // data is saved. Either way, the code isn't there to read the data - yet.
            try {
                yield fs_extra_1.default.copy(path_1.default.join(__dirname, '../', '../', 'factory', 'mods'), path_1.default.join(Factory.dataDir, 'mods'), { overwrite: true });
            }
            catch (e) {
                Logging_1.Logging.log('info', { message: `Failed to copy mods to ${path_1.default.join(Factory.dataDir, 'mods')} - trying again with different path, this is likely due to running unit tests` });
                yield fs_extra_1.default.copy(path_1.default.join(__dirname, '../', 'factory', 'mods'), Factory.scenario, { overwrite: true });
            }
        });
    }
    static deleteRawFiles(trial) {
        return __awaiter(this, void 0, void 0, function* () {
            // deletes all raw files associated with this trial in the script-output directory
            let trialId = typeof trial === 'string' ? trial : trial.id;
            try {
                yield Promise.allSettled([
                    fs_extra_1.default.rm(path_1.default.join(Factory.dataDir, 'script-output', 'data', `${trialId}_item.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.dataDir, 'script-output', 'data', `${trialId}_elec.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.dataDir, 'script-output', 'data', `${trialId}_circ.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.dataDir, 'script-output', 'data', `${trialId}_poll.jsonl`))
                ]);
            }
            catch (e) {
                Logging_1.Logging.log('error', { message: `Failed to delete raw files for trial ${trialId}`, error: e });
            }
        });
    }
    // Returns the data contained inside 'filename', from script=output directory
    static loadRawFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs_extra_1.default.readFile(path_1.default.join(Factory.dataDir, 'script-output', filename), 'utf8');
        });
    }
    /*
    * This function is used to 'build' a trial.
    *
    * Seeing as we need to write to a file before we actually 'run' a trial, this stage is required.
    * */
    static buildTrial(t) {
        return __awaiter(this, void 0, void 0, function* () {
            Factory.runningTrialStage = 'writing-config';
            Factory.runningTrial = t;
            Logging_1.Logging.log('info', { message: `Building trial ${t.id} for execution... BP Size: ${t.bp.bp.length}}` });
            // Read our sandbox lua file
            let d = yield fs_extra_1.default.readFile(Factory.sandboxLua, 'utf8');
            Logging_1.Logging.log('info', { message: `Replacing UID, BP, and other parameter values in ${Factory.scenarioName}/sandbox.lua definition` });
            // Find where our UID is defined, and replace it with the UID we want. Do the same with BP and ticks settings
            d = Factory._replaceLineAfterKey(d, '--<UID>--', `\nlocal uid = '${t.id}'`);
            d = Factory._replaceLineAfterKey(d, '--<BLUEPRINT>--', `\nlocal bpStr = '${t.bp.bp}'`);
            d = Factory._replaceLineAfterKey(d, '--<ITEM_TICKS>--', `\nlocal item_ticks = ${t.itemInterval ? t.itemInterval : 'nil'}`);
            d = Factory._replaceLineAfterKey(d, '--<ELEC_TICKS>--', `\nlocal elec_ticks = ${t.elecInterval ? t.elecInterval : 'nil'}`);
            d = Factory._replaceLineAfterKey(d, '--<CIRC_TICKS>--', `\nlocal circ_ticks = ${t.circInterval ? t.circInterval : 'nil'}`);
            d = Factory._replaceLineAfterKey(d, '--<POLL_TICKS>--', `\nlocal poll_ticks = ${t.pollInterval ? t.pollInterval : 'nil'}`);
            d = Factory._replaceLineAfterKey(d, '--<BOTS>--', `\nlocal bots = ${t.initialBots}`);
            Logging_1.Logging.log('info', { message: `Writing back to scenario/sandbox.lua` });
            // Write back to file
            yield fs_extra_1.default.writeFile(Factory.sandboxLua, d, 'utf8');
            // Build our command we expect to run, set as builtCmd
            Factory.builtCmdParams = [
                '--benchmark', `${Factory.scenario}`,
                '--benchmark-ticks', `${t.length}`,
                '--benchmark-verbose', 'all'
            ];
            Factory.builtTrial = t.id;
            Factory.runningTrialStage = 'built';
            Logging_1.Logging.log('info', { message: `Trial ${t.id} built for execution, ready to run! If you want to run this manually via CLI to observe the raw results, use the following command:` });
            Logging_1.Logging.log('info', { message: `${Factory.executable} ${Factory.builtCmdParams.join(' ')}` });
            return t;
        });
    }
    // Options are for this specific trial only. Main functionality currently for this is to 'skip' data processing on a trial, if the
    // data is going to be used raw for other cases
    static runTrial(t, skipProcessing = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Logging_1.Logging.log('info', { message: `Starting trial ${t.id}...` });
            if (this.runningTrial)
                throw new Error('A trial is already running - please wait until completion or clear runningTrial manually');
            t.startedAt = new Date();
            // If the trial isn't built, we need to build it first
            if (t.id != Factory.builtTrial)
                yield Factory.buildTrial(t);
            Logging_1.Logging.log('info', { message: `Running built trial ${Factory.builtTrial}` });
            const startedExecAt = new Date();
            let execResults = '';
            Factory.runningTrialStage = 'exec';
            // Run our test, save output of exec to var
            yield new Promise((resolve, reject) => {
                let s = (0, child_process_1.spawn)(Factory.executable, Factory.builtCmdParams, {});
                let er;
                s.stdout.on('data', (data) => {
                    execResults += data;
                });
                s.on('close', (code) => {
                    // test has finished - proceed!
                    if (er)
                        reject(er);
                    else if (code === 1)
                        reject('Could not start executable - is the game currently running?');
                    else
                        resolve(code);
                });
                s.on('error', (err) => {
                    er = err;
                });
            });
            // Start building our results object. Copy params to new object, then add in our results
            t.endedAt = new Date();
            Factory.runningTrialStage = 'post-exec';
            Logging_1.Logging.log('info', { message: `Finished trial ${t.id} - moving into post-exec stage` });
            // Depending on the interval settings in 'trial', we will parse the needed files
            let d = new Dataset_1.Dataset({
                execStartTime: startedExecAt,
                trial: t,
                rawSysData: execResults
            });
            t.linkData(d);
            if (skipProcessing === true || t.keepRaw === true) {
                d.skipProcess(path_1.default.join(Factory.dataDir, 'script-output'));
                Factory.runningTrialStage = 'done';
                return t;
            }
            else {
                d.process(path_1.default.join(Factory.dataDir, 'script-output'));
                yield Factory.deleteRawFiles(t);
                Factory.runningTrialStage = 'done';
                return t;
            }
        });
    }
    static _replaceLineAfterKey(source, key, newLine) {
        // Find where our <key> is defined, and replace it with the UID we want
        let uidReplaceStart = source.indexOf('\n', source.indexOf(key) + 1);
        let uidReplaceEnd = source.indexOf('\n', uidReplaceStart + 1);
        return source.replace(source.substring(uidReplaceStart, uidReplaceEnd), newLine);
    }
}
Factory.scenarioName = 'benchmark';
// the 'UUID' of the trial that is currently set up to run / is running. Set during buildTrial
Factory.builtTrial = null;
Factory.builtCmdParams = null;
// The current trial that is running
Factory.runningTrial = null;
Factory.runningTrialStage = 'ready';
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map