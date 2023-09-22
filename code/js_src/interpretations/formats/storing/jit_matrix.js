import * as worker from "worker_threads";
export const FileFormatter = class {
    static attrs;
    static header = Buffer.from([
        70, 79, 82, 77,
        0, 0, 0, 0,
        74, 73, 84, 33,
        70, 86, 69, 82,
        0, 0, 0, 12,
        60, 147, 220, 128,
        77, 84, 82, 88
    ]);
    static data;
    static index;
    static bytesize;
    static filesize;
    static offset;
    static newFile;
    static resetAttrs(tgt) {
        this.attrs = {
            "dim": tgt.wordLengths,
            "dimcount": tgt.wordLengths.length,
            "planecount": Math.max(...tgt.parameterSizes)
        };
        if (tgt.attrs?.type === "CHAR") {
            this.attrs.type = "CHAR";
            this.bytesize = 1;
        }
        else if (tgt.attrs?.type === "LONG") {
            this.attrs.type = "LONG";
            this.bytesize = 4;
        }
        else if (tgt.attrs?.type === "FL32") {
            this.attrs.type = "FL32";
            this.bytesize = 4;
        }
        else {
            this.attrs.type = "FL64";
            this.bytesize = 8;
        }
        tgt.attrs = this.attrs;
        this.offset = this.attrs.dimcount * 4 + 48;
        this.filesize = this.offset + this.attrs.planecount * this.bytesize * this.attrs.dim.reduce((a, v) => a + v, 0);
    }
    static resetBuffer() {
        this.index = 0;
        this.data = Buffer.alloc(this.filesize, 0);
        this.header.copy(this.data);
        this.index += 4;
        this.data.writeUInt32BE(this.filesize, this.index);
        this.index += 24;
        this.data.writeUInt32BE(this.filesize - 24, this.index);
        this.index += 4;
        this.data.writeUInt32BE(this.offset - 24, this.index);
        this.index += 4;
        this.data.write(this.attrs.type, this.index, 'utf8');
        this.index += 4;
        this.data.writeUInt32BE(this.attrs.planecount, this.index);
        this.index += 4;
        this.data.writeUInt32BE(this.attrs.dim.length, this.index);
        this.index += 4;
        for (let dim of this.attrs.dim) {
            this.data.writeUInt32BE(dim, this.index);
            this.index += 4;
        }
    }
    static format(methodResult) {
        let vals = methodResult.filter(v => typeof v === 'number');
        for (let val of vals) {
            if (this.attrs.type === "CHAR")
                this.data.writeUInt8(val, this.index);
            else if (this.attrs.type === "FL32")
                this.data.writeFloatBE(val, this.index);
            else if (this.attrs.type === "LONG")
                this.data.writeUInt32BE(val, this.index);
            else
                this.data.writeDoubleBE(val, this.index);
            if (this.index < 100) {
                worker.parentPort.postMessage(`wrote value ${val} of type ${this.attrs.type} at ${this.index}`);
            }
            this.index += this.bytesize;
        }
        ;
    }
};
