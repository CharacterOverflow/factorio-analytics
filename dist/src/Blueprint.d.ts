export declare class Blueprint {
    id: string;
    readonly bp: string;
    constructor(bp: string);
    parse(): void;
}
export declare class EmptyBlueprint extends Blueprint {
    constructor();
}
