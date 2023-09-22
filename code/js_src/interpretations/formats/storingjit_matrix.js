export async function* format(source) {
    const bufTypes = ["UInt8", "UInt32BE", "FloatBE", "DoubleBE"];
    this.log('set_interpretation', [], [`loaded buffer formatting`]);
    this.attrs.type ??= "FL64";
    this.typeIndex = ["CHAR", "LONG", "FL32", "FL64"].indexOf(this.attrs.type);
    if (this.typeIndex < 0) {
        throw new Error(`invalid matrix type ${this.attrs.type}`);
    }
    ;
    this.attrs.dim ??= [this.maxLetters, this.wordLengths.length];
    this.attrs.planecount ??= Math.max(...this.parameterSizes);
    this.attrs.dimcount = this.attrs.dim.length;
    this.bytesize = [1, 4, 4, 8][this.typeIndex];
    this.offset = this.attrs.dimcount * 4 + 48;
    this.filesize = this.offset + this.attrs.planecount * this.bytesize * this.attrs.dim.reduce((a, v) => a + v, 0);
    for (let attr in this.attrs) {
        this.log('set_attributes', [], [attr, String(this.attrs[attr])]);
    }
    this.log('set_interpretation', [], [`begin matrix storing`]);
    this.data = Buffer.alloc(this.filesize, 0);
    this.data.write("FORM");
    this.data.writeUInt32BE(this.filesize, 4);
    this.data.write("JIT!", 8);
    this.data.write("FVER", 12);
    this.data.writeUInt32BE(12, 16);
    this.data.writeUInt32BE(1016323200, 20);
    this.data.write("MTRX", 24);
    this.data.writeUInt32BE(this.filesize - 24, 28);
    this.data.writeUInt32BE(this.offset - 24, 32);
    this.data.write(this.attrs.type, 36);
    this.data.writeUInt32BE(this.attrs.planecount, 40);
    this.data.writeUInt32BE(this.attrs.dim.length, 44);
    this.attrs.dim.forEach((d, i) => this.data.writeUInt32BE(d, 48 + i * 4));
    for await (let methodResult of source) {
        if (!(Array.isArray(methodResult[0]) && Array.isArray(methodResult[1])))
            continue;
        if (methodResult[0].length !== this.attrs.dimcount) {
            throw new Error(`invalid set values ${methodResult[0].join(' ')} for matrix with dimcount = ${this.attrs.dimcount}`);
        }
        let targetWidth = this.attrs.planecount * this.bytesize;
        let targetIndex = this.offset;
        for (let dimIndex = 0; dimIndex < this.attrs.dimcount; dimIndex++) {
            targetIndex += targetWidth * methodResult[0][dimIndex];
            targetWidth *= this.attrs.dim[dimIndex];
        }
        this.log('set_data', [], [`targets:${methodResult[0].join(' ')}`, `index: ${targetIndex}`]);
        for (let planeIndex = 0; planeIndex < this.attrs.planecount; planeIndex++) {
            let offset = targetIndex + this.bytesize * planeIndex;
            let value = methodResult[1][planeIndex] ?? 0;
            if (this.type === "CHAR")
                this.data.writeUInt8(value, offset);
            else if (this.type === "FL32")
                this.data.writeFloatBE(value, offset);
            else if (this.type === "LONG")
                this.data.writeUInt32BE(value, offset);
            else
                this.data.writeDoubleBE(value, offset);
        }
    }
    ;
    this.log('set_interpretation', [], [`completed buffer storing`]);
    this.log('set_interpretation', [], [`begin buffer writing of ${this.data.length}`]);
    for await (const index of this.data.keys()) {
        let mod = (index < this.offset) ? 4 : this.bytecount;
        if (index % mod)
            continue;
        let val = this.data.subarray(index, index + mod);
        this.log('write_data', [], [val[`read${bufTypes[this.typeIndex]}`](0), `index ${index}: ${val.toString()}`]);
        yield val;
    }
    this.log('set_interpretation', [], [`completed buffer writing`]);
}
