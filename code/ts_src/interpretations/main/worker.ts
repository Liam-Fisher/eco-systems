import * as worker from "worker_threads";
import {  InterpreterWorkerData } from "../../definitions/classes/interpretation";
import * as fs from 'fs';
import { pipeline } from 'stream';
import { SystemClass } from "../../definitions/classes/system";
import  buildInterpreter  from "./builder";
import  Interpreter  from "./class";
//import iterateSystems from './iterator';
interface Queue {
    paused: boolean
    file: number
    index: number
    messages: SystemClass[][]
}
const data = worker.workerData as InterpreterWorkerData;
const queue: Queue = { 
    "paused": false, 
    "file": 0, 
    "index": 0, 
    "messages": []
};
const interpretation = buildInterpreter(data);
const iterator = iterateSystems.bind(interpretation);
// const Data = (require(data.formatPath).Data);


const filepaths = [data.interpretedFiles, data.systemFiles, data.attributeFiles].flat();
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
    interpretation.log('write_systems', dequeuedMsg, [data.systemFiles[0]]);
    fs.writeFile(data.systemFiles.shift(), JSON.stringify(Object.fromEntries(dequeuedMsg.map(s => [s.id, s]))), () => outputInterpreted(dequeuedMsg));
}

function outputInterpreted(dequeuedMsg: SystemClass[]) {
    queue.paused = true;
    interpretation.log('write_interpretation',dequeuedMsg, [data.interpretedFiles[queue.file], String(queue.file)]);
    interpretation.linkSystems = dequeuedMsg; 
    FileData.newFile = !(queue.index);
    pipeline(iterator(...dequeuedMsg), fs.createWriteStream(data.interpretedFiles[queue.file], {"emitClose": true, "flags": "a+"}), () => outputAttributes());
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
    queue.paused = false;
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

function* iterateSystems(...systems: SystemClass[]) { // implementation specific iteration
    worker.parentPort.postMessage(`beginning iteration`);
    if(FileData.newFile) {
        FileData.resetAttrs(interpretation);
        yield* FileData.generateHeader();
    }
    while (this.letterIndex < this.maxLetters) {
        //worker.parentPort.postMessage(`iteration ${this.letterIndex} of ${this.maxLetters} letters`);
        if (this?.sequenceSchema) {
            //this.log('subroutine', [], [`beginning sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            yield* sequenceMethod(this, systems);
            //this.log('subroutine', [], [`completed sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        if (this?.groupSchema) {
            //this.log('subroutine', [], [`beginning group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            yield* groupMethod(this, systems);
            //this.log('subroutine', [], [`completed group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        this.letterIndex++;
    }
    this.log('subroutine', [], [`completed iteration of ${this.maxLetters} letters`]);
}
    
function* sequenceMethod(tgt: Interpreter, systems: SystemClass[]) {
            for (let targetSystem of systems) {
                //worker.parentPort.postMessage(`(sequence) system ${targetSystem.id} letters`);
                let letter = targetSystem.letters?.[tgt.letterIndex];
                let parameter = targetSystem.parameters?.[tgt.letterIndex];
                //worker.parentPort.postMessage(`letter ${letter} parameters ${parameter}`);
                if (letter && parameter) {
                        let activeMethods: string[] = tgt?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                        worker.parentPort.postMessage(`methods ${activeMethods.join(' ')}`);
                        for (let methodID of activeMethods) {
                            if (typeof tgt?.[methodID] === 'function') {
                                let methodResult = tgt[methodID].call(tgt, targetSystem, ...parameter);
                                //worker.parentPort.postMessage(`methodResult ${activeMethods.join(' ')}`);
                                let formatted = FileData.format(methodResult);
                                //worker.parentPort.postMessage(`formatted ${typeof formatted} ${formatted}`);
                                if(formatted !== null){
                                    yield formatted;
                                }
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
                        let methodResult =  tgt[methodID].call(this, systems, ...parameterVector);
                        let formatted = FileData.format(methodResult);
                                if(formatted !== null){
                                    yield formatted;
                                }
                    }
                }
            }
}

const FileData = class {
    static attrs: {
        type?: "CHAR"|"LONG"|"FL32"|"FL64"
        planecount?: number
        dimcount?: number
        dim?: number[]
    }
    static header: Buffer // Buffer.from([70, 79, 82, 77, 0, 0, 0, 0, 74, 73, 84, 33, 70, 86, 69, 82, 0, 0, 0, 12, 60, 147, 220, 128, 77, 84, 82, 88, 0, 0, 0, 0, 0, 0, 0, 0, 70, 76, 54, 52, 0, 0, 0, 0, 0, 0, 0, 0])
    static output: Buffer 
    static bytesize: number
    static filesize: number
    static offset: number
    static newFile: boolean
    static resetAttrs(tgt: Interpreter) {
        this.attrs = {};
        for(let attr in tgt.attrs)  {
            if(attr in this.attrs) {
                this.attrs[attr] =  tgt.attrs[attr];
            }
        }
        this.attrs.type ??= "FL64";
        let typeIndex = ["CHAR", "LONG", "FL32", "FL64"].indexOf(this.attrs.type);
        if (typeIndex < 0) {
            throw new Error(`invalid matrix type ${this.attrs.type}`);
        };
        this.attrs.dim ??= [tgt.maxLetters, tgt.wordLengths.length];
        this.attrs.planecount ??= Math.max(...tgt.parameterSizes);
        this.attrs.dimcount = this.attrs.dim.length;
        this.bytesize = [1, 4, 4, 8][typeIndex];
        this.output = Buffer.alloc(this.bytesize*this.attrs.planecount, 0);
        this.offset = this.attrs.dimcount * 4 + 48;
        this.filesize = this.offset + this.attrs.planecount * this.bytesize * this.attrs.dim.reduce((a, v) => a + v, 0);
        for(let attr in this.attrs)  {
            worker.parentPort.postMessage(`attr: ${attr} = ${this.attrs[attr]}`);
        }
        tgt.attrs = this.attrs;
    };
    static *generateHeader() {
        this.header = Buffer.alloc(4,0);
        yield "FORM";
        this.header.writeUInt32BE(this.filesize, 0); // filesize
        worker.parentPort.postMessage(`yielding filesize ${this.filesize}: ${this.header.toString()}`);
        yield this.header.toString();
        yield "JIT!";
        yield "FVER";
        this.header.writeUInt32BE(12, 0);
        yield this.header.toString();
        //this.header.writeUInt8(60, 0);
        //this.header.writeUInt8(147, 1);
        //this.header.writeUInt8(220, 2);
        this.header.writeUInt32BE(1016323200, 0);
        this.header.writeUInt32BE(0, 0);
        yield this.header.toString();
        //yield String.fromCodePoint(60,147,220,128);
        yield "MTRX";
        this.header.writeUInt32BE(this.filesize-24, 0);
        yield this.header.toString();
        this.header.writeUInt32BE(this.offset-24, 0);
        yield this.header.toString();
        yield this.attrs.type;
        this.header.writeUInt32BE(this.attrs.planecount, 0);
        yield this.header.toString();
        this.header.writeUInt32BE(this.attrs.dim.length, 0);
        yield this.header.toString();
        for(let dim of this.attrs.dim) {
            this.header.writeUInt32BE(dim, 0);
            yield this.header.toString();
        }
    }
    static format(methodResult: (number|string)[]) {
        let vals: number[] = methodResult.filter(r => typeof r === 'number') as number[];
        if (vals.length !== this.attrs.planecount) {
            worker.parentPort.postMessage(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
            throw new Error(`invalid set values ${methodResult.join(' ')} for matrix with planecount = ${this.attrs.planecount}`);
        };
        let index = 0;
        for (let val of vals) {
            if(this.attrs.type ==="CHAR") this.output.writeUInt8(val, index);
            else if(this.attrs.type ==="FL32") this.output.writeFloatBE(val,index*4);
            else if(this.attrs.type ==="LONG") this.output.writeUInt32BE(val,index*4);
            else this.output.writeDoubleBE(val,index*8);
            index++;
        };
        let result = this.output.toString();
        //worker.parentPort.postMessage(`formatted ${result}`);
        return result;
    }
}
