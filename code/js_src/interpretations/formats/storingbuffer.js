"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const worker = require("worker_threads");
async function* format(source) {
    this.sampleIndex = 0;
    this.samples ??= this.maxLetters;
    this.channels ??= this.parameterSizes.reduce((a, v) => a + v, 0);
    this.data ??= Array(this.channels).fill(Buffer.alloc(this.samples * 4));
    this.channelGroups = [0];
    let channelIndex = 0;
    for (let cIndex = 1; cIndex < this.parameterSizes.length; cIndex++) {
        channelIndex += this.parameterSizes[cIndex];
        this.channelGroups.push(channelIndex);
    }
    worker.parentPort.postMessage(`created buffer storing`);
    worker.parentPort.postMessage(`samples: ${this.samples}`);
    worker.parentPort.postMessage(`channels: ${this.channels}`);
    worker.parentPort.postMessage(`samples: ${this.samples}`);
    worker.parentPort.postMessage(`channelGroups: ${this.channelGroups.join(' ')}`);
    for await (const methodResult of source) {
        if (!(methodResult?.[0] === 'set'))
            continue;
        for (let pIndex = 1; pIndex < methodResult.length; pIndex++) {
            let val = methodResult[pIndex];
            if (typeof val !== 'number') {
                throw new Error(`invalid ${typeof val} value ${val}`);
            }
            let channelIndex = this.channelGroups[this.systemIndex] + pIndex;
            this.data[channelIndex].writeFloatLE(methodResult[pIndex], this.letterIndex * 4);
        }
    }
    worker.parentPort.postMessage(`completed buffer storing`);
    worker.parentPort.postMessage(`begin buffer writing`);
    for await (const channel of this.data) {
        yield channel;
    }
    worker.parentPort.postMessage(`completed buffer writing`);
}
exports.format = format;
;
