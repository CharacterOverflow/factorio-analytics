import fs from "fs-extra";
import path from "path";
import {randomUUID} from "crypto";
import {
    Trial
} from "./Trial";
import {spawn} from "child_process";
import {Logging} from "./Logging";
import winston from "winston";
import {Dataset} from "./Dataset";
import * as os from "os";
import extract from "extract-zip";

export interface IFactoryParams {
    installDir: string;
    dataDir: string;

    // Optional param, allows you to select the folder name for the benchmark scenario. Useful if you have another scenario called 'benchmark' you dont want to conflict with
    scenarioName?: string

    // Optional, defaults to 'false'
    hideConsoleLogs?: boolean

    // Optional, defaults to 'false'. If true, will delete all mods from the mod folder before continuing setup
    resetSetup?: boolean
}

export class Factory {

    // the init information.
    static installDir: string;
    static dataDir: string
    static scenarioName: string = 'benchmark';

    // the 'UUID' of the trial that is currently set up to run / is running. Set during buildTrial
    static builtTrial: string = null;
    static builtCmdParams: string[] = null;

    // The current trial that is running
    static runningTrial: Trial = null;
    static runningTrialStage: string = 'ready'

    // ID of our session, to differentiate in logs between script instances
    static sessionId: string;

    // Grab the LUA sandboxfile from the scenario dir
    static get sandboxLua() {
        return path.join(Factory.scenario, 'sandbox.lua')
    }

    // this can be placed into the 'saves' folder isntead of 'scenarios'
    static get scenario() {
        return path.join(Factory.dataDir, 'saves', Factory.scenarioName)
    }

    static get executable() {
        return path.join(Factory.installDir, 'bin', 'x64', 'factorio')
    }

    static async initialize(params: IFactoryParams) {
        this.installDir = params.installDir;
        this.dataDir = params.dataDir;
        this.sessionId = randomUUID();

        if (params.scenarioName)
            Factory.scenarioName = params.scenarioName;

        if (params.resetSetup === true) {
            Logging.log('info', {message: 'Resetting mod folders'});
            await fs.emptyDir(path.join(Factory.dataDir, 'mods'));
        }

        // setup logging
        const logFormat = winston.format.printf(function (info) {
            return `${info.timestamp}-${info.level}: ${Object.keys(info).length <= 3 ? info.message : JSON.stringify(info, null, 4)}`;
        });
        if (params.hideConsoleLogs === true) {
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
        Logging.log('info', {message: 'Factory initializing - logger started', ...params});

        // Check if we have a scenario already built to use (we should by default, but verify, rebuild if needed)
        if (!await fs.pathExists(path.join(__dirname, '../', '../', 'factory', 'scenario', 'sandbox.lua')))
            await Factory.buildScenario();

        // Setup mod and scenario information
        await Factory.setupModsAndScenario();

        // Lastly, validate!
        await Factory.validateInitialization();
    }

    /*
    * Builds a scenario that can be loaded into factorio to run a benchmark.
    * We use a scenario to serve as a template of a world at tick 0, which will focus on  exporting all data
    * Custom scenarios may be desired for other use cases, such as placing resource deposits in specific locations
    * Once a scenario is made, it needs to ahve the factorio executable convert it to a save file.
    * This is not the only step - it also needs to be unzipped from its save file into a folder in the scenarios directory
    * - despite being a 'save', we need it split out so we can replace lua values easily
    * */
    static async buildScenario() {
        Logging.log('info', {message: 'Building scenario'});

        // Delete all files in factory/scenario
        await fs.emptyDir(Factory.scenario);

        // Delete datadir/scenarios/{scenarioName} contents if they exist
        await fs.emptyDir(path.join(Factory.dataDir, 'scenarios', Factory.scenarioName));

        // Copy factory/scenario_source to datadir/scenarios/{scenarioName}
        await fs.copy(path.join(__dirname, '../', '../', 'factory', 'scenario-source'), path.join(Factory.dataDir, 'scenarios', Factory.scenarioName), {overwrite: true});

        // Run factorio executable to convert scenario to save file
        Logging.log('info', {message: 'Converting scenario to save file'});
        let p = await new Promise((resolve, reject) => {
            let execResults = '';
            let s = spawn(Factory.executable,
                ['-m', 'scenario-source'], {});
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
                    resolve(execResults);
            });
            s.on('error', (err) => {
                er = err;
            });
        });

        // Unzip datadir/saves/{scenarioName}.zip to factory/scenario
        Logging.log('info', {message: 'Unzipping save file'});
        await extract(path.join(Factory.dataDir, 'saves', 'scenario-source.zip'), {dir: path.join(__dirname, '../', '../', 'factory', 'scenario')});

        // Now we need to copy all files from factory/scenario/scenario-source to factory/scenario
        await fs.copy(path.join(__dirname, '../', '../', 'factory', 'scenario', 'scenario-source'), path.join(__dirname, '../', '../', 'factory', 'scenario'), {overwrite: true});

        // delete the scenario-source folder inside scenario
        await fs.remove(path.join(__dirname, '../', '../', 'factory', 'scenario', 'scenario-source'));

        // call the scenario and mods setup function again
        await Factory.setupModsAndScenario();

        // Return text logs of what happened
        return p;
    }

    // Ensure everything is set up and ready to go
    static async validateInitialization() {
        // Make sure our factorio executable exists. If windows machine, add 'exe' to the end

        // write  code below to check the OS and add the .exe if needed
        let execExists;
        if (os.platform() === 'win32') {
            execExists = fs.pathExists(Factory.executable + '.exe');
        } else {
            execExists = fs.pathExists(Factory.executable);
        }

        // Make sure our scenario exists
        let scenarioExists = fs.pathExists(Factory.scenario);

        // ...with a valid file to write into (sandbox.lua)
        let scenarioLuaExists = fs.pathExists(Factory.sandboxLua);

        // This will 'throw' an error if any of the above fail harshly, or will be thrown if they return false below
        let d = await Promise.all([execExists, scenarioExists, scenarioLuaExists])

        if (d[0] === false)
            throw new Error('Factorio executable not found at ' + Factory.executable);

        if (d[0] === false)
            throw new Error('Scenario directory not found at ' + Factory.scenario);

        if (d[1] === false)
            throw new Error('Scenario LUA file not found at ' + Factory.sandboxLua);
    }

    static async setupModsAndScenario() {
        Logging.log('info', {message: `Moving template scenario to location ${path.join(Factory.dataDir, 'scenarios', 'scenario')}`})
        try {
            await fs.copy(path.join(__dirname, '../', '../', 'factory', 'scenario'), Factory.scenario, {overwrite: true});
        } catch (e) {
            Logging.log('info', {message: `Failed to copy scenario to ${Factory.scenario} - trying again with different path, this is likely due to running unit tests`});
            await fs.copy(path.join(__dirname, '../', 'factory', 'scenario'), Factory.scenario, {overwrite: true});
        }

        Logging.log('info', {message: `Moving template mods to location ${path.join(Factory.dataDir, 'mods')}`});
        try {
            await fs.copy(path.join(__dirname, '../', '../', 'factory', 'mods'), path.join(Factory.dataDir, 'mods'), {overwrite: true});
        } catch (e) {
            Logging.log('info', {message: `Failed to copy mods to ${path.join(Factory.dataDir, 'mods')} - trying again with different path, this is likely due to running unit tests`});
            await fs.copy(path.join(__dirname, '../', 'factory', 'mods'), Factory.scenario, {overwrite: true});
        }
    }

    static async deleteRawFiles(trial: string | Trial) {
        // deletes all raw files associated with this trial in the script-output directory
        let trialId = typeof trial === 'string' ? trial : trial.id;
        try {
            await Promise.allSettled([
                fs.rm(path.join(Factory.dataDir, 'script-output', 'data', `${trialId}_item.jsonl`)),
                fs.rm(path.join(Factory.dataDir, 'script-output', 'data', `${trialId}_elec.jsonl`)),
                fs.rm(path.join(Factory.dataDir, 'script-output', 'data', `${trialId}_circ.jsonl`)),
                fs.rm(path.join(Factory.dataDir, 'script-output', 'data', `${trialId}_poll.jsonl`))
            ]);
        } catch (e) {
            Logging.log('error', {message: `Failed to delete raw files for trial ${trialId}`, error: e});
        }
    }

    /*
    * This function is used to 'build' a trial.
    *
    * Seeing as we need to write to a file before we actually 'run' a trial, this stage is required.
    * */
    static async buildTrial(t: Trial) {

        Factory.runningTrialStage = 'writing-config'
        Factory.runningTrial = t;
        Logging.log('info', {message: `Building trial ${t.id} for execution... BP Size: ${t.bp.bp.length}}`})
        // Read our sandbox lua file
        let d = await fs.readFile(Factory.sandboxLua, 'utf8');

        Logging.log('info', {message: `Replacing UID, BP, and other parameter values in ${Factory.scenarioName}/sandbox.lua definition`})
        // Find where our UID is defined, and replace it with the UID we want. Do the same with BP and ticks settings
        d = Factory._replaceLineAfterKey(d, '--<UID>--', `\nlocal uid = '${t.id}'`);
        d = Factory._replaceLineAfterKey(d, '--<BLUEPRINT>--', `\nlocal bpStr = '${t.bp.bp}'`);
        d = Factory._replaceLineAfterKey(d, '--<ITEM_TICKS>--', `\nlocal item_ticks = ${t.itemInterval ? t.itemInterval : 'nil'}`);
        d = Factory._replaceLineAfterKey(d, '--<ELEC_TICKS>--', `\nlocal elec_ticks = ${t.elecInterval ? t.elecInterval : 'nil'}`);
        d = Factory._replaceLineAfterKey(d, '--<CIRC_TICKS>--', `\nlocal circ_ticks = ${t.circInterval ? t.circInterval : 'nil'}`);
        d = Factory._replaceLineAfterKey(d, '--<POLL_TICKS>--', `\nlocal poll_ticks = ${t.pollInterval ? t.pollInterval : 'nil'}`);
        d = Factory._replaceLineAfterKey(d, '--<BOTS>--', `\nlocal bots = ${t.initialBots}`);

        Logging.log('info', {message: `Writing back to scenario/sandbox.lua`});
        // Write back to file
        await fs.writeFile(Factory.sandboxLua, d, 'utf8');

        // Build our command we expect to run, set as builtCmd
        Factory.builtCmdParams = [
            '--benchmark', `${Factory.scenario}`,
            '--benchmark-ticks', `${t.length}`,
            '--benchmark-verbose', 'all'
        ];
        Factory.builtTrial = t.id;
        Factory.runningTrialStage = 'built';

        Logging.log('info', {message: `Trial ${t.id} built for execution, ready to run! If you want to run this manually via CLI to observe the raw results, use the following command:`})
        Logging.log('info', {message: `${Factory.executable} ${Factory.builtCmdParams.join(' ')}`})

        return t;
    }

    // Options are for this specific trial only. Main functionality currently for this is to 'skip' data processing on a trial, if the
    // data is going to be used raw for other cases
    static async runTrial(t: Trial, skipProcessing: boolean = false) {
        Logging.log('info', {message: `Starting trial ${t.id}...`})

        if (this.runningTrial)
            throw new Error('A trial is already running - please wait until completion or clear runningTrial manually')

        t.startedAt = new Date()
        // If the trial isn't built, we need to build it first
        if (t.id != Factory.builtTrial)
            await Factory.buildTrial(t);

        Logging.log('info', {message: `Running built trial ${Factory.builtTrial}`});
        const startedExecAt = new Date()
        let execResults = '';
        Factory.runningTrialStage = 'exec';
        // Run our test, save output of exec to var
        await new Promise((resolve, reject) => {
            let s = spawn(Factory.executable,
                Factory.builtCmdParams, {});
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
        // Start building our results object. Copy params to new object, then add in our results
        t.endedAt = new Date()
        Factory.runningTrialStage = 'post-exec';
        Logging.log('info', {message: `Finished trial ${t.id} - moving into post-exec stage`});

        // Depending on the interval settings in 'trial', we will parse the needed files
        let d = new Dataset({
            execStartTime: startedExecAt,
            trial: t,
            rawSysData: execResults
        })
        t.linkData(d);

        if (skipProcessing === true || t.keepRaw === true) {
            d.skipProcess(path.join(Factory.dataDir, 'script-output'));
            Factory.runningTrialStage = 'done';
            Factory.runningTrial = null;
            return t;
        } else {
            d.process(path.join(Factory.dataDir, 'script-output'));
            await Factory.deleteRawFiles(t);
            Factory.runningTrialStage = 'done';
            Factory.runningTrial = null;
            return t;
        }
    }

    /*
    * Used to replace a line in a lua file - looks for specific matching XML brackets
    * */
    private static _replaceLineAfterKey(source: string, key: string, newLine: string): string {
        // Find where our <key> is defined, and replace it with the UID we want
        let uidReplaceStart = source.indexOf('\n', source.indexOf(key) + 1);
        let uidReplaceEnd = source.indexOf('\n', uidReplaceStart + 1);
        return source.replace(source.substring(uidReplaceStart, uidReplaceEnd), newLine);

    }
}
