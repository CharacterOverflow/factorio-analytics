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
var GameFlowItemRecord_1, GameFlowPollutionRecord_1, GameFlowSystemRecord_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameFlowSystemRecord = exports.GameFlowPollutionRecord = exports.GameFlowCircuitRecord = exports.GameFlowElectricRecord = exports.GameFlowItemRecord = void 0;
const typeorm_1 = require("typeorm");
let GameFlowItemRecord = GameFlowItemRecord_1 = class GameFlowItemRecord {
    constructor(params, trialId) {
        if (!params)
            return;
        this.trialId = trialId;
        this.label = params.label;
        this.tick = params.tick;
        this.cons = params.cons;
        this.prod = params.prod;
    }
    static fromRecords(records, trialId) {
        // create a 'save' record for all records here
        return records.map(record => new GameFlowItemRecord_1(record, trialId));
    }
};
exports.GameFlowItemRecord = GameFlowItemRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowItemRecord.prototype, "trialId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowItemRecord.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowItemRecord.prototype, "tick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowItemRecord.prototype, "cons", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowItemRecord.prototype, "prod", void 0);
exports.GameFlowItemRecord = GameFlowItemRecord = GameFlowItemRecord_1 = __decorate([
    (0, typeorm_1.Entity)('dataset_items'),
    __metadata("design:paramtypes", [Object, String])
], GameFlowItemRecord);
let GameFlowElectricRecord = class GameFlowElectricRecord {
    constructor(params, trialId) {
        if (!params)
            return;
        this.trialId = trialId;
        this.label = params.label;
        this.tick = params.tick;
        this.networkId = params.networkId;
        this.cons = params.cons;
        this.prod = params.prod;
    }
};
exports.GameFlowElectricRecord = GameFlowElectricRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowElectricRecord.prototype, "trialId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowElectricRecord.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowElectricRecord.prototype, "tick", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowElectricRecord.prototype, "networkId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowElectricRecord.prototype, "cons", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowElectricRecord.prototype, "prod", void 0);
exports.GameFlowElectricRecord = GameFlowElectricRecord = __decorate([
    (0, typeorm_1.Entity)('dataset_electric'),
    __metadata("design:paramtypes", [Object, String])
], GameFlowElectricRecord);
let GameFlowCircuitRecord = class GameFlowCircuitRecord {
    //  implement in the future
    constructor(params, trialId) {
        if (!params)
            return;
        this.trialId = trialId;
        this.circuitId = params.circuitId;
        this.tick = params.tick;
        this.color = params.color;
        this.label = params.label;
        this.count = params.count;
    }
};
exports.GameFlowCircuitRecord = GameFlowCircuitRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowCircuitRecord.prototype, "trialId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], GameFlowCircuitRecord.prototype, "circuitId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowCircuitRecord.prototype, "tick", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowCircuitRecord.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowCircuitRecord.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowCircuitRecord.prototype, "count", void 0);
exports.GameFlowCircuitRecord = GameFlowCircuitRecord = __decorate([
    (0, typeorm_1.Entity)('dataset_circuits'),
    __metadata("design:paramtypes", [Object, String])
], GameFlowCircuitRecord);
let GameFlowPollutionRecord = GameFlowPollutionRecord_1 = class GameFlowPollutionRecord {
    constructor(params, trialId) {
        var _a;
        if (!params)
            return;
        this.trialId = trialId;
        this.label = (_a = params === null || params === void 0 ? void 0 : params.label) !== null && _a !== void 0 ? _a : 'Pollution';
        this.tick = params.tick;
        this.count = params.count;
    }
    static fromRecords(records, trialId) {
        return records.map(record => new GameFlowPollutionRecord_1(record, trialId));
    }
};
exports.GameFlowPollutionRecord = GameFlowPollutionRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowPollutionRecord.prototype, "trialId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowPollutionRecord.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowPollutionRecord.prototype, "tick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], GameFlowPollutionRecord.prototype, "count", void 0);
exports.GameFlowPollutionRecord = GameFlowPollutionRecord = GameFlowPollutionRecord_1 = __decorate([
    (0, typeorm_1.Entity)('dataset_pollution'),
    __metadata("design:paramtypes", [Object, String])
], GameFlowPollutionRecord);
let GameFlowSystemRecord = GameFlowSystemRecord_1 = class GameFlowSystemRecord {
    constructor(params, trialId) {
        var _a;
        if (!params)
            return;
        this.trialId = trialId;
        this.label = (_a = params === null || params === void 0 ? void 0 : params.label) !== null && _a !== void 0 ? _a : 'System';
        this.tick = params.tick;
        this.timestamp = params.timestamp;
        this.wholeUpdate = params.wholeUpdate;
        this.latencyUpdate = params.latencyUpdate;
        this.gameUpdate = params.gameUpdate;
        this.circuitNetworkUpdate = params.circuitNetworkUpdate;
        this.transportLinesUpdate = params.transportLinesUpdate;
        this.fluidsUpdate = params.fluidsUpdate;
        this.heatManagerUpdate = params.heatManagerUpdate;
        this.entityUpdate = params.entityUpdate;
        this.particleUpdate = params.particleUpdate;
        this.mapGenerator = params.mapGenerator;
        this.mapGeneratorBasicTilesSupportCompute = params.mapGeneratorBasicTilesSupportCompute;
        this.mapGeneratorBasicTilesSupportApply = params.mapGeneratorBasicTilesSupportApply;
        this.mapGeneratorCorrectedTilesPrepare = params.mapGeneratorCorrectedTilesPrepare;
        this.mapGeneratorCorrectedTilesCompute = params.mapGeneratorCorrectedTilesCompute;
        this.mapGeneratorCorrectedTilesApply = params.mapGeneratorCorrectedTilesApply;
        this.mapGeneratorVariations = params.mapGeneratorVariations;
        this.mapGeneratorEntitiesPrepare = params.mapGeneratorEntitiesPrepare;
        this.mapGeneratorEntitiesCompute = params.mapGeneratorEntitiesCompute;
        this.mapGeneratorEntitiesApply = params.mapGeneratorEntitiesApply;
        this.crcComputation = params.crcComputation;
        this.electricNetworkUpdate = params.electricNetworkUpdate;
        this.logisticManagerUpdate = params.logisticManagerUpdate;
        this.constructionManagerUpdate = params.constructionManagerUpdate;
        this.pathFinder = params.pathFinder;
        this.trains = params.trains;
        this.trainPathFinder = params.trainPathFinder;
        this.commander = params.commander;
        this.chartRefresh = params.chartRefresh;
        this.luaGarbageIncremental = params.luaGarbageIncremental;
        this.chartUpdate = params.chartUpdate;
        this.scriptUpdate = params.scriptUpdate;
    }
    static fromRecords(records, trialId) {
        return records.map(record => new GameFlowSystemRecord_1(record, trialId));
    }
};
exports.GameFlowSystemRecord = GameFlowSystemRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], GameFlowSystemRecord.prototype, "trialId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GameFlowSystemRecord.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'integer' }),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "tick", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "wholeUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "latencyUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "gameUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "circuitNetworkUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "transportLinesUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "fluidsUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "heatManagerUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "entityUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "particleUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGenerator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorBasicTilesSupportCompute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorBasicTilesSupportApply", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorCorrectedTilesPrepare", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorCorrectedTilesCompute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorCorrectedTilesApply", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorVariations", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorEntitiesPrepare", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorEntitiesCompute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "mapGeneratorEntitiesApply", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "crcComputation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "electricNetworkUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "logisticManagerUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "constructionManagerUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "pathFinder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "trains", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "trainPathFinder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "commander", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "chartRefresh", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "luaGarbageIncremental", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "chartUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], GameFlowSystemRecord.prototype, "scriptUpdate", void 0);
exports.GameFlowSystemRecord = GameFlowSystemRecord = GameFlowSystemRecord_1 = __decorate([
    (0, typeorm_1.Entity)('dataset_system'),
    __metadata("design:paramtypes", [Object, String])
], GameFlowSystemRecord);
//# sourceMappingURL=Dataset.js.map