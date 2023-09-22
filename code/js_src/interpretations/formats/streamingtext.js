export async function* format(source) {
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
        yield `${results.join(' ')}\n`;
    }
}
;
