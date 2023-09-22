import * as worker from "worker_threads";
import * as fs from 'fs';
import * as promised from 'stream/promises';
import addMethodModule from "../../interpretations/main/builder";
import iterateSystems from "../../interpretations/main/iterator";
const data = worker.workerData;
const interpretation = addMethodModule(data);
const iterator = iterateSystems.bind(interpretation);
const formatter = (require(data.formatPath)[data.mode]).bind(interpretation);
const Defer = () => {
    let resolve;
    let promise = new Promise(r => resolve = r);
    return { promise, resolve };
};
function listener(schedule) {
    let fileReceived = 0;
    let messagesReceived = 0;
    const scheduledMessages = schedule.map((t, i) => t.map((m) => Defer()));
    worker.parentPort.on('message', (msg) => {
        const promise = scheduledMessages[fileReceived][messagesReceived];
        if (++messagesReceived === schedule[fileReceived].length) {
            messagesReceived = 0;
            console.log(`all messages for file ${fileReceived++} received`);
        }
        promise.resolve(msg);
    });
    const gen = async function* (awaitMsgs) {
        let msgCount = 0;
        while (msgCount < awaitMsgs.length) {
            yield await awaitMsgs[msgCount].promise;
            awaitMsgs[msgCount++] = null;
        }
        ;
    };
    return schedule.map((t, i) => promised.pipeline(gen(scheduledMessages[i]), iterateParallel, formatter, fs.createWriteStream(data.interpretedFiles[i])));
}
async function* iterateParallel(source) {
    for await (const systems of source) {
        yield* iterator(...systems);
    }
}
