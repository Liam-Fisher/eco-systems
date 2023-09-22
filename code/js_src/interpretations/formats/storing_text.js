"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
async function* format(source) {
    this.data = new Map();
    if (!this?.precision)
        this.precision = 6;
    for await (const result of source) {
        if ((typeof result[0] === 'number') && (typeof result[1] === 'string'))
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
        yield `${results.join(' ')}\n`;
    }
}
exports.format = format;
;
