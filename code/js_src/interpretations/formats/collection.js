"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storing = exports.streaming = void 0;
async function* streaming(source) {
    this.accumIndex = 0;
    if (!this?.precision)
        this.precision = 6;
    for await (const methodResult of source) {
        let results = methodResult.map(r => {
            if (typeof r === 'number')
                return r.toPrecision(this.precision);
            if (typeof r === 'string')
                return r;
            return '';
        });
        yield `${this.accumIndex++}, ${results.join(' ')};\n`;
    }
}
exports.streaming = streaming;
;
async function* storing(source) {
    this.data = new Map();
    if (!this?.precision)
        this.precision = 6;
    for await (const result of source) {
        if ((result.length < 2) || ((typeof result[0] !== 'string') && (typeof result[1] !== 'number')))
            continue;
        this.data.set(result[0], result.slice(1));
    }
    ;
    for (const [key, val] of this.data) {
        let results = val.map(r => {
            if (typeof r === 'number')
                return r.toPrecision(this.precision);
            if (typeof r === 'string')
                return r;
            return '';
        });
        yield `${key}, ${results.join(' ')};\n`;
    }
}
exports.storing = storing;
;
