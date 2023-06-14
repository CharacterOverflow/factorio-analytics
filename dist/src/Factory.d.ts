import { Trial } from "./Trial";
export interface IFactoryParams {
    installDir: string;
    dataDir: string;
    scenarioName?: string;
    hideConsoleLogs?: boolean;
}
export declare class Factory {
    static installDir: string;
    static dataDir: string;
    static scenarioName: string;
    static builtTrial: string;
    static builtCmdParams: string[];
    static runningTrial: Trial;
    static runningTrialStage: string;
    static sessionId: string;
    static get sandboxLua(): string;
    static get scenario(): string;
    static get executable(): string;
    static initialize(params: IFactoryParams): Promise<void>;
    static validateInitialization(): Promise<void>;
    static setupModsAndScenario(): Promise<void>;
    static deleteRawFiles(trial: string | Trial): Promise<void>;
    static loadRawFile(filename: string): Promise<string>;
    static buildTrial(t: Trial): Promise<Trial>;
    static runTrial(t: Trial, skipProcessing?: boolean): Promise<Trial>;
    private static _replaceLineAfterKey;
}
