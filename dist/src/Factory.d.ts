import { Trial } from "./Trial";
import { TrialSource } from "./TrialSource";
import { Mod, ModList } from "./ModList";
import { IDatasetCombinedResults } from "./Dataset";
export interface IFactoryStartParams {
    installDir: string;
    dataDir?: string;
    hideConsole?: boolean;
    username?: string;
    token?: string;
}
export interface IFactoryModRecord {
    name: string;
    enabled?: boolean;
}
export declare class Factory {
    static prepareTrial(t: Trial): Promise<void>;
    static compileTrial(t: Trial): Promise<void>;
    static runTrial(t: Trial): Promise<void>;
    static analyzeTrial(t: Trial): Promise<IDatasetCombinedResults>;
    static isTrialRunning: boolean;
    static get modsPath(): string;
    static get scriptOutputPath(): string;
    static factoryDataPath: string;
    static factoryInstallPath: string;
    static factoryVersion: string;
    protected static factoryExecutable: boolean;
    static clientDownloadCount: number;
    static modCache: Set<string>;
    static verifyInstall(): Promise<any>;
    static setupLogger(hideConsole?: boolean): Promise<void>;
    static _initStatus: string;
    static get initStatus(): string;
    static set initStatus(val: string);
    static onStatusChange: (newStatus: string) => void;
    private static deleteScriptOutputFiles;
    static applyModsOfSource(source: TrialSource): Promise<void>;
    static symlinkModFiles(modFiles?: string[]): Promise<void>;
    static refreshModCache(): Promise<void>;
    static initialize(params: IFactoryStartParams): Promise<void>;
    static stop(includeLogger?: boolean): Promise<void>;
    static installGame(version?: string, build?: string | undefined): Promise<void>;
    static copyScenarioSourceToFolder(folder: string): Promise<string>;
    static clearActiveMods(): Promise<void>;
    static cacheMod(mod: Mod): Promise<boolean>;
    static cacheModList(mods: ModList): Promise<void>;
    static listScenarios(): Promise<string[]>;
    static listSaves(): Promise<string[]>;
    static get factorioExecutablePath(): string;
    static factorioRunning: boolean;
    static runFactorio(params: string[]): Promise<IFactorioExecutionResults>;
    static writeKeyValuesToLuaFile(path: string, vars: any): Promise<string>;
    private static _replaceLuaKeyValue;
}
export interface IFactorioExecutionResults {
    execResults: string;
    start: Date;
    end: Date;
}
