"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker = require("worker_threads");
async function* format(source) {
    this.accumIndex = 0;
    worker.parentPort.postMessage(`created coll streaming`);
    if (!this?.precision)
        this.precision = 6;
    for await (const methodResult of source) {
        if (!methodResult.length)
            continue;
        let results = methodResult.map(r => {
            if (typeof r === 'number')
                return r.toPrecision(this.precision);
            if (typeof r === 'string')
                return r;
            return '';
        });
        yield `${this.accumIndex++}, ${results.join(' ')};\n`;
    }
    worker.parentPort.postMessage(`completed coll streaming`);
}
exports.default = format;
;
