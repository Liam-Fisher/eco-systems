import * as worker from "worker_threads";

export async function* format(source: AsyncIterable<(string|number)[]>) { 
    this.log('set_interpretation', [],[`loaded coll formatting`]);
    this.accumIndex = 0;
    if(!this?.attrs.precision) this.attrs.precision = 6;  
    for(let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    this.log('set_interpretation', [],[`begin coll streaming`]);
    for await (const methodResult of source) {
    if(!methodResult.length) continue;
    let results = methodResult.map(r => {
        if(typeof r === 'number') return r.toPrecision(this.attrs.precision);
        if(typeof r === 'string') return r;
        return '';
    });
    yield `${this.accumIndex++}, ${results.join(' ')};\n`;
}
this.log('set_interpretation', [],[`completed coll streaming`]);
};
