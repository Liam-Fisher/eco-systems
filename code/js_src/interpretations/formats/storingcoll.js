export async function* format(source) {
    this.log('set_interpretation', [], [`loaded coll formatting`]);
    this.data = new Map();
    if (!this?.attrs.precision)
        this.attrs.precision = 6;
    for (let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    this.log('set_interpretation', [], [`begin coll storing`]);
    for await (const result of source) {
        if ((result.length < 2) || ((typeof result[0] !== 'string') && (typeof result[1] !== 'number')))
            continue;
        this.data.set(result[0], result.slice(1));
    }
    ;
    this.log('set_interpretation', [], [`completed coll storing`]);
    this.log('set_interpretation', [], [`begin coll writing`]);
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
    this.log('set_interpretation', [], [`completed coll writing`]);
}
;
