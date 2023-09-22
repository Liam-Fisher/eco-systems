import * as worker from "worker_threads";
import * as fs from 'fs';
import buildInterpreter from "./builder";
const workerProps = worker.workerData;
const queue = {
    "paused": false,
    "file": 0,
    "index": 0,
    "messages": []
};
const interpretation = buildInterpreter(workerProps);
const Data = (require(workerProps.formatPath).FileFormatter);
const filepaths = [workerProps.interpretedFiles, workerProps.systemFiles, workerProps.attributeFiles].flat();
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
    worker.parentPort.postMessage(`received systems ${msg.map(s => s.id)} with lengths ${msg.map(s => s.letters.length).join(' ')}`);
    interpretation.log('set_interpretation', [], [`received systems ${msg.map(s => s.id)} `]);
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
        if (workerProps.systemFiles.length) {
            outputSystems(queue.messages.shift());
        }
        else {
            outputInterpreted(queue.messages.shift());
        }
    }
}
function outputSystems(dequeuedMsg) {
    interpretation.log('write_systems', dequeuedMsg, [workerProps.systemFiles[0]]);
    fs.writeFile(workerProps.systemFiles.shift(), JSON.stringify(Object.fromEntries(dequeuedMsg.map(s => [s.id, s]))), () => outputInterpreted(dequeuedMsg));
}
function outputInterpreted(systems) {
    queue.paused = true;
    interpretation.log('write_interpretation', systems, [workerProps.interpretedFiles[queue.file], String(queue.file)]);
    interpretation.linkSystems = systems;
    worker.parentPort.postMessage(`beginning iteration`);
    Data.resetAttrs(interpretation);
    worker.parentPort.postMessage(`bytesize: ${Data.bytesize}`);
    worker.parentPort.postMessage(`offset: ${Data.offset}`);
    worker.parentPort.postMessage(`filesize: ${Data.filesize}`);
    for (let attr in Data.attrs) {
        interpretation.log('set_attributes', [], [attr, Data.attrs[attr]]);
    }
    Data.resetBuffer(interpretation);
    while (interpretation.letterIndex < interpretation.maxLetters) {
        if (interpretation?.sequenceSchema) {
            for (let targetSystem of systems) {
                let letter = targetSystem.letters?.[interpretation.letterIndex];
                let parameter = targetSystem.parameters?.[interpretation.letterIndex];
                if (letter && parameter) {
                    let activeMethods = interpretation?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                    for (let methodID of activeMethods) {
                        let result = interpretation[methodID].call(interpretation, targetSystem, ...parameter);
                        if (result) {
                            Data.format(result);
                        }
                    }
                }
            }
        }
        interpretation.letterIndex++;
    }
    fs.writeFile(workerProps.interpretedFiles[queue.file], Data.data, () => outputAttributes());
}
function outputAttributes() {
    if (workerProps.attributeFiles.length) {
        interpretation.log('write_attributes', [], [workerProps.attributeFiles[0]]);
        fs.writeFile(workerProps.attributeFiles.shift(), JSON.stringify(interpretation.attrs ?? { "empty": null }), () => checkIfComplete());
    }
    else {
        checkIfComplete();
    }
}
function checkIfComplete() {
    interpretation.log('write_complete', [], [String(queue.index + 1), String(workerProps.fileGroupSizes[queue.file]), String(queue.file + 1), String(workerProps.fileGroupSizes.length)]);
    if (++queue.index === workerProps.fileGroupSizes[queue.file]) {
        queue.index = 0;
        if (++queue.file === workerProps.fileGroupSizes.length) {
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
