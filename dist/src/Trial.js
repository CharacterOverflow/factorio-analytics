"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Trial_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trial = void 0;
const crypto_1 = require("crypto");
const Source_1 = require("./Source");
const typeorm_1 = require("typeorm");
// one of the main classes needed to do much of anything
let Trial = Trial_1 = class Trial {
    static ensureObject(trial) {
        let a = trial;
        if (a.dataFiles)
            return a;
        else
            return new Trial_1(a);
    }
    // filename results - generated from flags of which data to poll + id
    // these files will be deleted after processing, so they may or may not exist. These are their original names however
    get dataFiles() {
        if (this.metadata)
            return {
                items: this.recordItems ? `${this.id}_item.jsonl` : undefined,
                electric: this.recordElectric ? `${this.id}_elec.jsonl` : undefined,
                circuits: this.recordCircuits ? `${this.id}_circ.jsonl` : undefined,
                pollution: this.recordPollution ? `${this.id}_poll.jsonl` : undefined,
            };
        else
            return undefined;
    }
    constructor(params = null) {
        // text result (raw) system data
        this.rawSystemText = null;
        this.itemMetadata = null;
        this.electricMetadata = null;
        this.circuitMetadata = null;
        this.pollutionMetadata = null;
        // In the event the constructor was called null, we will allow and still create an ID. ORMs can do this at times
        this.id = (0, crypto_1.randomUUID)();
        this.createdAt = new Date();
        // we allow no-param construction of any class - this helps with ORMs and type casting
        if (!params)
            return;
        // If our source is a string, we need to create the source object automatically
        if (params.source && typeof params.source == 'string') {
            if (params.source.endsWith('.zip')) {
                // create save source
                this.source = new Source_1.Source({
                    saveGamePath: params.source,
                });
            }
            else {
                // create blueprint source
                this.source = new Source_1.Source({
                    blueprint: params.source,
                });
            }
        }
        else {
            // otherwise, we assume its already a source object
            this.source = Source_1.Source.ensureObject(params.source);
        }
        this.name = params.name;
        this.desc = params.desc;
        // set the other data we need as well about the trial
        if (params.length)
            this.length = params.length;
        if (params.tickInterval)
            this.tickInterval = params.tickInterval;
        if (params.initialBots)
            this.initialBots = params.initialBots;
        if (params.recordItems)
            this.recordItems = params.recordItems;
        if (params.recordElectric)
            this.recordElectric = false; // params.recordElectric;
        if (params.recordCircuits)
            this.recordCircuits = params.recordCircuits; // params.recordCircuits;
        if (params.recordPollution)
            this.recordPollution = params.recordPollution;
        if (params.recordSystem)
            this.recordSystem = params.recordSystem;
    }
    setStage(stage) {
        this.stage = stage;
    }
};
exports.Trial = Trial;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Trial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        type: 'nvarchar'
    }),
    __metadata("design:type", String)
], Trial.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Source_1.Source),
    __metadata("design:type", Source_1.Source)
], Trial.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Number)
], Trial.prototype, "length", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Number)
], Trial.prototype, "tickInterval", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Number)
], Trial.prototype, "initialBots", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Trial.prototype, "recordItems", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Trial.prototype, "recordElectric", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Trial.prototype, "recordCircuits", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Trial.prototype, "recordPollution", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Trial.prototype, "recordSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Trial.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Trial.prototype, "desc", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], Trial.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Date)
], Trial.prototype, "startedRunAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Date)
], Trial.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Date
    // text result of trial - logs and/or system data
    )
], Trial.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-array'
    }),
    __metadata("design:type", Array)
], Trial.prototype, "textLogs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-json'
    }),
    __metadata("design:type", Object)
], Trial.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-json'
    }),
    __metadata("design:type", Object)
], Trial.prototype, "itemMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-json'
    }),
    __metadata("design:type", Object)
], Trial.prototype, "electricMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-json'
    }),
    __metadata("design:type", Object)
], Trial.prototype, "circuitMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'simple-json'
    }),
    __metadata("design:type", Object)
], Trial.prototype, "pollutionMetadata", void 0);
exports.Trial = Trial = Trial_1 = __decorate([
    (0, typeorm_1.Entity)('trials'),
    __metadata("design:paramtypes", [Object])
], Trial);
//# sourceMappingURL=Trial.js.map