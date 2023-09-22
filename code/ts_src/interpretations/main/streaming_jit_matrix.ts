import * as worker from "worker_threads";
import {  InterpreterWorkerData } from "../../definitions/classes/interpretation";
import * as fs from 'fs';
import { pipeline } from 'stream';
import { SystemClass } from "../../definitions/classes/system";
import  buildInterpreter  from "./builder";
import  Interpreter  from "./class";
//import iterateSystems from './iterator';
const data = worker.workerData as InterpreterWorkerData;
const queue = { "paused": false, "file": 0, "index": 0, "messages": [] };
const interpretation = buildInterpreter(data);
const iterator = iterateSystems.bind(interpretation);

const formatter = format.bind(interpretation);
const filepaths = [data.interpretedFiles, data.systemFiles, data.attributeFiles].flat();
const attrs = {
    "type": "FL64",
    "dim": [1],
    "dimcount": 1,
    "planecount": 1
}
const buf = {
    "header": Buffer.from([70, 79, 82, 77, 0, 0, 0, 0, 74, 73, 84, 33, 70, 86, 69, 82, 0, 0, 0, 12, 60, 147, 220, 128, 77, 84, 82, 88, 0, 0, 0, 0, 0, 0, 0, 0, 70, 76, 54, 52, 0, 0, 0, 0, 0, 0, 0, 0]),
    "dims": Buffer.alloc(4,0),
    "data": Buffer.alloc(4,0)
}
const props = {
    "bytesize": 1,
    "filesize": 1,
    "offset": 0
}
buf.header.write("FORM");
buf.header.write("JIT!", 8);
buf.header.write("FVER", 12);
buf.header.writeUInt32BE(12, 16);
buf.header.writeUInt32BE(1016323200, 20); // version code?? timestamp??
buf.header.write("MTRX", 24);

removeExisting();
worker.parentPort.on('message', enqueue);

function removeExisting() {
    
    if(!filepaths.length) worker.parentPort.postMessage("ready");
    else fs.rm(filepaths.pop(), {"force": true}, () => removeExisting());
};
function enqueue(msg: SystemClass[]) {
    interpretation.log('set_interpretation', [],[`received systems ${msg.map(s => s.id)}`]);
    queue.messages.push(msg);
    if(!queue.paused) {
       dequeue();
    }
}
function dequeue() {
    if(!queue.messages.length) {
        queue.paused  = false;
    }
    else {
        if(data.systemFiles.length) {
            outputSystems(queue.messages.shift());   
        }
        else {
            outputInterpreted(queue.messages.shift());   
        }
    }
}
function outputSystems(dequeuedMsg: SystemClass[]) {
    //worker.parentPort.postMessage(`logging system ${data.systemFiles[0]}`);
    interpretation.log('write_systems', dequeuedMsg, [data.systemFiles[0]]);
    fs.writeFile(data.systemFiles.shift(), JSON.stringify(Object.fromEntries(dequeuedMsg.map(s => [s.id, s]))), () => outputInterpreted(dequeuedMsg));
}
function outputInterpreted(dequeuedMsg: SystemClass[]) {
    queue.paused = true;
    interpretation.log('write_interpretation',dequeuedMsg, [data.interpretedFiles[queue.file], String(queue.file)]);
    interpretation.linkSystems = dequeuedMsg; 
    pipeline(iterator(...dequeuedMsg), formatter, fs.createWriteStream(data.interpretedFiles[queue.file]), () => outputAttributes());

    //worker.parentPort.postMessage(`creating new file ${data.interpretedFiles[queue.file]}`);
    //pipeline(iterator(...dequeuedMsg), formatter, fs.createWriteStream(data.interpretedFiles[queue.file], {"flags": "a+"}), () => outputAttributes());
}    

function checkIfComplete() {
    interpretation.log('write_complete', [], [String(queue.index+1), String(data.fileGroupSizes[queue.file]),String(queue.file+1), String(data.fileGroupSizes.length)]);
    if(++queue.index === data.fileGroupSizes[queue.file]) {
        queue.index = 0;
        if(++queue.file === data.fileGroupSizes.length) {
        interpretation.log('write_complete', [],[]);
        if(interpretation.debugger) {
            interpretation.debugger.end();
            interpretation.debugger.infoFile.once('close', () => process.exit(worker.threadId));
        }
        else {
            process.exit(worker.threadId)
        }
        }
    }
    queue.paused  = false;
    dequeue();
}

function outputAttributes() {
    if(data.attributeFiles.length) {
        interpretation.log('write_attributes',[],[data.attributeFiles[0]]);
        //worker.parentPort.postMessage(`logging attributes ${data.attributeFiles[0]}`);
        fs.writeFile(data.attributeFiles.shift(), JSON.stringify(interpretation.attrs ?? {"empty": null}), () => checkIfComplete());
    }
    else {
        checkIfComplete();
    }
}
function resetAttributes(tgt: Interpreter) {
    if(typeof tgt.attrs?.type === "string") {
        attrs.type =  tgt.attrs?.type;
    }
    else {
        attrs.type = "FL64";
    }
    let typeIndex = ["CHAR", "LONG", "FL32", "FL64"].indexOf(attrs.type);
    if (typeIndex < 0) {
        throw new Error(`invalid matrix type ${this.attrs.type}`);
    };
    if(Array.isArray(tgt.attrs?.dim)) {
        attrs.dim = tgt.attrs?.dim;
    }
    else {
        attrs.dim = [tgt.maxLetters, tgt.wordLengths.length];
    }
    attrs.dimcount = attrs.dim.length;
    if(typeof tgt.attrs?.planecount === "number") {
        attrs.planecount = tgt.attrs?.planecount;
    }
    else {
        attrs.planecount =  Math.max(...tgt.parameterSizes)
    }
    props.bytesize = [1, 4, 4, 8][typeIndex];
    props.offset = attrs.dimcount * 4 + 48;
    props.filesize = props.offset + attrs.planecount * props.bytesize  * attrs.dim.reduce((a, v) => a + v, 0);
    for (let attr in attrs) {
        this.log('set_attributes', [], [attr, String(attrs[attr])]);
    }
    this.log('set_interpretation', [], [`begin matrix header streaming`]);
}

function resetBuffers() {
    
    buf.header.writeUInt32BE(props.filesize, 4); // filesize
    buf.header.writeUInt32BE(props.filesize - 24, 28); // chunksize
    buf.header.writeUInt32BE(props.offset - 24, 32); // bytes before matrix data
    buf.header.write(this.type, 36); // type code
    buf.header.writeUInt32BE(attrs.planecount, 40); // planecount
    buf.header.writeUInt32BE(attrs.dim.length, 44); // dimcount 

    buf.dims = Buffer.alloc(attrs.dimcount*4, 0);
    
    for(let i=0;i<attrs.dimcount;i++){
        buf.dims.writeUInt32BE(attrs.dim[i], i*4);
    }
}

function* iterateSystems(...systems: SystemClass[]) { // implementation specific iteration


    while (this.letterIndex < this.maxLetters) {
        if (this?.sequenceSchema) {
            this.log('subroutine', [], [`beginning sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            for (let targetSystem of systems) {
                this.log('subroutine', [], [`applying methods to system ${targetSystem}`]);
                let letter = targetSystem.letters?.[this.letterIndex];
                let parameter = targetSystem.parameters?.[this.letterIndex];
                if (letter && parameter) {
                        let activeMethods: string[] = this?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                        this.log('subroutine', [], [`calling methods ${activeMethods.join(' ')} for letter ${letter} and parameter ${parameter}`]);
                        for (let methodID of activeMethods) {
                            if (typeof this?.[methodID] === 'function') {
                                let methodResult = this[methodID].call(this, targetSystem, ...parameter);

                                yield this[methodID].call(this, targetSystem, ...parameter);
                        }
                    }
                }
            }
            this.log('subroutine', [], [`completed sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        if (this?.groupSchema) {
            this.log('subroutine', [], [`beginning group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            yield* groupMethod(this, systems);
            this.log('subroutine', [], [`completed group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        this.letterIndex++;
    }
    this.log('subroutine', [], [`completed iteration of ${this.maxLetters} letters`]);
}
    
function* sequenceMethod(tgt: Interpreter, systems: SystemClass[]) {
            for (let targetSystem of systems) {
                this.log('subroutine', [], [`applying methods to system ${targetSystem}`]);
                let letter = targetSystem.letters?.[tgt.letterIndex];
                let parameter = targetSystem.parameters?.[tgt.letterIndex];
                if (letter && parameter) {
                        let activeMethods: string[] = tgt?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                        this.log('subroutine', [], [`calling methods ${activeMethods.join(' ')} for letter ${letter} and parameter ${parameter}`]);
                        for (let methodID of activeMethods) {
                            if (typeof tgt?.[methodID] === 'function') {
                                yield tgt[methodID].call(tgt, targetSystem, ...parameter);
                        }
                    }
                }
            }
        }
    
function* groupMethod(tgt: Interpreter, systems: SystemClass[]) { 
            let word = systems.map(s => s.letters?.[tgt.letterIndex] ?? '').join('');
            let parameterVector = systems.map(s => s.parameters?.[tgt.letterIndex] ?? []);
            if (tgt.groupSchema === 'default') {
                tgt.log('apply_group_method', [], 
                ['default',String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
       
                yield [word, parameterVector];
            }
            else {
                let activeMethods: string[] = this?.groupSchema?.[word] ?? [];
                for (let methodID of activeMethods) {
                    if (typeof tgt?.[methodID] === 'function') {
                        tgt.log('apply_group_method', [], 
                        [methodID,String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
               
                        yield tgt[methodID].call(this, systems, ...parameterVector);
                    }
                }
            }
        }
class JitMatrix {

    constructor(src: Interpreter) {



    }

}

async function* format(source: AsyncIterable<number[]>) {
            this.log('set_interpretation', [], [`loaded buffer formatting`]);
            
            this.attrs.type ??= "FL64";
            this.typeIndex = ["CHAR", "LONG", "FL32", "FL64"].indexOf(this.attrs.type);
            if (this.typeIndex < 0) {
                throw new Error(`invalid matrix type ${this.attrs.type}`);
            };
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
            this.headerBuf.writeUInt32BE(this.filesize, 4); // filesize
            this.headerBuf.write("JIT!", 8);
            this.headerBuf.write("FVER", 12);
            this.headerBuf.writeUInt32BE(12, 16);
            this.headerBuf.writeUInt32BE(1016323200, 20); // version code?? timestamp??
            this.headerBuf.write("MTRX", 24);
            this.headerBuf.writeUInt32BE(this.filesize - 24, 28); // chunksize
            this.headerBuf.writeUInt32BE(this.offset - 24, 32); // bytes before matrix data
            this.headerBuf.write(this.type, 36); // type code
            this.headerBuf.writeUInt32BE(this.attrs.planecount, 40); // planecount
            this.headerBuf.writeUInt32BE(this.attrs.dim.length, 44); // dimcount 
            this.attrs.dim.forEach((dim, index) => this.headerBuf.writeUInt32BE(dim, 48 + index * 4));
            this.log('set_interpretation', [], [`begin matrix data streaming`]);
            for await (const methodResult of source) {
                worker.parentPort.postMessage(`set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
                if (!Array.isArray(methodResult)) continue;
                let vals = methodResult.filter(r => typeof r === 'number');
                if (vals.length !== this.attrs.planecount) {
                    worker.parentPort.postMessage(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
                    throw new Error(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
                };
                let result;
                let index = 0;
                for (let val of vals) {
                    if(this.attrs.type ==="CHAR") this.data.writeUInt8(val, index);
                    else if(this.attrs.type ==="FL32") this.data.writeFloatBE(val,index*4);
                    else if(this.attrs.type ==="LONG") this.data.writeUInt32BE(val,index*4);
                    else this.data.writeDoubleBE(val,index*8);
                    index++;
                    //this.log('write_data', [], [`${vals.join(' ')}: `, `${this.data.toString()}`]);
                }
                if(this?.buf) {
                    result = this.headerBuf.toString('utf8')+this.data.toString('utf8');
                    delete this.headerBuf;
                } 
                else {
                    result = this.data.toString('utf8');
                }
                this.log('subroutine', `yielding data ${result}`);
                yield result;
            }
            this.log('set_interpretation', [], [`completed buffer streaming`]);
        }
        