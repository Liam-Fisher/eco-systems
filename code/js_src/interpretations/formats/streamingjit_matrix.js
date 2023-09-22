"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const worker = require("worker_threads");
async function* format(source) {
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
    this.log('set_interpretation', [], [`begin matrix header streaming`]);
    this.dataBuf = Buffer.alloc(this.bytesize, 0);
    this.headerBuf = Buffer.alloc(this.offset, 0);
    this.headerBuf.write("FORM");
    this.headerBuf.writeUInt32BE(this.filesize, 4);
    this.headerBuf.write("JIT!", 8);
    this.headerBuf.write("FVER", 12);
    this.headerBuf.writeUInt32BE(12, 16);
    this.headerBuf.writeUInt32BE(1016323200, 20);
    this.headerBuf.write("MTRX", 24);
    this.headerBuf.writeUInt32BE(this.filesize - 24, 28);
    this.headerBuf.writeUInt32BE(this.offset - 24, 32);
    this.headerBuf.write(this.attrs.type, 36);
    this.headerBuf.writeUInt32BE(this.attrs.planecount, 40);
    this.headerBuf.writeUInt32BE(this.attrs.dim.length, 44);
    this.attrs.dim.forEach((dim, index) => this.headerBuf.writeUInt32BE(dim, 48 + index * 4));
    worker.parentPort.postMessage(`header written`);
    for await (const methodResult of source) {
        let vals = methodResult.filter(r => typeof r === 'number');
        if (vals.length !== this.attrs.planecount) {
            worker.parentPort.postMessage(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
            throw new Error(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
        }
        ;
        let result;
        let index = 0;
        for (let val of vals) {
            if (this.attrs.type === "CHAR")
                this.data.writeUInt8(val, index);
            else if (this.attrs.type === "FL32")
                this.data.writeFloatBE(val, index * 4);
            else if (this.attrs.type === "LONG")
                this.data.writeUInt32BE(val, index * 4);
            else
                this.data.writeDoubleBE(val, index * 8);
            index++;
        }
        ;
        if (this?.headerBuf) {
            result = this.headerBuf.toString('utf8') + this.data.toString('utf8');
            delete this.headerBuf;
        }
        else {
            result = this.data.toString('utf8');
        }
        yield result;
    }
    this.log('set_interpretation', [], [`completed buffer streaming`]);
}
exports.format = format;
