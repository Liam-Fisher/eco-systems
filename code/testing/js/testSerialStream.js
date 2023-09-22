"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const { join, format } = require('path');
const { cwd } = require('process');
console.log(`cwd: ${cwd()}`);
const dir = join(cwd(), 'code', 'testing', 'js');
console.log(`dir: ${dir}`);
const start = Date.now();
let fileComplete = 0;
const Defer = () => {
    let resolve;
    let promise = new Promise(r => resolve = r);
    return { promise, resolve }
};

function listener(schedule) {
let fileReceived = 0;
let messagesReceived = 0;
const completedFiles = schedule.map((t, i) => Defer());
const scheduledMessages = schedule.map((t, i) => t.map((m) => Defer()));
port1.on('message', (msg) => {
        const promise = scheduledMessages[fileReceived][messagesReceived];
        if(++messagesReceived === schedule[fileReceived].length) {
            messagesReceived = 0;
            console.log(`all messages for file ${fileReceived++} received`);
        } 
        promise.resolve(msg);
});


port1.postMessage('ready');

Promise.all([...listener([[0,1],[2,3]])]).then(() => console.log(`completed`));

let systemA1 = { "letters": "ABC" };
systemA1.letters = "ABC".repeat(10000);
let systemB1 = { "letters": "DEF" };
let systemA2 = { "letters": "GHI" };
let systemB2 = { "letters": "JKL" };
let systemA3 = { "letters": "MNO" };
let systemB3 = { "letters": "PQR" };
let systemA4 = { "letters": "STU" };
let systemB4 = { "letters": "VWX" };

port2.on('message', () => {
    //console.log(`sending A1 ${systemA1.letters}`);
    port2.postMessage([systemA1,systemB1]);
    //console.log(`sending A2 ${systemA2.letters}`);
    port2.postMessage([systemA2,systemB2]);
   // console.log(`sending A3 ${systemA3.letters}`);
    port2.postMessage([systemA3,systemB3]);
  //  console.log(`sending A4 ${systemA4.letters}`);
    port2.postMessage([systemA4,systemB4]);
});


async function* iterAll(sourceSystems) {
    let receivedSystem = 0;
    for await (const systems of sourceSystems) {
    let systemIndex = 0;
    for (let system of systems) {
    let letterIndex = 0;
    let letters = system.letters;
    while (letterIndex  < letters.length) {
        yield letters[letterIndex];
        letterIndex++;
    }
    systemIndex++;
}
    receivedSystem++;
}
};

async function* formatOutput(source) {
    let accumIndex = 0;
    for await(const letterResult of source) {
        yield `${accumIndex++}, ${letterResult};\n`;
    }
};






