import * as worker from "worker_threads";
import {  InterpreterWorkerData } from "../../definitions/classes/interpretation";
import * as fs from 'fs';
import { pipeline } from 'stream';
import { SystemClass } from "../../definitions/classes/system";
import  buildInterpreter  from "./builder";
//import  Interpreter  from "./class";
import iterateSystems from './iterator';
const data = worker.workerData as InterpreterWorkerData;
const queue = { "paused": false, "file": 0, "index": 0, "messages": [] };
const interpretation = buildInterpreter(data);
const iterator = iterateSystems.bind(interpretation);

const formatter = (require(data.formatPath).format).bind(interpretation);
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
