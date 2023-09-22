"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const worker = require("worker_threads");
async function* format(source) {
    this.data = Buffer.alloc(4);
    this.sampleIndex = 0;
    this.samps ??= this.maxLetters;
    worker.parentPort.postMessage(`created buffer streaming`);
    worker.parentPort.postMessage(`samps: ${this.samps}`);
    for await (const methodResult of source) {
        if (!methodResult?.length || ((++this.sampleIndex) >= this.samples))
            continue;
        worker.parentPort.postMessage(`result: ${methodResult}`);
        if (typeof methodResult?.[0] !== 'number') {
            throw new Error(`invalid streaming buffer value ${methodResult?.[0]}`);
        }
        this.data.writeFloatLE(methodResult?.[0], 0);
        yield this.data;
    }
    worker.parentPort.postMessage(`completed buffer streaming`);
}
exports.format = format;
;
