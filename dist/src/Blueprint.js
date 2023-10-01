"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyBlueprint = exports.Blueprint = void 0;
const crypto_1 = __importDefault(require("crypto"));
/*
* This class will represent a single BLUEPRINT (aka a Factory or Design) that we want to be able to use
* This blueprint will be used NOT ONLY to run the benchmark, but also to draw information about the blueprint itself such
* as entities, pollution, energy usage, and more.
*
* At a minimum, a blueprint requires a blueprint string to be valid. However, more  details can always be added / generated
* */
class Blueprint {
    constructor(bp) {
        if (!bp)
            return;
        this.bp = bp.replaceAll('\n', '');
        this.parse();
    }
    // parses blueprint to fill out data in this class
    parse() {
        if (!this.id)
            this.id = crypto_1.default.createHash('sha256').update(this.bp).digest('hex');
    }
}
exports.Blueprint = Blueprint;
class EmptyBlueprint extends Blueprint {
    constructor() {
        super('EMPTY');
    }
}
exports.EmptyBlueprint = EmptyBlueprint;
//# sourceMappingURL=Blueprint.js.map