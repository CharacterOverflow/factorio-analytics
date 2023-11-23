/*
* Parameters to startup the factory
* */
import {Logging} from "./Logging";
import winston from "winston";
import path from "path";
import fs from "fs-extra";
import * as os from "os";
import {FactorioApi} from "./FactorioApi";
import decompress from "decompress";
import {exec, spawn} from "child_process";
import {Trial} from "./Trial";
import * as process from "process";
import {ModList} from "./ModList";
import {
    IDatasetCombinedResults, IGameFlowTick, IGamePollutionTick, ISystemTick,
} from "./Dataset";
import _ from "lodash";
import {Source} from "./Source";
import {SavedTrial} from "./database/SavedTrial";
import {SavedFlowRecord, SavedPollutionRecord, SavedSystemRecord} from "./database/SavedDataset";
import {FactoryDatabase} from "./FactoryDatabase";
import {FactoryBackend} from "./FactoryBackend";

/*
* Listing out the various ENV settings that can be set...
* FACTORIO_INSTALL ==> the ABSOLUTE PATH to the factorio install folder. This folder should CONTAIN bin
* FACTORIO_DATA ==> the ABSOLUTE PATH to the factorio data folder. If automatic install or from factorio site, is the same as install. STEAM IS DIFFERENT
* FACTORIO_TOKEN ==> Token for factorio API. Gotten from factorio user page
* FACTORIO_USER ==> Username for factorio API. Not email!
* FACTORIO_BUILD ==> build of the game to download, if download is needed (headless or alpha). alpha means FULL GRAPHICS version
* FACTORIO_DL_TIMEOUT ==> Time to wait for a download to complete, in ms. No timeout by default
* */

export interface IFactoryStartParams {
    // REQUIRED needed to run executable
    installDir: string;

    // REQUIRED needed to manage mods/saves/scenarios
    // LIKELY the same as installPath if game was installed automatically
    dataDir?: string;

    // list of mods that we want to include - all will be attempted to downloaded if not present
    // Leave blank to use mod configuration as-is
    //mods?: string[];

    // if true, will not show console logs, but will still appear in log file
    hideConsole?: boolean

    // factorio username to use for API
    username?: string;

    // factorio token to use for API
    token?: string;

}

export interface IFactoryModRecord {
    name: string;
    enabled?: boolean; // if missing, assumed to be true
}

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
export class Factory {

    public static async prepareTrial(t: Trial) {
        if (!t?.id)
            throw new Error('Cannot prepare trial! ID is missing, or trial is null');

        // IF BLUEPRINT SOURCE!!
        // copy template-scenario to trial ID scenario folder
        // modify <trialfolder>/sandbox.lua with your parameters provided
        // download and move mods into the correct folder
        // mark as prepared
        t.setStage('preparing')

        try {

            if (t.source.variant == 'blueprint') {

                // COpy our scenario source to scenarios, as we need it for blueprint running
                let trialFolder = await Factory.copyScenarioSourceToFolder(t.id);

                // now, we need to modify the sandbox.lua file with our parameters
                await Factory.writeKeyValuesToLuaFile(path.join(trialFolder, 'sandbox.lua'), {
                    UID: t.id,
                    BLUEPRINT: (t.source as Source).text,
                    ITEM_TICKS: t.recordItems ? t.tickInterval : null,
                    ELEC_TICKS: t.recordElectric ? t.tickInterval : null,
                    CIRC_TICKS: t.recordCircuits ? t.tickInterval : null,
                    POLL_TICKS: t.recordPollution ? t.tickInterval : null,
                    BOTS: t.initialBots,
                })
            } else if (t.source.variant == 'savegame') {

                // 1. copy the save to the saves folder renaming it as the Trial ID
                // 2. delete trial ID folder in 'saves' if it exists (NOT .zip)
                // 3. Extract the save file to a folder of the same name
                // copy savegame.lua
                // modify control.lua

                // copy the original save to the saves folder, renaming it as the trial ID
                Logging.log('info', `Copying save ${(t.source as Source).text} to ${t.id}.zip`)
                await fs.copyFile((t.source as Source).text, path.join(Factory.factoryDataPath, 'saves', t.id + '.zip'));

                // delete trial ID folder in 'saves' if it exists
                Logging.log('info', `Deleting existing save folder ${t.id} if present`);
                await fs.remove(path.join(Factory.factoryDataPath, 'saves', t.id));

                // extract save file
                Logging.log('info', `Extracting save file ${t.id}.zip to ${path.join(Factory.factoryDataPath, 'saves', t.id)}`);
                let results = await decompress(path.join(Factory.factoryDataPath, 'saves', t.id + '.zip'), path.join(Factory.factoryDataPath, 'saves'));

                // rename extracted folder to trial ID
                let fn = results[0].path.substring(0, results[0].path.indexOf('/'))
                fs.rename(path.join(Factory.factoryDataPath, 'saves', fn), path.join(Factory.factoryDataPath, 'saves', t.id))

                // copy savegame.lua
                Logging.log('info', `Copying savegame.lua to ${path.join(Factory.factoryDataPath, 'saves', t.id)}`);
                await fs.copyFile(path.join(__dirname, '../', '../', 'factory', 'savegame.lua'), path.join(Factory.factoryDataPath, 'saves', t.id, 'savegame.lua'));

                // MODIFY savegame.lua with our trial changes
                // now, we need to modify the sandbox.lua file with our parameters
                await Factory.writeKeyValuesToLuaFile(path.join(Factory.factoryDataPath, 'saves', t.id, 'savegame.lua'), {
                    UID: t.id,
                    ITEM_TICKS: t.recordItems ? t.tickInterval : null,
                    ELEC_TICKS: t.recordElectric ? t.tickInterval : null,
                    CIRC_TICKS: t.recordCircuits ? t.tickInterval : null,
                    POLL_TICKS: t.recordPollution ? t.tickInterval : null,
                    BOTS: t.initialBots,
                })

                // modify control.lua
                Logging.log('info', `Modifying control.lua to include savegame.lua`);
                let controlLua = await fs.readFile(path.join(Factory.factoryDataPath, 'saves', t.id, 'control.lua'), {encoding: 'utf8'});
                controlLua += 'handler.add_lib(require("savegame"))'
                await fs.writeFile(path.join(Factory.factoryDataPath, 'saves', t.id, 'control.lua'), controlLua, {encoding: 'utf8'});

            } else
                throw new Error('Cannot prepare trial! Unknown source type provided');

            // download the mods specified in 'source' if we can. do NOT move them into the 'mods' folder yet
            if (t.source?.modList)
                await Factory.cacheModList((t.source as Source).modList);

        } catch (e) {
            Logging.log('error', {message: `Failed to prepare trial ${t.id}`, error: e});
            throw e;
        }

        t.setStage('prepared');
    }

    public static async compileTrial(t: Trial) {
        if (!t?.id)
            throw new Error('Cannot prepare trial! ID is missing, or trial is null');

        // trial must be prepared before we can compile it - if not, prepare it
        if (t.stage !== 'prepared')
            await Factory.prepareTrial(t)

        // we do the executable check inside IF so that savegames don't throw an error
        // savegames as a whole dont need to be compiled, so we just skip this step
        if (t.source.variant == 'blueprint') {

            if (Factory.isTrialRunning)
                throw new Error('Cannot compile trial! Factorio executable is already running');

            Factory.isTrialRunning = true;

            // compiling step for 'save game' source does nothing - compiling turns a scenario into a save, no point there
            t.setStage('compiling')

            try {

                // First off, we need to move our mod configuration files into the mods folder if they exist
                await Factory.applyModsOfSource(t.source);

                // remove existing compile folder and zip file if exists
                await fs.remove(path.join(Factory.factoryDataPath, 'saves', t.id + '.zip'))
                await fs.remove(path.join(Factory.factoryDataPath, 'saves', t.id))

                // run factorio executable to convert scenario -> save
                Logging.log('info', `Compiling scenario ${t.id} into save file`);
                let results = await Factory.runFactorio(['-m', t.id])
                if (!fs.existsSync(path.join(Factory.factoryDataPath, 'saves', `${t.id}.zip`))) {
                    await fs.writeFile(path.join(Factory.factoryDataPath, 'compile.log'), results.execResults, {encoding: 'utf8'});
                    throw new Error(`Scenario ${t.id} could not be compiled! Zip save file does not exist - check 'compile.log' for more details`);
                } else
                    Logging.log('info', `Scenario ${t.id} compiled in ${results.end.getTime() - results.start.getTime()}ms`);

                // extract the save file to a folder of the same name
                Logging.log('info', `Extracting save file ${t.id}.zip to ${path.join(Factory.factoryDataPath, 'saves', t.id)}`);
                await decompress(path.join(Factory.factoryDataPath, 'saves', `${t.id}.zip`), path.join(Factory.factoryDataPath, 'saves'));

                if (!fs.existsSync(path.join(Factory.factoryDataPath, 'saves', t.id, 'sandbox.lua')))
                    throw new Error(`Scenario ${t.id} was not extracted! Save Folder does not exist - extract ${t.id}.zip manually if needed`);

                Factory.isTrialRunning = false

            } catch (e) {
                Factory.isTrialRunning = false
                Logging.log('error', {message: `Failed to compile scenario ${t.id}`, error: e});
                throw e;
            }
        }

        t.setStage('compiled');
    }

    public static async runTrial(t: Trial) {
        // should just run the trial, nothing more. dont do data analysis here
        if (!t?.id)
            throw new Error('Cannot run trial! ID is missing, or trial is null');

        // trial must be compiled before we can run it - if not, compile it
        if (t.stage !== 'compiled')
            await Factory.compileTrial(t)

        if (Factory.isTrialRunning)
            throw new Error('Cannot run trial! Factorio executable is already running');

        Factory.isTrialRunning = true;
        t.setStage('running');

        try {
            await Factory.applyModsOfSource(t.source);

            t.startedRunAt = new Date();
            Logging.log('info', {message: `Running trial ${t.id}`});
            const execParams = ['--benchmark', `${t.id}`,
                '--benchmark-ticks', `${t.length}`]
            if (t.recordSystem) {
                execParams.push('--benchmark-verbose')
                execParams.push('all')
            }

            let r = await Factory.runFactorio(execParams);
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
            let execTime: number = (Number.parseFloat(perfTime)) * 1000;

            // Grab the first newline after the 'run' declaration, then substring from there until end of file
            let perfStart = r.execResults.indexOf('\n', r.execResults.indexOf('run 1:'));
            let perfSubstr = r.execResults.substring(perfStart + 1, lastIdx);

            // Record our end parsing time.
            let nd = (new Date()).getTime();

            // Grab the text logs that prefix our raw system data
            if (idxA != -1)
                t.textLogs = r.execResults.substring(0, idxA).split('\n');
            else
                t.textLogs = r.execResults.substring(0, r.execResults.indexOf('Running update') - 1).split('\n')

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
            }

            Logging.log('info', {message: `Finished trial ${t.id} - parsing console outputs`});
            Factory.isTrialRunning = false;

            // #todo check if script-output files were made... can do this later

        } catch (e) {
            Factory.isTrialRunning = false
            Logging.log('error', {message: `Failed to run trial ${t.id}`, error: e});
            throw e;
        }

        t.setStage('ran')

    }

    public static async analyzeTrial(t: Trial, saveToDB: boolean = false): Promise<IDatasetCombinedResults> {
        if (!t?.id)
            throw new Error('Cannot analyze trial! ID is missing, or trial is null');

        // trial must be compiled before we can run it - if not, compile it
        if (t.stage !== 'ran')
            await Factory.runTrial(t)

        t.setStage('analyzing');

        try {
            let rObj: IDatasetCombinedResults = {};

            if (t.recordItems) {
                Logging.log('info', {message: `Analyzing item data for trial ${t.id}`});
                rObj.itemRecords = await Factory.parseItemDataFile(path.join(Factory.scriptOutputPath, 'data', t.dataFiles.items), t)
                if (saveToDB && t instanceof SavedTrial)
                    await FactoryDatabase.insertFlowRecords(rObj.itemRecords as SavedFlowRecord[])
            }
            /*if (t.recordElectric) {
                Logging.log('info', {message: `Analyzing electric data for trial ${t.id}`});
                let electricDataset = new ElectricDataset(t, path.join(Factory.scriptOutputPath, 'data', t.dataFiles.electric))
                await electricDataset.parseData()
                rObj.electric = electricDataset;
            }
            if (t.recordCircuits) {
                Logging.log('info', {message: `Analyzing circuit data for trial ${t.id}`});
                let circuitDataset = new CircuitDataset(t, path.join(Factory.scriptOutputPath, 'data', t.dataFiles.circuits))
                await circuitDataset.parseData()
                rObj.circuits = circuitDataset;
            }*/
            if (t.recordPollution) {
                Logging.log('info', {message: `Analyzing pollution data for trial ${t.id}`});
                rObj.pollutionRecords = await Factory.parsePollutionDataFile(path.join(Factory.scriptOutputPath, 'data', t.dataFiles.pollution), t)
                if (saveToDB && t instanceof SavedTrial)
                    await FactoryDatabase.insertPollutionRecords(rObj.pollutionRecords as SavedPollutionRecord[])
            }
            if (t.recordSystem) {
                Logging.log('info', {message: `Analyzing system data for trial ${t.id}`});
                rObj.systemRecords = Factory.parseSystemData(t.rawSystemText, t)
                if (saveToDB && t instanceof SavedTrial)
                    await FactoryDatabase.insertSystemRecords(rObj.systemRecords as SavedSystemRecord[])
            }
            await Factory.deleteScriptOutputFiles(t);
            await Factory.deleteSaveFileClutter(t);
            if (saveToDB && t instanceof SavedTrial)
                await FactoryDatabase.saveTrial(t as SavedTrial, true)

            t.setStage('analyzed');

            return rObj
        } catch (e) {
            Factory.isTrialRunning = false
            Logging.log('error', {message: `Failed to analyze trial ${t.id}`, error: e});
            throw e;
        }
    }

    public static async parseItemDataFile(filepath: string, trial: Trial) {
        let raw = await fs.readFile(filepath, 'utf-8');

        let results: IGameFlowTick[] = [];
        let lines = raw.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            let l = lines[i];

            // keep an active map of all items in this tick, adding information as needed
            let itemMap = {};

            // Parse line information into temp object
            let lineParsed = JSON.parse(l);

            // for each key in cons, upsert data to itemMap
            let co = Object.keys(lineParsed.cons);
            for (let c of co) {

                // the item record if it exists
                let ir: IGameFlowTick = itemMap[c];

                if (ir) {
                    // Update the cons value, as there is nothing else it can be.
                    ir.cons = lineParsed.cons[c];
                } else {
                    // No object record exists yet - create and set it
                    itemMap[c] = {
                        label: c,
                        tick: (i + 1) * trial.tickInterval,
                        cons: lineParsed.cons[c],
                        prod: 0,
                    } as IGameFlowTick;
                }
            }

            let po = Object.keys(lineParsed.prod);
            for (let p of po) {

                // the item record if it exists
                let ir: IGameFlowTick = itemMap[p];

                if (ir) {
                    // Update the cons value, as there is nothing else it can be.
                    ir.prod = lineParsed.prod[p];
                } else {
                    // No object record exists yet - create and set it
                    itemMap[p] = {
                        label: p,
                        tick: (i + 1) * trial.tickInterval,
                        cons: 0,
                        prod: lineParsed.prod[p],
                    } as IGameFlowTick;
                }
            }

            // Now that the itemMap is populated, push all items to the results array for this tick. Convert all keys to an array, grabbing values from the map in a loop
            let itemKeys = Object.keys(itemMap);
            for (let ik of itemKeys) {
                results.push(itemMap[ik]);
            }
        }
        // for each item, calculate the average and total for  each item
        let g = _.groupBy(results, 'label');
        let kList = Object.keys(g);
        let metadata = {
            avg: {},
            total: {}
        }
        for(let i = 0; i < kList.length; i++) {

            // sum / length (in minutes)
            let itemData = g[kList[i]]
            let secondsLength = trial.length / (60 * 60)
            let totalCons = _.sumBy(itemData, 'cons')
            let totalProd = _.sumBy(itemData, 'prod')

            metadata.avg[kList[i]] = {
                cons: totalCons / secondsLength,
                prod: totalProd / secondsLength
            }
            metadata.total[kList[i]] = {
                cons: totalCons,
                prod: totalProd
            }
        }
        // lastly, if  our trial is a 'SavedTrial' type, we will make sure we convert all these records into SavedFlowRecords
        if (trial instanceof SavedTrial) {
            results = await SavedFlowRecord.fromRecords(results, trial.id);
        }
        trial.itemMetadata = metadata;
        return results;
    }

    public static async parseElectricDataFile(filepath: string, trial: Trial) {
        throw new Error('Electric data not implemented yet - need to analyze data output as it doesnt follow in-game values');
    }

    public static async parseCircuitDataFile(filepath: string, trial: Trial) {
        throw new Error('Circuit data not implemented yet - need to ensure accuracy and prepare for future circuit changes');
    }

    public static async parsePollutionDataFile(filepath: string, trial: Trial) {
        let raw = await fs.readFile(filepath, 'utf-8');

        let results: IGamePollutionTick[] = [];
        let lines = raw.split('\n');

        // Now, need to sort through the list of lines and parse out the data
        for (let i = 0; i < lines.length - 1; i++) {
            let l = lines[i];

            // each line is a object with 1 field - pollution. This is a float
            let lData = JSON.parse(l);
            results.push({
                tick: (i + 1) * trial.tickInterval,
                count: lData.pollution
            })
        }
        if (trial instanceof SavedTrial) {
            results = SavedPollutionRecord.fromRecords(results, trial.id);
        }

        return results;
    }

    public static parseSystemData(raw: string, trial: Trial) {
        let lines = raw.split('\n');
        // First line is headers, so we remove it
        lines.shift();
        // Now we have an array of strings, each string being a line of csv data
        let results: ISystemTick[] = [];
        let currentTickItem: ISystemTick = null;
        let currentSetCount: number = 0;
        let runningTimestamp: number = 0;
        for (let l of lines) {
            // Split by commas
            let data = l.split(',');
            if (!currentTickItem) {
                currentSetCount = 1;
                currentTickItem = {
                    tick: Number.parseInt(data[0].substring(1)),
                    timestamp: Number.parseInt(data[1]),
                    wholeUpdate: Number.parseInt(data[2]),
                    latencyUpdate: Number.parseInt(data[3]),
                    gameUpdate: Number.parseInt(data[4]),
                    circuitNetworkUpdate: Number.parseInt(data[5]),
                    transportLinesUpdate: Number.parseInt(data[6]),
                    fluidsUpdate: Number.parseInt(data[7]),
                    heatManagerUpdate: Number.parseInt(data[8]),
                    entityUpdate: Number.parseInt(data[9]),
                    particleUpdate: Number.parseInt(data[10]),
                    mapGenerator: Number.parseInt(data[11]),
                    mapGeneratorBasicTilesSupportCompute: Number.parseInt(data[12]),
                    mapGeneratorBasicTilesSupportApply: Number.parseInt(data[13]),
                    mapGeneratorCorrectedTilesPrepare: Number.parseInt(data[14]),
                    mapGeneratorCorrectedTilesCompute: Number.parseInt(data[15]),
                    mapGeneratorCorrectedTilesApply: Number.parseInt(data[16]),
                    mapGeneratorVariations: Number.parseInt(data[17]),
                    mapGeneratorEntitiesPrepare: Number.parseInt(data[18]),
                    mapGeneratorEntitiesCompute: Number.parseInt(data[19]),
                    mapGeneratorEntitiesApply: Number.parseInt(data[20]),
                    crcComputation: Number.parseInt(data[21]),
                    electricNetworkUpdate: Number.parseInt(data[22]),
                    logisticManagerUpdate: Number.parseInt(data[23]),
                    constructionManagerUpdate: Number.parseInt(data[24]),
                    pathFinder: Number.parseInt(data[25]),
                    trains: Number.parseInt(data[26]),
                    trainPathFinder: Number.parseInt(data[27]),
                    commander: Number.parseInt(data[28]),
                    chartRefresh: Number.parseInt(data[29]),
                    luaGarbageIncremental: Number.parseInt(data[30]),
                    chartUpdate: Number.parseInt(data[31]),
                    scriptUpdate: Number.parseInt(data[32])
                }
            } else {
                // add to the tick item, then evaluate if we need to push and reset it (if we are at tickInterval count)
                // We add 1 to the tick because it is representative of the 'last 300 ticks'. So if we state 300, we are
                // NOT including tick 300. therefore, it can show as 300 for data organization and matching, but tick 300
                // goes towards the next interval mark, at 600.
                currentTickItem.tick = Number.parseInt(data[0].substring(1)) + 1;
                currentTickItem.timestamp = Number.parseInt(data[1]);
                currentTickItem.wholeUpdate += Number.parseInt(data[2]);
                currentTickItem.latencyUpdate += Number.parseInt(data[3]);
                currentTickItem.gameUpdate += Number.parseInt(data[4]);
                currentTickItem.circuitNetworkUpdate += Number.parseInt(data[5]);
                currentTickItem.transportLinesUpdate += Number.parseInt(data[6]);
                currentTickItem.fluidsUpdate += Number.parseInt(data[7]);
                currentTickItem.heatManagerUpdate += Number.parseInt(data[8]);
                currentTickItem.entityUpdate += Number.parseInt(data[9]);
                currentTickItem.particleUpdate += Number.parseInt(data[10]);
                currentTickItem.mapGenerator += Number.parseInt(data[11]);
                currentTickItem.mapGeneratorBasicTilesSupportCompute += Number.parseInt(data[12]);
                currentTickItem.mapGeneratorBasicTilesSupportApply += Number.parseInt(data[13]);
                currentTickItem.mapGeneratorCorrectedTilesPrepare += Number.parseInt(data[14]);
                currentTickItem.mapGeneratorCorrectedTilesCompute += Number.parseInt(data[15]);
                currentTickItem.mapGeneratorCorrectedTilesApply += Number.parseInt(data[16]);
                currentTickItem.mapGeneratorVariations += Number.parseInt(data[17]);
                currentTickItem.mapGeneratorEntitiesPrepare += Number.parseInt(data[18]);
                currentTickItem.mapGeneratorEntitiesCompute += Number.parseInt(data[19]);
                currentTickItem.mapGeneratorEntitiesApply += Number.parseInt(data[20]);
                currentTickItem.crcComputation += Number.parseInt(data[21]);
                currentTickItem.electricNetworkUpdate += Number.parseInt(data[22]);
                currentTickItem.logisticManagerUpdate += Number.parseInt(data[23]);
                currentTickItem.constructionManagerUpdate += Number.parseInt(data[24]);
                currentTickItem.pathFinder += Number.parseInt(data[25]);
                currentTickItem.trains += Number.parseInt(data[26]);
                currentTickItem.trainPathFinder += Number.parseInt(data[27]);
                currentTickItem.commander += Number.parseInt(data[28]);
                currentTickItem.chartRefresh += Number.parseInt(data[29]);
                currentTickItem.luaGarbageIncremental += Number.parseInt(data[30]);
                currentTickItem.chartUpdate += Number.parseInt(data[31]);
                currentTickItem.scriptUpdate += Number.parseInt(data[32]);
                currentSetCount += 1;
            }

            if (currentSetCount >= trial.tickInterval) {
                // Cut nanoseconds down to milliseconds so its more comprehensive

                // Timestamp is a 'always increasing' field, so instead we just want to record the differences between points.
                // This gives much more useful information
                let tb = currentTickItem.timestamp;
                currentTickItem.timestamp = (currentTickItem.timestamp - runningTimestamp) / 1000000;
                runningTimestamp = tb;

                currentTickItem.wholeUpdate = currentTickItem.wholeUpdate / 1000000;
                currentTickItem.latencyUpdate = currentTickItem.latencyUpdate / 1000000;
                currentTickItem.gameUpdate = currentTickItem.gameUpdate / 1000000;
                currentTickItem.circuitNetworkUpdate = currentTickItem.circuitNetworkUpdate / 1000000;
                currentTickItem.transportLinesUpdate = currentTickItem.transportLinesUpdate / 1000000;
                currentTickItem.fluidsUpdate = currentTickItem.fluidsUpdate / 1000000;
                currentTickItem.heatManagerUpdate = currentTickItem.heatManagerUpdate / 1000000;
                currentTickItem.entityUpdate = currentTickItem.entityUpdate / 1000000;
                currentTickItem.particleUpdate = currentTickItem.particleUpdate / 1000000;
                currentTickItem.mapGenerator = currentTickItem.mapGenerator / 1000000;
                currentTickItem.mapGeneratorBasicTilesSupportCompute = currentTickItem.mapGeneratorBasicTilesSupportCompute / 1000000;
                currentTickItem.mapGeneratorBasicTilesSupportApply = currentTickItem.mapGeneratorBasicTilesSupportApply / 1000000;
                currentTickItem.mapGeneratorCorrectedTilesPrepare = currentTickItem.mapGeneratorCorrectedTilesPrepare / 1000000;
                currentTickItem.mapGeneratorCorrectedTilesCompute = currentTickItem.mapGeneratorCorrectedTilesCompute / 1000000;
                currentTickItem.mapGeneratorCorrectedTilesApply = currentTickItem.mapGeneratorCorrectedTilesApply / 1000000;
                currentTickItem.mapGeneratorVariations = currentTickItem.mapGeneratorVariations / 1000000;
                currentTickItem.mapGeneratorEntitiesPrepare = currentTickItem.mapGeneratorEntitiesPrepare / 1000000;
                currentTickItem.mapGeneratorEntitiesCompute = currentTickItem.mapGeneratorEntitiesCompute / 1000000;
                currentTickItem.mapGeneratorEntitiesApply = currentTickItem.mapGeneratorEntitiesApply / 1000000;
                currentTickItem.crcComputation = currentTickItem.crcComputation / 1000000;
                currentTickItem.electricNetworkUpdate = currentTickItem.electricNetworkUpdate / 1000000;
                currentTickItem.logisticManagerUpdate = currentTickItem.logisticManagerUpdate / 1000000;
                currentTickItem.constructionManagerUpdate = currentTickItem.constructionManagerUpdate / 1000000;
                currentTickItem.pathFinder = currentTickItem.pathFinder / 1000000;
                currentTickItem.trains = currentTickItem.trains / 1000000;
                currentTickItem.trainPathFinder = currentTickItem.trainPathFinder / 1000000;
                currentTickItem.commander = currentTickItem.commander / 1000000;
                currentTickItem.chartRefresh = currentTickItem.chartRefresh / 1000000;
                currentTickItem.luaGarbageIncremental = currentTickItem.luaGarbageIncremental / 1000000;
                currentTickItem.chartUpdate = currentTickItem.chartUpdate / 1000000;
                currentTickItem.scriptUpdate = currentTickItem.scriptUpdate / 1000000;

                // Push the current tick item, then reset it.
                results.push(currentTickItem);
                currentTickItem = null;
                currentSetCount = 0;
            }
        }
        // what do we need for metadata? Include here
        if (trial instanceof SavedTrial) {
            results = SavedSystemRecord.fromRecords(results, trial.id);
        }
        return results;
    }

    public static isTrialRunning: boolean = false;


    static get modsPath(): string {
        return path.join(this.factoryDataPath, 'mods');
    }

    static get scriptOutputPath(): string {
        return path.join(this.factoryDataPath, 'script-output');
    }

    /*
    * Core Directory / Install Setup
    * */

    // directory of our Factorio data - mods, saves, scenarios. REQUIRED!!
    static factoryDataPath: string;

    // directory of our Factorio install - executable, source, assets
    static factoryInstallPath: string;

    // Version of our factorio install
    static factoryVersion: string;

    // Boolean representing if the Factory is installed, or if there were issues in linking to the install
    protected static factoryExecutable: boolean;

    static clientDownloadCount: number = 0;

    static modCache: Set<string> = new Set<string>();

    // in the future, add a parameter to this function to specify a version to verify we have, else redownload
    static async verifyInstall() {
        // Phase 3 - link to the install path folder
        let p: string;


        // Validate our executable exists, regardless of platform.
        if (os.platform() === 'win32') {
            p = path.join(this.factoryInstallPath, 'bin', 'x64', 'factorio.exe');

        } else {
            p = path.join(this.factoryInstallPath, 'bin', 'x64', 'factorio');
        }

        if (!(await fs.pathExists(p))) {
            throw new Error(`Cannot link factory install path - no executable found at ${p}`);
        }

        // read the info.json file to ensure we have a valid base game, and load the version
        const infoJson = await fs.readJson(path.join(this.factoryInstallPath, 'data', 'base', 'info.json'));
        Factory.factoryVersion = infoJson.version;
        Factory.factoryExecutable = true;

        // // We are also going to copy the scenario source from the package install - will ensure scenario-source exists
        // if (!fs.existsSync(path.join(Factory.factoryDataPath, 'scenarios', 'scenario-source')))
        //     await Factory.copyScenarioSource();
        // NOT NEEDED ANYMORE - scenario names are dynamic copied each time

        return infoJson

    }

    static async setupLogger(hideConsole: boolean = false) {
        // Phase 1 - start the logger and other random system packages
        const logFormat = winston.format.printf(function (info) {
            try {
                return `${info.timestamp}-${info.level}: ${Object.keys(info).length <= 3 ? info.message : JSON.stringify(info, null, 4)}`;
            } catch (e) {
                return "LOGERROR"
            }
        });
        if (hideConsole === true) {
            Logging.startLogger([
                new winston.transports.File({
                    filename: path.join(process.cwd(), 'factory.log'),
                    level: 'info'
                })
            ]);
        } else {
            Logging.startLogger([
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(winston.format.colorize(), logFormat)
                }),
                new winston.transports.File({
                    filename: path.join(process.cwd(), 'factory.log'),
                    level: 'info'
                })
            ]);
        }
    }

    public static _initStatus: string = 'not-started';
    public static get initStatus() {
        return Factory._initStatus;
    }

    public static set initStatus(val: string) {
        Factory._initStatus = val;
        if (Factory.onStatusChange)
            Factory.onStatusChange(val);
    }

    public static onStatusChange: (newStatus: string) => void

    private static async deleteScriptOutputFiles(trial: string | Trial) {
        // deletes all raw files associated with this trial in the script-output directory
        let trialId = typeof trial === 'string' ? trial : trial.id;
        try {
            await Promise.allSettled([
                fs.rm(path.join(Factory.scriptOutputPath, 'data', `${trialId}_item.jsonl`)),
                fs.rm(path.join(Factory.scriptOutputPath, 'data', `${trialId}_elec.jsonl`)),
                fs.rm(path.join(Factory.scriptOutputPath, 'data', `${trialId}_circ.jsonl`)),
                fs.rm(path.join(Factory.scriptOutputPath, 'data', `${trialId}_poll.jsonl`))
            ]);
        } catch (e) {
            Logging.log('error', {message: `Failed to delete raw files for trial ${trialId}`, error: e});
        }
    }
    private static async deleteSaveFileClutter(trial: string | Trial) {
        // deletes all raw files associated with this trial in the script-output directory
        let trialId = typeof trial === 'string' ? trial : trial.id;
        try {
            await Promise.allSettled([
                fs.remove(path.join(Factory.factoryDataPath, 'saves', `${trialId}.zip`)),
                fs.remove(path.join(Factory.factoryDataPath, 'saves', `${trialId}`)),
                fs.remove(path.join(Factory.factoryDataPath, 'scenarios', `${trialId}`)),
            ]);
        } catch (e) {
            Logging.log('error', {message: `Failed to delete save files for trial ${trialId}`, error: e});
        }
    }

    static async applyModsOfSource(source: Source) {
        /*
        * We assume that all mods listed exist in the mods-cache - if we try to symlink one and it doesn't exist, throw error
        * */
        // first off, clear mods!
        await Factory.clearActiveMods();
        if (source.modList && source.modList.mods.length > 0) {
            // we now need to symlink all the mods first
            await Factory.symlinkModFiles(source.modList.modFileNames);

            // if it exists, symlink the mod-settings.dat file
            if (source.modList.settingsFile && !(await fs.exists(path.join(Factory.factoryDataPath, 'mod-settings.dat'))))
                await fs.symlink(source.modList.settingsFile, path.join(Factory.factoryDataPath, 'mod-settings.dat'));

            // then, we need to write the mod-list.json file. Factorio uses this to load the actual list of mods
            await source.modList.writeModListFile(path.join(Factory.modsPath, 'mod-list.json'));
        }
    }

    static async symlinkModFiles(modFiles: string[] = []) {
        for (let i = 0; i < modFiles.length; i++) {
            if (!Factory.modCache.has(modFiles[i]))
                throw new Error(`Cannot symlink mod ${modFiles[i]} - not present in mods-cache!`);

            await fs.symlink(path.join(Factory.factoryDataPath, 'mods-cache', modFiles[i]), path.join(Factory.factoryDataPath, 'mods', modFiles[i]));
        }
    }

    static async refreshModCache() {
        if (Factory.modCache)
            Factory.modCache.clear();

        // first off, read the entire list of files from our mods-cache folder
        let files = await fs.readdir(path.join(Factory.factoryDataPath, 'mods-cache'));

        // For each one, remove the '.zip' at the end and add to our cache
        for (let i = 0; i < files.length; i++) {
            if (files[i].endsWith('.zip'))
                Factory.modCache.add(files[i].substring(0, files[i].length - 4));
            else
                Factory.modCache.add(files[i]);
        }
    }

    static async initialize(params: IFactoryStartParams) {

        if (!params?.installDir)
            throw new Error(`Cannot start factory without installPath ||| ${params.installDir}`);

        // If no data path specified, we assume same as install path. Should be the case in alllllll situations.... except Steam
        if (!params?.dataDir)
            params.dataDir = params.installDir;

        this.initStatus = 'logging';
        await Factory.setupLogger(params.hideConsole);

        // Phase 2 - link to the data path folder
        // ensure core folders are made - if any of these fail, the rest fails
        this.initStatus = 'folder-setup';
        await Promise.all([
            fs.ensureDir(path.join(params.dataDir, 'mods')),
            fs.ensureDir(path.join(params.dataDir, 'scenarios')),
            fs.ensureDir(path.join(params.dataDir, 'saves')),
            fs.ensureDir(path.join(params.dataDir, 'saves-upload')),
            fs.ensureDir(path.join(params.dataDir, 'script-output')),
            fs.ensureDir(path.join(params.dataDir, 'downloads')),
            fs.ensureDir(path.join(params.dataDir, 'mods-cache'))
        ]);

        // Will need to have a check for script-output being populated after a run or not, to ID a bad Data Path
        Factory.factoryDataPath = params.dataDir;
        Factory.factoryInstallPath = params.installDir;

        // clear the script-output folder as well
        //await fs.emptyDir(path.join(params.dataDir, 'script-output'))
        Logging.log('info', `Core folders exist in ${params.dataDir}`);

        // Clear the 'compiled' save that is specified, if it exists
        // this will force a recompile, which is only done once on init anyways.
        // ensures correct version with executable. Happens in 'verify' function
        //await fs.remove(Factory.activeSavePath)

        this.initStatus = 'factorio-api-init'
        // Phase 3 - Setup API access
        // Setup factorio api access, to be able to download/update needed mods and game
        await FactorioApi.initialize({
            username: params.username ? params.username : process.env.FACTORIO_USER,
            token: params.token ? params.token : process.env.FACTORIO_TOKEN,
            dataPath: Factory.factoryDataPath,
            installPath: Factory.factoryInstallPath
        })

        // Phase 4 - Verify our install or reinstall as needed
        // First off, lets load our cached mods
        await Factory.refreshModCache()
        let err: any;

        try {
            this.initStatus = 'validating-install'
            // Validate our executable exists and info file exists
            await Factory.verifyInstall();
        } catch (e) {
            // if this gets hit, means that something had an error in the 'link' process above
            // In this case, this catch allows code to continue past in this case, where future code handles the re-install if possible
            // or re-throws an error
            err = e;
            Logging.log('error', `Error linking factory install path - ${e.message}`);
        }


        // Max number of times can be downloaded while process is running - if this occurs, restart process. Safety check for paranoia of constant re-downloads for now
        if (Factory.factoryExecutable != true) {
            if (Factory.clientDownloadCount < 2) {
                // re-install!
                try {
                    this.initStatus = 'installing'
                    await Factory.installGame(process.env.FACTORY_VERSION);
                } catch (e) {
                    Logging.log('error', `Error installing Factorio - ${e.message}`);
                    // delete the cached download file, as it may have issues. Next loop will retry!
                }
            } else {
                throw new Error(`Cannot link factory install path, too many download attempts - ${err.message}. Manual install required, then restart process!`);
            }
        }

        this.initStatus = 'ready';
    }

    static async stop(includeLogger: boolean = true) {

        if (Factory.isTrialRunning)
            throw new Error(`Cannot stop factory while factorio executable is running!`);

        Logging.log('info', `Stopping factory - clearing all variables`);

        Factory.factoryDataPath = undefined;
        Factory.factoryInstallPath = undefined;
        Factory.factoryVersion = undefined;
        Factory.factoryExecutable = undefined;
        Factory.clientDownloadCount = 0;

        Factory.initStatus = 'not-started'

        // clear API vars
        FactorioApi.clear();

        // stop the logger before exiting
        if (includeLogger === true)
            Logging.stopLogger();
    }

    static async installGame(version: string = undefined, build: string | undefined = undefined) {

        // First, increment our download count here, so that even if errors occur we know that it was attempted
        Factory.clientDownloadCount++;

        const localOsDistro = os.platform();
        let localBuild = build;
        if (!localBuild)
            localBuild = process.env.FACTORIO_BUILD ? process.env.FACTORIO_BUILD : 'headless';

        // If this is WINDOWS, we need to ensure we download that distro (manual zip file). Otherwise, tar.xz is used
        if (localOsDistro === 'win32' && localBuild === 'headless')
            throw new Error('Factorio does not support windows for headless builds. Set environmental variable FACTORIO_BUILD to \'alpha\' to enable the full game download.');

        if (localOsDistro === 'win32' && !FactorioApi.isAuthenticated)
            throw new Error('To download the Windows version of Factorio, you must be authenticated and own the game! Only linux headless can run without license');

        if (process.env.FACTORIO_BUILD === 'alpha' && !FactorioApi.isAuthenticated)
            throw new Error('To download the Graphical version of Factorio, you must be authenticated and own the game! Only linux headless can run without license');

        // even if win32 is chosen for distro in the API, MAKE SURE win32-manual is used for download
        let downloadDistro: string;
        switch (localOsDistro) {
            case 'win32':
                downloadDistro = 'win32-manual';
                break
            case 'freebsd':
            case 'openbsd':
            case 'linux':
                downloadDistro = 'linux64';
                break;
        }

        // Download game to the downloads folder
        Logging.log('info', `Downloading Factorio ${version ? version : FactorioApi.latestVersion.stable[localBuild]} ${localBuild} ${downloadDistro} to ${Factory.factoryDataPath}/downloads`);
        let filepath = await FactorioApi.downloadGame(version ? version : FactorioApi.latestVersion.stable[localBuild], localBuild, downloadDistro);
        if (Factory.clientDownloadCount > 1) {
            // this is our 2nd time around... try re-downloading first
            await fs.remove(filepath)
            filepath = await FactorioApi.downloadGame(version ? version : FactorioApi.latestVersion.stable[localBuild], localBuild, downloadDistro);
        }


        // Delete needed folders in the install location
        Logging.log('info', `Deleting old install directories and files in ${Factory.factoryInstallPath}`);
        await Promise.all([
            fs.remove(path.join(Factory.factoryInstallPath, 'data')),
            fs.remove(path.join(Factory.factoryInstallPath, 'bin')),
            fs.remove(path.join(Factory.factoryInstallPath, 'doc-html')),
            fs.remove(path.join(Factory.factoryInstallPath, 'temp')),
            fs.remove(path.join(Factory.factoryInstallPath, 'config'))
        ]);

        // Remove the last files in the install folder
        let installFolderContents = await fs.readdir(Factory.factoryInstallPath, {withFileTypes: true});
        for (let i = 0; i < installFolderContents.length; i++) {
            if (installFolderContents[i].isFile()) {
                await fs.remove(path.join(Factory.factoryInstallPath, installFolderContents[i].name));
            }
        }

        // Now, we can extract to this folder to 'install'. method is slightly different depending on OS
        Logging.log('info', `Extracting ${filepath} to ${Factory.factoryInstallPath} - This can take some time depending on build chosen to download.`);
        if (localOsDistro === 'win32') {
            await decompress(filepath, Factory.factoryInstallPath);
        } else {
            // decompress using TAR
            await new Promise((resolve, reject) => {
                exec(`tar -xf ${filepath} -C ${Factory.factoryInstallPath} --strip-components=1`, (error, stdout, stderr) => {
                    if (error)
                        reject(error)
                    else
                        resolve(stdout)
                })
            })
            /*await decompress(filepath, Factory.factoryInstallPath, {
                plugins: [decompressTarxz()],
                map: file => {
                    file.path = file.path.substring(9)
                    return file;
                }
            });*/
        }

        await Factory.verifyInstall();
    }

    /*
    * Copies the 'scenario-source' that we have as a template to the <datadir>/scenarios folder, and renames it to the folder name specified
    * */
    static async copyScenarioSourceToFolder(folder: string) {
        const srcPath = path.join(__dirname, '../', '../', 'factory', 'scenarios', 'scenario-source');
        const destPath = path.join(Factory.factoryDataPath, 'scenarios', folder);
        Logging.log('info', {message: `Copying scenario-source from ${srcPath} to ${destPath}`})
        try {
            await fs.copy(srcPath, destPath, {overwrite: true});
            return destPath
        } catch (e) {
            Logging.log('info', {message: `Failed to copy scenario-source! Ensure that scenario-source exists in the scenarios folder`});
            throw new Error('Failed to copy scenario-source - ' + e?.message ? e.message : e)
        }
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

    static async clearActiveMods() {
        // delete the mod-list.json file (and the modsettings.dat) from mods folder - this allows us to start fresh, with no mods by default
        await fs.emptyDir(path.join(Factory.factoryDataPath, 'mods'));
    }

    // returns cached version of given mod
    static async cacheMod(mod: string): Promise<string | null> {
        let name: string = mod.substring(0, mod.lastIndexOf('_'));
        let v: string;
        if (mod.endsWith('latest.zip') || mod.endsWith('latest')) {
            // get most recent version first
            v = await FactorioApi.getLatestModVersion(mod.substring(0, mod.lastIndexOf('_')))
        } else {
            v = mod.substring(mod.lastIndexOf('_') + 1, mod.indexOf('.zip'));
        }

        // first, check if this mod is already cached
        if (Factory.modCache.has(`${name}_${v}.zip`))
            return v;

        await FactorioApi.downloadMod(name, v);
        Factory.modCache.add(`${name}_${v}.zip`);
        return v
    }

    /*
    * We download all mods into the 'mods-cache' folder on 'preparing' a trial. This allows us to then quickly and easily
    * move files to the 'mods' directory later on, just before the trial itself is run that requires them.
    * */
    static async cacheModList(mods: ModList) {
        // We need to make sure all listed mods are present in the mods-cache
        // if a version does not exist in the name, we will assume latest version and append it to the name
        for (let i = 0; i < mods.mods.length; i++) {
            let v = await Factory.cacheMod(mods.mods[i])
            if (mods.mods[i].endsWith('_latest.zip'))
                mods.mods[i] = `${mods.mods[i].substring(0, mods.mods[i].lastIndexOf('_'))}_${v}.zip`
        }
        //await fs.ensureSymlink('','', 'file')
    }

    // Lists all scenarios
    static async listScenarios() {
        return (await fs.readdir(path.join(Factory.factoryDataPath, 'scenarios')))
    }

    // lists both save files and folders - identified by the '.zip' extension
    static async listSaves() {
        return await fs.readdir(path.join(Factory.factoryDataPath, 'saves'));
    }

    /*
    * Running factorio executable
    * */

    static get factorioExecutablePath(): string {
        return path.join(Factory.factoryInstallPath, 'bin', 'x64', 'factorio');
    }

    static factorioRunning: boolean = false;

    static async runFactorio(params: string[]): Promise<IFactorioExecutionResults> {

        if (this.factorioRunning)
            throw new Error('Factorio is already running! Can only run one instance at a time');

        let execResults = '';
        this.factorioRunning = true;
        let start = new Date();
        try {
            await new Promise((resolve, reject) => {
                let s = spawn(Factory.factorioExecutablePath,
                    params, {});
                let er;
                s.stdout.on('data', (data: string) => {
                    execResults += data
                });
                s.on('close', (code) => {
                    // test has finished - proceed!
                    if (er)
                        reject(er)
                    else if (code === 1)
                        reject('Could not start executable - is the game currently running?')
                    else
                        resolve(code);
                });
                s.on('error', (err) => {
                    er = err;
                });
            });
        } catch (e) {
            Logging.log('error', `Error running factorio executable - ${execResults}}`)
            throw new Error(`Error running factorio executable - ${e}`);
        }
        this.factorioRunning = false;
        let end = new Date();

        return {
            execResults,
            start,
            end
        } as IFactorioExecutionResults

    }

    public static async writeKeyValuesToLuaFile(path: string, vars: any): Promise<string> {
        let k = Object.keys(vars);
        let luaContent = await fs.readFile(path, 'utf8');
        for (let i = 0; i < k.length; i++) {
            luaContent = Factory._replaceLuaKeyValue(luaContent, k[i], vars[k[i]]);
        }
        // need to write back to the file path...
        await fs.writeFile(path, luaContent, 'utf8');
        return luaContent;
    }

    private static _replaceLuaKeyValue(luaContent: string, key: string, val: string | number | null): string {
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

export interface IFactorioExecutionResults {
    execResults: string;
    start: Date,
    end: Date,
}
