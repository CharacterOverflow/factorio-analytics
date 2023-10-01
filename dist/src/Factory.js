"use strict";
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
/*
* Parameters to startup the factory
* */
const Logging_1 = require("./Logging");
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os = __importStar(require("os"));
const FactorioApi_1 = require("./api/FactorioApi");
const decompress_1 = __importDefault(require("decompress"));
const decompress_tarxz_1 = __importDefault(require("decompress-tarxz"));
const child_process_1 = require("child_process");
const process = __importStar(require("process"));
const Dataset_1 = require("./Dataset");
/*
* Trial Prepare, Compile, Run, and Analyze

There are 4 main steps required before we can actually 'process' our trial

(NOTE) Save Game these steps change a bit, but the core concept is the same

    Prepare - Makes lua changes, inserts text into files, moves files to correct locations
        Blueprint
            Copy template scenario to trial ID scenario folder
            Modify scenario file with your parameters provided
            Trial marked as Prepared
        Save Game
            Extract save .zip file into trial ID save folder
            Copy 'savegame.lua' scenario lua into new 'save' folder
            Modify control.lua to include our savegame.lua
            Modify savegame.lua with your parameters provided
        Download mods set up in the 'source'
        Trial Marked as Prepared and Compiled
    Compile - Run factorio executable to convert scenario -> save (ONLY IF BLUEPRINT)
        Blueprint
            Call factorio executable to convert 'Scenario' into 'Save'
            Extract 'scenario.zip' save file that was generated into 'scenario' folder in saves
            Trial marked as 'Compiled'
    Run
        No matter what option chosen for trial, factorio executable is called to run benchmark for LENGTH ticks
        After execution, save folder is deleted (and scenario folder if it exists)
        Returns RawDataset object
    Analyze
        Technically optional, but also handles cleanup of data files
        Files in script-output for this Trial are loaded, analyzed, then deleted once all data is parsed and accounted for
        Returns Dataset object

From here, you can now freely use your data!

All of these steps can be called and done individually if desired, but will also occur whenever you call any 'later' step

Ie, if you call FactoryRunner.Analyze(trial) - it will go through the process of prepare->compile->run->analyze then return Dataset

Ie, if you call FactoryRunner.Run(trial) - it will go throught he process of prepare->compile->run then return RawDataset

You can also then batch tons of trials together.

Say you had 1000 trials - its likely far faster to batch-prepare-compile them all, then run them all together
* */
/*
* The main 'runner' - this class is used for accessing all executable functionality, along with preping and setting
* the data needed in filesystem. It should include as little references out as possible!
* */
class Factory {
    static prepareTrial(t) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(t === null || t === void 0 ? void 0 : t.id))
                throw new Error('Cannot prepare trial! ID is missing, or trial is null');
            // IF BLUEPRINT SOURCE!!
            // copy template-scenario to trial ID scenario folder
            // modify <trialfolder>/sandbox.lua with your parameters provided
            // download and move mods into the correct folder
            // mark as prepared
            t.setStage('preparing');
            try {
                if (t.source.type == 'blueprint') {
                    // COpy our scenario source to scenarios, as we need it for blueprint running
                    let trialFolder = yield Factory.copyScenarioSourceToFolder(t.id);
                    // now, we need to modify the sandbox.lua file with our parameters
                    yield Factory.writeKeyValuesToLuaFile(path_1.default.join(trialFolder, 'sandbox.lua'), {
                        UID: t.id,
                        BLUEPRINT: t.source.bp,
                        ITEM_TICKS: t.recordItems ? t.tickInterval : null,
                        ELEC_TICKS: t.recordElectric ? t.tickInterval : null,
                        CIRC_TICKS: t.recordCircuits ? t.tickInterval : null,
                        POLL_TICKS: t.recordPollution ? t.tickInterval : null,
                        BOTS: t.initialBots,
                    });
                    // #TODO NEED TO GET THE MODLIST EXTRACTED FROM A BLUEPRINT!
                }
                else if (t.source.type == 'savegame') {
                    // 1. copy the save to the saves folder renaming it as the Trial ID
                    // 2. delete trial ID folder in 'saves' if it exists (NOT .zip)
                    // 3. Extract the save file to a folder of the same name
                    // copy savegame.lua
                    // modify control.lua
                    // copy the original save to the saves folder, renaming it as the trial ID
                    Logging_1.Logging.log('info', `Copying save ${t.source.savePath} to ${t.id}.zip`);
                    yield fs_extra_1.default.copyFile(t.source.savePath, path_1.default.join(Factory.factoryDataPath, 'saves', t.id + '.zip'));
                    // delete trial ID folder in 'saves' if it exists
                    Logging_1.Logging.log('info', `Deleting existing save folder ${t.id} if present`);
                    yield fs_extra_1.default.remove(path_1.default.join(Factory.factoryDataPath, 'saves', t.id));
                    // extract save file
                    Logging_1.Logging.log('info', `Extracting save file ${t.id}.zip to ${path_1.default.join(Factory.factoryDataPath, 'saves', t.id)}`);
                    yield (0, decompress_1.default)(path_1.default.join(Factory.factoryDataPath, 'saves', t.id + '.zip'), path_1.default.join(Factory.factoryDataPath, 'saves'));
                    // copy savegame.lua
                    Logging_1.Logging.log('info', `Copying savegame.lua to ${path_1.default.join(Factory.factoryDataPath, 'saves', t.id)}`);
                    yield fs_extra_1.default.copyFile(path_1.default.join(__dirname, '../', '../', 'factory', 'savegame.lua'), path_1.default.join(Factory.factoryDataPath, 'saves', t.id, 'savegame.lua'));
                    // modify control.lua
                    Logging_1.Logging.log('info', `Modifying control.lua to include savegame.lua`);
                    let controlLua = yield fs_extra_1.default.readFile(path_1.default.join(Factory.factoryDataPath, 'saves', t.id, 'control.lua'), { encoding: 'utf8' });
                    controlLua += 'handler.add_lib(require("savegame"))';
                    yield fs_extra_1.default.writeFile(path_1.default.join(Factory.factoryDataPath, 'saves', t.id, 'control.lua'), controlLua, { encoding: 'utf8' });
                    // #todo NEED TO GET THE MODLIST EXTRACTED FROM A SAVEGAME!
                }
                else
                    throw new Error('Cannot prepare trial! Unknown source type provided');
                // download the mods specified in 'source' if we can. do NOT move them into the 'mods' folder yet
                if ((_a = t.source) === null || _a === void 0 ? void 0 : _a.modList)
                    yield Factory.cacheModList(t.source.modList);
            }
            catch (e) {
                Logging_1.Logging.log('error', { message: `Failed to prepare trial ${t.id}`, error: e });
                throw e;
            }
            t.setStage('prepared');
        });
    }
    static compileTrial(t) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(t === null || t === void 0 ? void 0 : t.id))
                throw new Error('Cannot prepare trial! ID is missing, or trial is null');
            // trial must be prepared before we can compile it - if not, prepare it
            if (t.stage !== 'prepared')
                yield Factory.prepareTrial(t);
            // we do the executable check inside IF so that savegames don't throw an error
            // savegames as a whole dont need to be compiled, so we just skip this step
            if (t.source.type == 'blueprint') {
                if (Factory.isTrialRunning)
                    throw new Error('Cannot compile trial! Factorio executable is already running');
                Factory.isTrialRunning = true;
                // compiling step for 'save game' source does nothing - compiling turns a scenario into a save, no point there
                t.setStage('compiling');
                try {
                    // First off, we need to move our mod configuration files into the mods folder if they exist
                    yield Factory.applyModsOfSource(t.source);
                    // remove existing compile folder and zip file if exists
                    yield fs_extra_1.default.remove(path_1.default.join(Factory.factoryDataPath, 'saves', t.id + '.zip'));
                    yield fs_extra_1.default.remove(path_1.default.join(Factory.factoryDataPath, 'saves', t.id));
                    // run factorio executable to convert scenario -> save
                    Logging_1.Logging.log('info', `Compiling scenario ${t.id} into save file`);
                    let results = yield Factory.runFactorio(['-m', t.id]);
                    if (!fs_extra_1.default.existsSync(path_1.default.join(Factory.factoryDataPath, 'saves', `${t.id}.zip`))) {
                        yield fs_extra_1.default.writeFile(path_1.default.join(Factory.factoryDataPath, 'compile.log'), results.execResults, { encoding: 'utf8' });
                        throw new Error(`Scenario ${t.id} could not be compiled! Zip save file does not exist - check 'compile.log' for more details`);
                    }
                    else
                        Logging_1.Logging.log('info', `Scenario ${t.id} compiled in ${results.end.getTime() - results.start.getTime()}ms`);
                    // extract the save file to a folder of the same name
                    Logging_1.Logging.log('info', `Extracting save file ${t.id}.zip to ${path_1.default.join(Factory.factoryDataPath, 'saves', t.id)}`);
                    yield (0, decompress_1.default)(path_1.default.join(Factory.factoryDataPath, 'saves', `${t.id}.zip`), path_1.default.join(Factory.factoryDataPath, 'saves'));
                    if (!fs_extra_1.default.existsSync(path_1.default.join(Factory.factoryDataPath, 'saves', t.id, 'sandbox.lua')))
                        throw new Error(`Scenario ${t.id} was not extracted! Save Folder does not exist - extract ${t.id}.zip manually if needed`);
                    Factory.isTrialRunning = false;
                }
                catch (e) {
                    Factory.isTrialRunning = false;
                    Logging_1.Logging.log('error', { message: `Failed to compile scenario ${t.id}`, error: e });
                    throw e;
                }
            }
            t.setStage('compiled');
        });
    }
    static runTrial(t) {
        return __awaiter(this, void 0, void 0, function* () {
            // should just run the trial, nothing more. dont do data analysis here
            if (!(t === null || t === void 0 ? void 0 : t.id))
                throw new Error('Cannot run trial! ID is missing, or trial is null');
            // trial must be compiled before we can run it - if not, compile it
            if (t.stage !== 'compiled')
                yield Factory.compileTrial(t);
            if (Factory.isTrialRunning)
                throw new Error('Cannot run trial! Factorio executable is already running');
            Factory.isTrialRunning = true;
            t.setStage('running');
            try {
                yield Factory.applyModsOfSource(t.source);
                t.startedRunAt = new Date();
                Logging_1.Logging.log('info', { message: `Running trial ${t.id}` });
                const execParams = ['--benchmark', `${t.id}`,
                    '--benchmark-ticks', `${t.length}`];
                if (t.recordSystem) {
                    execParams.push('--benchmark-verbose');
                    execParams.push('all');
                }
                let r = yield Factory.runFactorio(execParams);
                t.startedAt = r.start;
                t.endedAt = r.end;
                // parse out some info from text results - this is fast and just text parsing, when we get to sys data we proceed
                let gameTimeStart = r.execResults.indexOf('Performed ');
                // If there is a trial - we read up until the data. Else, we read up until the end
                let idxA = r.execResults.indexOf('run 1:');
                let gameTimeSubstr = r.execResults.substring(gameTimeStart, idxA >= 0 ? idxA : r.execResults.length - 1);
                //Read very last row of execResults for perfTime - all we need there. Then do perf stats
                let lastIdx = r.execResults.substring(0, r.execResults.length - 1).lastIndexOf('\n');
                let lastLine = r.execResults.substring(lastIdx);
                let perfTime = lastLine.substring(3, lastLine.length - 8);
                let execTime = (Number.parseFloat(perfTime)) * 1000;
                // Grab the first newline after the 'run' declaration, then substring from there until end of file
                let perfStart = r.execResults.indexOf('\n', r.execResults.indexOf('run 1:'));
                let perfSubstr = r.execResults.substring(perfStart + 1, lastIdx);
                // Record our end parsing time.
                let nd = (new Date()).getTime();
                // Grab the text logs that prefix our raw system data
                t.textLogs = r.execResults.substring(0, idxA).split('\n');
                // We parse this way later in the analysis stage. We just do enough to split out textlogs and metadata
                t.rawSystemText = perfSubstr;
                t.metadata = {
                    updates: Number.parseInt(gameTimeSubstr.substring(10, gameTimeSubstr.indexOf(' ', 10))),
                    avg: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('avg:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('avg:') + 4))),
                    min: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('min:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('min:') + 4))),
                    max: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('max:') + 4, gameTimeSubstr.indexOf('ms', gameTimeSubstr.indexOf('max:') + 4))),
                    trialTime: Number.parseFloat(gameTimeSubstr.substring(gameTimeSubstr.indexOf('in ') + 3, gameTimeSubstr.indexOf('ms'))),
                    //points: gdRaw.split('\n').length - 1,
                    totalTime: nd - t.startedAt.getTime(),
                    execTime: execTime
                };
                Logging_1.Logging.log('info', { message: `Finished trial ${t.id} - parsing console outputs` });
                Factory.isTrialRunning = false;
                // #todo check if script-output files were made... can do this later
            }
            catch (e) {
                Factory.isTrialRunning = false;
                Logging_1.Logging.log('error', { message: `Failed to run trial ${t.id}`, error: e });
                throw e;
            }
            t.setStage('ran');
        });
    }
    static analyzeTrial(t) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(t === null || t === void 0 ? void 0 : t.id))
                throw new Error('Cannot analyze trial! ID is missing, or trial is null');
            // trial must be compiled before we can run it - if not, compile it
            if (t.stage !== 'ran')
                yield Factory.runTrial(t);
            t.setStage('analyzing');
            try {
                let rObj = {};
                if (t.recordItems) {
                    Logging_1.Logging.log('info', { message: `Analyzing item data for trial ${t.id}` });
                    let itemDataset = new Dataset_1.ItemDataset(t, path_1.default.join(Factory.scriptOutputPath, 'data', t.dataFiles.items));
                    yield itemDataset.parseData();
                    rObj.items = itemDataset;
                }
                if (t.recordElectric) {
                    Logging_1.Logging.log('info', { message: `Analyzing electric data for trial ${t.id}` });
                    let electricDataset = new Dataset_1.ElectricDataset(t, path_1.default.join(Factory.scriptOutputPath, 'data', t.dataFiles.electric));
                    yield electricDataset.parseData();
                    rObj.electric = electricDataset;
                }
                if (t.recordCircuits) {
                    Logging_1.Logging.log('info', { message: `Analyzing circuit data for trial ${t.id}` });
                    let circuitDataset = new Dataset_1.CircuitDataset(t, path_1.default.join(Factory.scriptOutputPath, 'data', t.dataFiles.circuits));
                    yield circuitDataset.parseData();
                    rObj.circuits = circuitDataset;
                }
                if (t.recordPollution) {
                    Logging_1.Logging.log('info', { message: `Analyzing pollution data for trial ${t.id}` });
                    let pollutionDataset = new Dataset_1.PollutionDataset(t, path_1.default.join(Factory.scriptOutputPath, 'data', t.dataFiles.pollution));
                    yield pollutionDataset.parseData();
                    rObj.pollution = pollutionDataset;
                }
                if (t.recordSystem) {
                    Logging_1.Logging.log('info', { message: `Analyzing system data for trial ${t.id}` });
                    let systemDataset = new Dataset_1.SystemDataset(t, t.rawSystemText);
                    yield systemDataset.parseData();
                    rObj.system = systemDataset;
                }
                yield Factory.deleteScriptOutputFiles(t);
                t.setStage('analyzed');
                return rObj;
            }
            catch (e) {
                Factory.isTrialRunning = false;
                Logging_1.Logging.log('error', { message: `Failed to analyze trial ${t.id}`, error: e });
                throw e;
            }
        });
    }
    static get modsPath() {
        return path_1.default.join(this.factoryDataPath, 'mods');
    }
    static get scriptOutputPath() {
        return path_1.default.join(this.factoryDataPath, 'script-output');
    }
    // in the future, add a parameter to this function to specify a version to verify we have, else redownload
    static verifyInstall() {
        return __awaiter(this, void 0, void 0, function* () {
            // Phase 3 - link to the install path folder
            let p;
            // Validate our executable exists, regardless of platform.
            if (os.platform() === 'win32') {
                p = path_1.default.join(this.factoryInstallPath, 'bin', 'x64', 'factorio.exe');
            }
            else {
                p = path_1.default.join(this.factoryInstallPath, 'bin', 'x64', 'factorio');
            }
            if (!(yield fs_extra_1.default.pathExists(p))) {
                throw new Error(`Cannot link factory install path - no executable found at ${p}`);
            }
            // read the info.json file to ensure we have a valid base game, and load the version
            const infoJson = yield fs_extra_1.default.readJson(path_1.default.join(this.factoryInstallPath, 'data', 'base', 'info.json'));
            Factory.factoryVersion = infoJson.version;
            Factory.factoryExecutable = true;
            // // We are also going to copy the scenario source from the package install - will ensure scenario-source exists
            // if (!fs.existsSync(path.join(Factory.factoryDataPath, 'scenarios', 'scenario-source')))
            //     await Factory.copyScenarioSource();
            // NOT NEEDED ANYMORE - scenario names are dynamic copied each time
            return infoJson;
        });
    }
    static setupLogger(hideConsole = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Phase 1 - start the logger and other random system packages
            const logFormat = winston_1.default.format.printf(function (info) {
                return `${info.timestamp}-${info.level}: ${Object.keys(info).length <= 3 ? info.message : JSON.stringify(info, null, 4)}`;
            });
            if (hideConsole === true) {
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
        });
    }
    static get initStatus() {
        return Factory._initStatus;
    }
    static set initStatus(val) {
        Factory._initStatus = val;
        if (Factory.onStatusChange)
            Factory.onStatusChange(val);
    }
    static deleteScriptOutputFiles(trial) {
        return __awaiter(this, void 0, void 0, function* () {
            // deletes all raw files associated with this trial in the script-output directory
            let trialId = typeof trial === 'string' ? trial : trial.id;
            try {
                yield Promise.allSettled([
                    fs_extra_1.default.rm(path_1.default.join(Factory.scriptOutputPath, 'data', `${trialId}_item.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.scriptOutputPath, 'data', `${trialId}_elec.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.scriptOutputPath, 'data', `${trialId}_circ.jsonl`)),
                    fs_extra_1.default.rm(path_1.default.join(Factory.scriptOutputPath, 'data', `${trialId}_poll.jsonl`))
                ]);
            }
            catch (e) {
                Logging_1.Logging.log('error', { message: `Failed to delete raw files for trial ${trialId}`, error: e });
            }
        });
    }
    static applyModsOfSource(source) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            * We assume that all mods listed exist in the mods-cache - if we try to symlink one and it doesn't exist, throw error
            * */
            // first off, clear mods!
            yield Factory.clearActiveMods();
            if (source.modList && source.modList.mods.length > 0) {
                // we now need to symlink all the mods first
                yield Factory.symlinkModFiles(source.modList.factorioModFiles);
                // if it exists, symlink the mod-settings.dat file
                if (source.modList.settingsFile)
                    yield fs_extra_1.default.symlink(source.modList.settingsFile, path_1.default.join(Factory.factoryDataPath, 'mod-settings.dat'));
                // then, we need to write the mod-list.json file. Factorio uses this to load the actual list of mods
                yield source.modList.writeModListFile(path_1.default.join(Factory.modsPath, 'mod-list.json'));
            }
        });
    }
    static symlinkModFiles(modFiles = []) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < modFiles.length; i++) {
                if (!Factory.modCache.has(modFiles[i]))
                    throw new Error(`Cannot symlink mod ${modFiles[i]} - not present in mods-cache!`);
                yield fs_extra_1.default.symlink(path_1.default.join(Factory.factoryDataPath, 'mods-cache', modFiles[i]), path_1.default.join(Factory.factoryDataPath, 'mods', modFiles[i]));
            }
        });
    }
    static refreshModCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Factory.modCache)
                Factory.modCache.clear();
            // first off, read the entire list of files from our mods-cache folder
            let files = yield fs_extra_1.default.readdir(path_1.default.join(Factory.factoryDataPath, 'mods-cache'));
            // For each one, remove the '.zip' at the end and add to our cache
            for (let i = 0; i < files.length; i++) {
                if (files[i].endsWith('.zip'))
                    Factory.modCache.add(files[i].substring(0, files[i].length - 4));
                else
                    Factory.modCache.add(files[i]);
            }
        });
    }
    static initialize(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(params === null || params === void 0 ? void 0 : params.installDir))
                throw new Error(`Cannot start factory without installPath ||| ${params.installDir}`);
            // If no data path specified, we assume same as install path. Should be the case in alllllll situations.... except Steam
            if (!(params === null || params === void 0 ? void 0 : params.dataDir))
                params.dataDir = params.installDir;
            this.initStatus = 'logging';
            yield Factory.setupLogger(params.hideConsole);
            // Phase 2 - link to the data path folder
            // ensure core folders are made - if any of these fail, the rest fails
            this.initStatus = 'folder-setup';
            yield Promise.all([
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'mods')),
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'scenarios')),
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'saves')),
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'script-output')),
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'downloads')),
                fs_extra_1.default.ensureDir(path_1.default.join(params.dataDir, 'mods-cache'))
            ]);
            // Will need to have a check for script-output being populated after a run or not, to ID a bad Data Path
            Factory.factoryDataPath = params.dataDir;
            Factory.factoryInstallPath = params.installDir;
            // clear the script-output folder as well
            //await fs.emptyDir(path.join(params.dataDir, 'script-output'))
            Logging_1.Logging.log('info', `Core folders exist in ${params.dataDir}`);
            // Clear the 'compiled' save that is specified, if it exists
            // this will force a recompile, which is only done once on init anyways.
            // ensures correct version with executable. Happens in 'verify' function
            //await fs.remove(Factory.activeSavePath)
            this.initStatus = 'factorio-api-init';
            // Phase 3 - Setup API access
            // Setup factorio api access, to be able to download/update needed mods and game
            yield FactorioApi_1.FactorioApi.initialize({
                username: params.username ? params.username : process.env.FACTORIO_USER,
                token: params.token ? params.token : process.env.FACTORIO_TOKEN,
                dataPath: Factory.factoryDataPath,
                installPath: Factory.factoryInstallPath
            });
            // Phase 4 - Verify our install or reinstall as needed
            // First off, lets load our cached mods
            yield Factory.refreshModCache();
            let err;
            try {
                this.initStatus = 'validating-install';
                // Validate our executable exists and info file exists
                yield Factory.verifyInstall();
            }
            catch (e) {
                // if this gets hit, means that something had an error in the 'link' process above
                // In this case, this catch allows code to continue past in this case, where future code handles the re-install if possible
                // or re-throws an error
                err = e;
                Logging_1.Logging.log('error', `Error linking factory install path - ${e.message}`);
            }
            // Max number of times can be downloaded while process is running - if this occurs, restart process. Safety check for paranoia of constant re-downloads for now
            if (Factory.factoryExecutable != true) {
                if (Factory.clientDownloadCount < 2) {
                    // re-install!
                    try {
                        this.initStatus = 'installing';
                        yield Factory.installGame(process.env.FACTORY_VERSION);
                    }
                    catch (e) {
                        Logging_1.Logging.log('error', `Error installing Factorio - ${e.message}`);
                        // delete the cached download file, as it may have issues. Next loop will retry!
                    }
                }
                else {
                    throw new Error(`Cannot link factory install path, too many download attempts - ${err.message}. Manual install required, then restart process!`);
                }
            }
            this.initStatus = 'ready';
        });
    }
    static stop(includeLogger = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Factory.isTrialRunning)
                throw new Error(`Cannot stop factory while factorio executable is running!`);
            Logging_1.Logging.log('info', `Stopping factory - clearing all variables`);
            Factory.factoryDataPath = undefined;
            Factory.factoryInstallPath = undefined;
            Factory.factoryVersion = undefined;
            Factory.factoryExecutable = undefined;
            Factory.clientDownloadCount = 0;
            Factory.initStatus = 'not-started';
            // clear API vars
            FactorioApi_1.FactorioApi.clear();
            // stop the logger before exiting
            if (includeLogger === true)
                Logging_1.Logging.stopLogger();
        });
    }
    static installGame(version = undefined, build = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, increment our download count here, so that even if errors occur we know that it was attempted
            Factory.clientDownloadCount++;
            const localOsDistro = os.platform();
            let localBuild = build;
            if (!localBuild)
                localBuild = process.env.FACTORIO_BUILD ? process.env.FACTORIO_BUILD : 'headless';
            // If this is WINDOWS, we need to ensure we download that distro (manual zip file). Otherwise, tar.xz is used
            if (localOsDistro === 'win32' && localBuild === 'headless')
                throw new Error('Factorio does not support windows for headless builds. Set environmental variable FACTORIO_BUILD to \'alpha\' to enable the full game download.');
            if (localOsDistro === 'win32' && !FactorioApi_1.FactorioApi.isAuthenticated)
                throw new Error('To download the Windows version of Factorio, you must be authenticated and own the game! Only linux headless can run without license');
            if (process.env.FACTORIO_BUILD === 'alpha' && !FactorioApi_1.FactorioApi.isAuthenticated)
                throw new Error('To download the Graphical version of Factorio, you must be authenticated and own the game! Only linux headless can run without license');
            // even if win32 is chosen for distro in the API, MAKE SURE win32-manual is used for download
            let downloadDistro;
            switch (localOsDistro) {
                case 'win32':
                    downloadDistro = 'win32-manual';
                    break;
                case 'freebsd':
                case 'openbsd':
                case 'linux':
                    downloadDistro = 'linux64';
                    break;
            }
            // Download game to the downloads folder
            Logging_1.Logging.log('info', `Downloading Factorio ${version ? version : FactorioApi_1.FactorioApi.latestVersion.stable[localBuild]} ${localBuild} ${downloadDistro} to ${Factory.factoryDataPath}/downloads`);
            let filepath = yield FactorioApi_1.FactorioApi.downloadGame(version ? version : FactorioApi_1.FactorioApi.latestVersion.stable[localBuild], localBuild, downloadDistro);
            if (Factory.clientDownloadCount > 1) {
                // this is our 2nd time around... try re-downloading first
                yield fs_extra_1.default.remove(filepath);
                filepath = yield FactorioApi_1.FactorioApi.downloadGame(version ? version : FactorioApi_1.FactorioApi.latestVersion.stable[localBuild], localBuild, downloadDistro);
            }
            // Delete needed folders in the install location
            Logging_1.Logging.log('info', `Deleting old install directories and files in ${Factory.factoryInstallPath}`);
            yield Promise.all([
                fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, 'data')),
                fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, 'bin')),
                fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, 'doc-html')),
                fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, 'temp')),
                fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, 'config'))
            ]);
            // Remove the last files in the install folder
            let installFolderContents = yield fs_extra_1.default.readdir(Factory.factoryInstallPath, { withFileTypes: true });
            for (let i = 0; i < installFolderContents.length; i++) {
                if (installFolderContents[i].isFile()) {
                    yield fs_extra_1.default.remove(path_1.default.join(Factory.factoryInstallPath, installFolderContents[i].name));
                }
            }
            // Now, we can extract to this folder to 'install'. method is slightly different depending on OS
            Logging_1.Logging.log('info', `Extracting ${filepath} to ${Factory.factoryInstallPath} - This can take some time depending on build chosen to download.`);
            if (localOsDistro === 'win32') {
                yield (0, decompress_1.default)(filepath, Factory.factoryInstallPath);
            }
            else {
                yield (0, decompress_1.default)(filepath, Factory.factoryInstallPath, {
                    plugins: [(0, decompress_tarxz_1.default)()],
                    map: file => {
                        file.path = file.path.substring(9);
                        return file;
                    }
                });
            }
            yield Factory.verifyInstall();
        });
    }
    /*
    * Copies the 'scenario-source' that we have as a template to the <datadir>/scenarios folder, and renames it to the folder name specified
    * */
    static copyScenarioSourceToFolder(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const srcPath = path_1.default.join(__dirname, '../', '../', 'factory', 'scenarios', 'scenario-source');
            const destPath = path_1.default.join(Factory.factoryDataPath, 'scenarios', folder);
            Logging_1.Logging.log('info', { message: `Copying scenario-source from ${srcPath} to ${destPath}` });
            try {
                yield fs_extra_1.default.copy(srcPath, destPath, { overwrite: true });
                return destPath;
            }
            catch (e) {
                Logging_1.Logging.log('info', { message: `Failed to copy scenario-source! Ensure that scenario-source exists in the scenarios folder` });
                throw new Error('Failed to copy scenario-source - ' + (e === null || e === void 0 ? void 0 : e.message) ? e.message : e);
            }
        });
    }
    /*
    * Mod Management - from modlist through to individual mod downloads
    *
    * SO - REMOVE ANY KIND OF FILE REQUIREMENTS FOR MODS
    * just define mods by array - this is a npm package, not a CLI-first repository
    * Defining custom scenarios will stay the same, but is based entirely on the 'scenarios' folder of the install
    * Once this is done, I can do an update
    *
    * */
    /*
    * Clears the files mod-list.json and mod-settings.dat from the mods folder. Lets Factorio start over fresh with vanilla modlist
    * If mods are desired or a particular modlist is chosen, this is the first step to implementing that.
    * */
    static clearActiveMods() {
        return __awaiter(this, void 0, void 0, function* () {
            // delete the mod-list.json file (and the modsettings.dat) from mods folder - this allows us to start fresh, with no mods by default
            yield fs_extra_1.default.emptyDir(path_1.default.join(Factory.factoryDataPath, 'mods'));
        });
    }
    // returns true if already cached, false if it was downloaded then cached
    static cacheMod(mod) {
        return __awaiter(this, void 0, void 0, function* () {
            // first, check if this mod is already cached
            if (Factory.modCache.has(mod.file))
                return true;
            // if not, download it
            if (mod.version == 'latest')
                mod.version = yield FactorioApi_1.FactorioApi.getLatestModVersion(mod.name);
            yield FactorioApi_1.FactorioApi.downloadMod(mod.name, mod.version);
            Factory.modCache.add(mod.file);
            return false;
        });
    }
    /*
    * We download all mods into the 'mods-cache' folder on 'preparing' a trial. This allows us to then quickly and easily
    * move files to the 'mods' directory later on, just before the trial itself is run that requires them.
    * */
    static cacheModList(mods) {
        return __awaiter(this, void 0, void 0, function* () {
            // We need to make sure all listed mods are present in the mods-cache
            // if a version does not exist in the name, we will assume latest version and append it to the name
            for (let i = 0; i < mods.mods.length; i++) {
                yield Factory.cacheMod(mods.mods[i]);
            }
            //await fs.ensureSymlink('','', 'file')
        });
    }
    // Lists all scenarios
    static listScenarios() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield fs_extra_1.default.readdir(path_1.default.join(Factory.factoryDataPath, 'scenarios')));
        });
    }
    // lists both save files and folders - identified by the '.zip' extension
    static listSaves() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs_extra_1.default.readdir(path_1.default.join(Factory.factoryDataPath, 'saves'));
        });
    }
    /*
    * Running factorio executable
    * */
    static get factorioExecutablePath() {
        return path_1.default.join(Factory.factoryInstallPath, 'bin', 'x64', 'factorio');
    }
    static runFactorio(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.factorioRunning)
                throw new Error('Factorio is already running! Can only run one instance at a time');
            let execResults = '';
            this.factorioRunning = true;
            let start = new Date();
            try {
                yield new Promise((resolve, reject) => {
                    let s = (0, child_process_1.spawn)(Factory.factorioExecutablePath, params, {});
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
            }
            catch (e) {
                Logging_1.Logging.log('error', `Error running factorio executable - ${e.message}`);
                throw new Error(`Error running factorio executable - ${e.message}`);
            }
            this.factorioRunning = false;
            let end = new Date();
            return {
                execResults,
                start,
                end
            };
        });
    }
    static writeKeyValuesToLuaFile(path, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            let k = Object.keys(vars);
            let luaContent = yield fs_extra_1.default.readFile(path, 'utf8');
            for (let i = 0; i < k.length; i++) {
                luaContent = Factory._replaceLuaKeyValue(luaContent, k[i], vars[k[i]]);
            }
            // need to write back to the file path...
            yield fs_extra_1.default.writeFile(path, luaContent, 'utf8');
            return luaContent;
        });
    }
    static _replaceLuaKeyValue(luaContent, key, val) {
        // find <key> first
        // find </key> next
        // we want to remove allll lines (including and between), then instead insert...
        // --<key>
        // local key = val
        // --</key> -> to newline
        // this should be inserted wherever the first index was found for start
        let start = luaContent.indexOf(`--<${key}>`);
        let end = luaContent.indexOf('\n', luaContent.indexOf(`--</${key}>`));
        // If we can't find our key - just return the lua content as-is
        if (start === -1 || end === -1)
            return luaContent;
        // we now have our region to 'remove' - replace it with our new string created below
        let newVal;
        if (val == 'null' || val == null || val === undefined)
            newVal = `--<${key}>\nlocal ${key} = nil\n--</${key}>\n`;
        else if (typeof val === "number")
            newVal = `--<${key}>\nlocal ${key} = ${val}\n--</${key}>\n`;
        else
            newVal = `--<${key}>\nlocal ${key} = '${val}'\n--</${key}>\n`;
        // write in!
        return luaContent.replace(luaContent.substring(start, end + 1), newVal);
    }
}
exports.Factory = Factory;
Factory.isTrialRunning = false;
Factory.clientDownloadCount = 0;
Factory.modCache = new Set();
Factory._initStatus = 'not-started';
Factory.factorioRunning = false;
//# sourceMappingURL=Factory.js.map