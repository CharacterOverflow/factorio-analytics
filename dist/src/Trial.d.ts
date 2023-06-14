import { Dataset } from "./Dataset";
import { Blueprint } from "./Blueprint";
export interface ITrialParams {
    bp?: Blueprint | string;
    length?: number;
    itemInterval?: number;
    elecInterval?: number;
    circInterval?: number;
    pollInterval?: number;
    sysInterval?: number;
    initialBots?: number;
    raw?: boolean;
}
export declare class Trial {
    id: string;
    bp: Blueprint;
    length?: number;
    itemInterval?: number;
    elecInterval?: number;
    circInterval?: number;
    pollInterval?: number;
    sysInterval?: number;
    initialBots?: number;
    keepRaw?: boolean;
    data: Dataset;
    startedAt: Date;
    endedAt: Date;
    constructor(params: ITrialParams);
    linkData(data: Dataset): void;
}
