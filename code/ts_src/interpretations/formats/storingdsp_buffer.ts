// need to test

// returned method results should begin with 'set', optionally followed by 'chan'|'samp', then followed by one or more numbers
// set by itself will write the following numbers as sample values to each channel referred to by the systemIndex, at the sample index indicated by the current letter index

export async function* format(source: AsyncIterable<(string | number)[]>) {
    this.log('set_interpretation', [],[`loaded buffer formatting`]);
    this.attrs.samples ??= this.maxLetters;
    this.attrs.channels ??= this.parameterSizes.reduce((a, v) => a + v, 0);
    this.data ??= Array(this.attrs.channels).fill(Buffer.alloc(this.attrs.samples * 4));
    this.channelGroups = [0];
    let channelIndex = 0;
    for (let cIndex = 1; cIndex < this.parameterSizes.length; cIndex++) {
        channelIndex += this.parameterSizes[cIndex];
        this.channelGroups.push(channelIndex);
    }
    for(let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    this.log('set_interpretation', [],[`begin buffer storing`]);
    for await (let methodResult of source) {
        if (!(methodResult?.[0] === 'set')) continue;
        for (let pIndex = 1; pIndex < methodResult.length; pIndex++) {
                let val = methodResult[pIndex];
                if (typeof val !== 'number') {
                    throw new Error(`invalid ${typeof val} value ${val}`);
                }
                let channelIndex = this.channelGroups[this.systemIndex] + pIndex;
                this.data[channelIndex].writeFloatLE(methodResult[pIndex], this.letterIndex * 4);
            }
        }
        this.log('set_interpretation', [],[`completed buffer storing`]);
        this.log('set_interpretation', [],[`begin buffer writing`]);
        for await (const index of this.data.keys()) {
            if(index%4) continue;
            let val = this.data.subarray(index, index+4);
            this.log('write_data', [], [val.readFloatLE(0), val.toString()]);
            yield val.toString();
        }
        this.log('set_interpretation', [],[`completed buffer writing`]);
    };
