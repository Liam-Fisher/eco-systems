"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker = require("worker_threads");
const fs = require("fs");
const promised = require("stream/promises");
const loader_1 = require("./loader");
const iterator_1 = require("./iterator");
const data = worker.workerData;
const interpretation = (0, loader_1.default)(data);
const iterator = iterator_1.default.bind(interpretation);
const formatter = (require(data.formatPath)[data.dataMode]).bind(interpretation);
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
    return schedule.map((t, i) => promised.pipeline(gen(scheduledMessages[i]), iterateParallel, formatter, fs.createWriteStream(data.experimentFiles[i])));
}
Promise.all([...listener(data.schedule)]).then(() => process.exit(worker.threadId));
async function* iterateParallel(source) {
    for await (const systems of source) {
        yield* iterator(...systems);
    }
}
