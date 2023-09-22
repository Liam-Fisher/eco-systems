"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Network {
    static activePatcherIDs;
    static activeObjectIDs;
    static lineIndex;
    static file;
    static addIDs;
    static delIDs;
    static positions;
    static interpreterFilePaths;
    static reset(interpretations) {
        [this.file, this.addIDs, this.delIDs, this.activePatcherIDs, this.activeObjectIDs, this.lineIndex] = ['', [], [], (new Set()), (new Set()), 0];
        this.interpreterFilePaths = {};
        for (let ID of Object.keys(interpretations)) {
            this.interpreterFilePaths[ID] = [];
        }
        this.positions = {
            "table": [50, 0],
            "jit.matrix": [150, 0],
            "dict": [300, 0],
            "coll": [400, 0],
            "buffer~": [500, 0],
            "texture": [750, 0],
            "material": [1000, 0],
            "shader": [1300, 0],
            "pass": [1500, 0]
        };
    }
    static writeLine(delay, str) {
        this.file += `${str};\n${delay} ${this.lineIndex++};\n`;
    }
}
exports.default = Network;
;
