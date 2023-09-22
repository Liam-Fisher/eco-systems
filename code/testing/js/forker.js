"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker = require("worker_threads");
const {cwd, exit} = require("process");
const {writeFile } = require('fs');
let dir = cwd();
console.log(`dir: ${dir}`);

/*
const testInfo = [{
    "experiment": './testEx.js',
    "patcher": './testLo.js',
}];
const testBP = {
    "attrs": {
        "precision": 5
    },
    "filename": "turtleSketchTest",
    "format": "coll",
    "schedule": [[3]],
    "systems": ["systemA"]
};
const testTP = {
    "attrs": {
        "precision": 4
    },
    "mode": "streaming",
    "props": {
        "stepSize": 0.01,
        "turnIncrement": 0.25,
        "x_position": 0,
        "y_position": 0,
        "direction": 0
    }
};
const Interpretation = class {
    static threads = new Map();
    static workers = new Map();
    static schedule = new Map();
    static systems = new Map();
    static async create(ID, BP, info) {
        BP.schedule.forEach((file) => {
            file.forEach((msgTime) => {
                this.schedule.set(msgTime, [ID, ...(this.schedule.get(msgTime) ?? [])]);
            });
        });
        //let resolve;
        //let promise = new Promise(r => resolve = r);
        //let loaded = { promise, resolve };
        //const {port1, port2} = new worker.MessageChannel();
        let interpreter = (new worker.Worker('../code/testing/js/work.js', (await workerData(BP, testTP, [info])))).on('online', () => {
            console.log(`worker on thread ${ID} online`);
        }).on('exit', (workerID) => {
            console.log(`worker on thread ${workerID} exited`);
            //this.remove(workerID);
        }).on('message', (msg) => console.log(`worker ${ID} messaged ${msg}`));
        this.threads.set(interpreter.threadId, ID);
        //this.ports.set(ID, port1);
        this.workers.set(ID, interpreter);
        this.systems.set(ID, BP.systems);
        return;
    }
}
*/
console.log(`beginning test`);
//(async()=> await Interpretation.create('ID', testBP, testInfo))();
let interpreter = new worker.Worker('./code/testing/js/testWorker.js');
interpreter.on('online', () => {
    console.log(`worker on thread ${interpreter.threadId} online`)
    interpreter.postMessage('hi');
}).on('exit', (workerID) => {
    console.log(`worker on thread ${workerID} exited`);
    //this.remove(workerID);
}).on('message', (msg) => console.log(`worker ${interpreter.threadId} messaged ${msg}`));

/*
async function workerData(BP, TP, info) {
    let obj = {};
    obj.dataMode = TP?.dataMode ?? 'streaming';
    [obj.experimentFiles, obj.patcherFiles] = [[], []];
    info.forEach((fileInfo) => {
        obj.experimentFiles.push(fileInfo.experiment);
        obj.patcherFiles.push(fileInfo?.patcher ?? null);
    });
    [obj.format, obj.schedule] = [BP.format, BP.schedule];
    [obj.attrs, obj.props] = [(BP?.attrs ?? {}), (TP?.props ?? {})];
    //obj.methodModule = paths.interpretationModule(obj.dataMode, TP?.method);
    //obj.sequenceSchema = buildSequenceSchema(BP.systems, TP?.sequenceSchema);
    //obj.groupSchema = buildGroupSchema(TP?.groupSchema);
    return { "workerData": obj };
} /*
function buildSequenceSchema(systemIDs, sequenceSchema) {
    if (!sequenceSchema)
        return null;
    let systemIndex = 0;
    let reversedSchema = {};
    for (const systemID of systemIDs) {
        let tgtSchema = {};
        for (const [methodID, wordObj] of Object.entries(sequenceSchema[systemIndex])) {
            let letters = alphabet_1.default.getLetters(wordObj);
            if (!letters)
                throw new Error(` wrong wordObj format "${wordObj.toString()}" in interpretation_template`);
            for (const letter of letters) {
                if (!tgtSchema?.[letter])
                    tgtSchema[letter] = [];
                if (!tgtSchema[letter].includes(methodID))
                    tgtSchema[letter].push(methodID);
            }
            ;
        }
        reversedSchema[systemID] = tgtSchema;
    }
    return reversedSchema;
}*/