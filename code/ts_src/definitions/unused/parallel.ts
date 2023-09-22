import * as worker from "worker_threads";
import { InterpreterWorkerData } from "../classes/interpretation";
import * as fs from 'fs';
import * as promised from 'stream/promises';
import addMethodModule from "../../interpretations/main/builder";
import { SystemClass } from "../classes/system";
import iterateSystems from "../../interpretations/main/iterator";

const data = worker.workerData as InterpreterWorkerData;
const interpretation = addMethodModule(data);
const iterator = iterateSystems.bind(interpretation); 
const formatter = (require(data.formatPath)[data.mode]).bind(interpretation);


type scheduledMessage = {
    promise: Promise<SystemClass[]>
    resolve: (r: Promise<SystemClass[]>) => SystemClass[];
}
const Defer = (): scheduledMessage => {
    let resolve;
    let promise: Promise<SystemClass[]> = new Promise(r => resolve = r);
    return { promise, resolve }
};

function listener(schedule: number[][]) {
let fileReceived = 0;
let messagesReceived = 0;
const scheduledMessages: scheduledMessage[][] = schedule.map((t, i) => t.map((m) => Defer()));
worker.parentPort.on('message', (msg) => {
        const promise = scheduledMessages[fileReceived][messagesReceived];
        if(++messagesReceived === schedule[fileReceived].length) {
            messagesReceived = 0;
            console.log(`all messages for file ${fileReceived++} received`);
        } 
        promise.resolve(msg);
});
const gen = async function*(awaitMsgs: scheduledMessage[]) {
    let msgCount = 0;
    while (msgCount<awaitMsgs.length) {
        yield await awaitMsgs[msgCount].promise
        awaitMsgs[msgCount++] = null;
    };
}
return schedule.map((t,i) => promised.pipeline(gen(scheduledMessages[i]), iterateParallel, formatter, fs.createWriteStream(data.interpretedFiles[i])));
}
//Promise.all([...listener(data.schedule)]).then(() => process.exit(worker.threadId));

async function* iterateParallel(source: AsyncIterable<SystemClass[]>) { // implementation specific iteration
    for await (const systems of source) {
        yield* iterator(...systems);
    }
}