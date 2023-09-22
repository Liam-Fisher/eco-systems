export async function* format(source) {
    this.log('set_interpretation', [], [`loaded buffer formatting`]);
    this.data = Buffer.alloc(4);
    this.sampleIndex = 0;
    this.attrs.samps ??= this.maxLetters;
    this.attr.channels = 1;
    for (let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    this.log('set_interpretation', [], [`begin buffer streaming`]);
    for await (let methodResult of source) {
        if (!methodResult?.length || ((++this.sampleIndex) >= this.attrs.samples))
            continue;
        if (typeof methodResult?.[0] !== 'number') {
            throw new Error(`invalid streaming buffer value ${methodResult?.[0]}`);
        }
        this.data.writeFloatLE(methodResult?.[0], 0);
        this.log('write_data', [], [this.data.readFloatLE(0), this.data.toString('base64')]);
        yield this.data.toString();
    }
    this.log('set_interpretation', [], [`completed buffer streaming`]);
}
;
