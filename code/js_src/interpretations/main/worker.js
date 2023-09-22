import * as worker from "worker_threads";
import * as fs from 'fs';
import { pipeline } from 'stream';
import buildInterpreter from "./builder";
const data = worker.workerData;
const queue = {
    "paused": false,
    "file": 0,
    "index": 0,
    "messages": []
};
const interpretation = buildInterpreter(data);
const iterator = iterateSystems.bind(interpretation);
const filepaths = [data.interpretedFiles, data.systemFiles, data.attributeFiles].flat();
removeExisting();
worker.parentPort.on('message', enqueue);
function removeExisting() {
    if (!filepaths.length)
        worker.parentPort.postMessage("ready");
    else
        fs.rm(filepaths.pop(), { "force": true }, () => removeExisting());
}
;
function enqueue(msg) {
    interpretation.log('set_interpretation', [], [`received systems ${msg.map(s => s.id)}`]);
    queue.messages.push(msg);
    if (!queue.paused) {
        dequeue();
    }
}
function dequeue() {
    if (!queue.messages.length) {
        queue.paused = false;
    }
    else {
        if (data.systemFiles.length) {
            outputSystems(queue.messages.shift());
        }
        else {
            outputInterpreted(queue.messages.shift());
        }
    }
}
function outputSystems(dequeuedMsg) {
    interpretation.log('write_systems', dequeuedMsg, [data.systemFiles[0]]);
    fs.writeFile(data.systemFiles.shift(), JSON.stringify(Object.fromEntries(dequeuedMsg.map(s => [s.id, s]))), () => outputInterpreted(dequeuedMsg));
}
function outputInterpreted(dequeuedMsg) {
    queue.paused = true;
    interpretation.log('write_interpretation', dequeuedMsg, [data.interpretedFiles[queue.file], String(queue.file)]);
    interpretation.linkSystems = dequeuedMsg;
    FileData.newFile = !(queue.index);
    pipeline(iterator(...dequeuedMsg), fs.createWriteStream(data.interpretedFiles[queue.file], { "emitClose": true, "flags": "a+" }), () => outputAttributes());
}
function checkIfComplete() {
    interpretation.log('write_complete', [], [String(queue.index + 1), String(data.fileGroupSizes[queue.file]), String(queue.file + 1), String(data.fileGroupSizes.length)]);
    if (++queue.index === data.fileGroupSizes[queue.file]) {
        queue.index = 0;
        if (++queue.file === data.fileGroupSizes.length) {
            interpretation.log('write_complete', [], []);
            if (interpretation.debugger) {
                interpretation.debugger.end();
                interpretation.debugger.infoFile.once('close', () => process.exit(worker.threadId));
            }
            else {
                process.exit(worker.threadId);
            }
        }
    }
    queue.paused = false;
    dequeue();
}
function outputAttributes() {
    if (data.attributeFiles.length) {
        interpretation.log('write_attributes', [], [data.attributeFiles[0]]);
        fs.writeFile(data.attributeFiles.shift(), JSON.stringify(interpretation.attrs ?? { "empty": null }), () => checkIfComplete());
    }
    else {
        checkIfComplete();
    }
}
function* iterateSystems(...systems) {
    worker.parentPort.postMessage(`beginning iteration`);
    if (FileData.newFile) {
        FileData.resetAttrs(interpretation);
        yield* FileData.generateHeader();
    }
    while (this.letterIndex < this.maxLetters) {
        if (this?.sequenceSchema) {
            yield* sequenceMethod(this, systems);
        }
        if (this?.groupSchema) {
            yield* groupMethod(this, systems);
        }
        this.letterIndex++;
    }
    this.log('subroutine', [], [`completed iteration of ${this.maxLetters} letters`]);
}
function* sequenceMethod(tgt, systems) {
    for (let targetSystem of systems) {
        let letter = targetSystem.letters?.[tgt.letterIndex];
        let parameter = targetSystem.parameters?.[tgt.letterIndex];
        if (letter && parameter) {
            let activeMethods = tgt?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
            worker.parentPort.postMessage(`methods ${activeMethods.join(' ')}`);
            for (let methodID of activeMethods) {
                if (typeof tgt?.[methodID] === 'function') {
                    let methodResult = tgt[methodID].call(tgt, targetSystem, ...parameter);
                    let formatted = FileData.format(methodResult);
                    if (formatted !== null) {
                        yield formatted;
                    }
                }
            }
        }
    }
}
function* groupMethod(tgt, systems) {
    let word = systems.map(s => s.letters?.[tgt.letterIndex] ?? '').join('');
    let parameterVector = systems.map(s => s.parameters?.[tgt.letterIndex] ?? []);
    if (tgt.groupSchema === 'default') {
        tgt.log('apply_group_method', [], ['default', String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
        yield [word, parameterVector];
    }
    else {
        let activeMethods = this?.groupSchema?.[word] ?? [];
        for (let methodID of activeMethods) {
            if (typeof tgt?.[methodID] === 'function') {
                tgt.log('apply_group_method', [], [methodID, String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
                let methodResult = tgt[methodID].call(this, systems, ...parameterVector);
                let formatted = FileData.format(methodResult);
                if (formatted !== null) {
                    yield formatted;
                }
            }
        }
    }
}
const FileData = class {
    static attrs;
    static header;
    static output;
    static bytesize;
    static filesize;
    static offset;
    static newFile;
    static resetAttrs(tgt) {
        this.attrs = {};
        for (let attr in tgt.attrs) {
            if (attr in this.attrs) {
                this.attrs[attr] = tgt.attrs[attr];
            }
        }
        this.attrs.type ??= "FL64";
        let typeIndex = ["CHAR", "LONG", "FL32", "FL64"].indexOf(this.attrs.type);
        if (typeIndex < 0) {
            throw new Error(`invalid matrix type ${this.attrs.type}`);
        }
        ;
        this.attrs.dim ??= [tgt.maxLetters, tgt.wordLengths.length];
        this.attrs.planecount ??= Math.max(...tgt.parameterSizes);
        this.attrs.dimcount = this.attrs.dim.length;
        this.bytesize = [1, 4, 4, 8][typeIndex];
        this.output = Buffer.alloc(this.bytesize * this.attrs.planecount, 0);
        this.offset = this.attrs.dimcount * 4 + 48;
        this.filesize = this.offset + this.attrs.planecount * this.bytesize * this.attrs.dim.reduce((a, v) => a + v, 0);
        for (let attr in this.attrs) {
            worker.parentPort.postMessage(`attr: ${attr} = ${this.attrs[attr]}`);
        }
        tgt.attrs = this.attrs;
    }
    ;
    static *generateHeader() {
        this.header = Buffer.alloc(4, 0);
        yield "FORM";
        this.header.writeUInt32BE(this.filesize, 0);
        worker.parentPort.postMessage(`yielding filesize ${this.filesize}: ${this.header.toString()}`);
        yield this.header.toString();
        yield "JIT!";
        yield "FVER";
        this.header.writeUInt32BE(12, 0);
        yield this.header.toString();
        this.header.writeUInt32BE(1016323200, 0);
        this.header.writeUInt32BE(0, 0);
        yield this.header.toString();
        yield "MTRX";
        this.header.writeUInt32BE(this.filesize - 24, 0);
        yield this.header.toString();
        this.header.writeUInt32BE(this.offset - 24, 0);
        yield this.header.toString();
        yield this.attrs.type;
        this.header.writeUInt32BE(this.attrs.planecount, 0);
        yield this.header.toString();
        this.header.writeUInt32BE(this.attrs.dim.length, 0);
        yield this.header.toString();
        for (let dim of this.attrs.dim) {
            this.header.writeUInt32BE(dim, 0);
            yield this.header.toString();
        }
    }
    static format(methodResult) {
        let vals = methodResult.filter(r => typeof r === 'number');
        if (vals.length !== this.attrs.planecount) {
            worker.parentPort.postMessage(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
            throw new Error(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
        }
        ;
        let index = 0;
        for (let val of vals) {
            if (this.attrs.type === "CHAR")
                this.output.writeUInt8(val, index);
            else if (this.attrs.type === "FL32")
                this.output.writeFloatBE(val, index * 4);
            else if (this.attrs.type === "LONG")
                this.output.writeUInt32BE(val, index * 4);
            else
                this.output.writeDoubleBE(val, index * 8);
            index++;
        }
        ;
        let result = this.output.toString();
        return result;
    }
};
