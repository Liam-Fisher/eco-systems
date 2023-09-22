"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker = require("worker_threads");
async function* format(source) {
    this.channels ??= 1;
    worker.parentPort.postMessage(`created buffer streaming`);
    for await (const methodResult of source) {
        worker.parentPort.postMessage(`writing data at ${this.accumIndex}`);
        if (!methodResult.length)
            continue;
        worker.parentPort.postMessage(`result: ${methodResult}`);
        let results = methodResult.map(r => {
            if (typeof r === 'number')
                return r.toPrecision(this.precision);
            if (typeof r === 'string')
                return r;
            return '';
        });
        yield `${this.accumIndex++}, ${results.join(' ')};\n`;
    }
    worker.parentPort.postMessage(`completed buffer streaming`);
}
exports.default = format;
;
