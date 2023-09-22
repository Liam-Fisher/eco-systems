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

/*
function listener(){
    //let messagesPerFile = schedule.map(t => t.length);
    let messagesEnqueued = 0;
    let fileReceived = 0;
    port1.on('message', (msg) => {
        console.log(`letters received ${msg}`);
        const promise = promisedMessages[fileReceived][messagesEnqueued++];
        promisedMessages[fileReceived].push(Defer());
        messagesEnqueued %= schedule[fileIndex];
        if(messagesEnqueued === 0) fileIndex++;
        promise.resolve(msg);
    });

    const gen = async function*(totalMessageCount, fileIndex) {
        let receivedMessageCount = 0;
        while (receivedMessageCount++<totalMessageCount) {
          const val = await promisedMessages[fileIndex][0].promise
          promisedMessages.shift();
          messagesEnqueued--;
          console.log(`letters processing ${letters}`);
          yield val;
    }
}
return schedule.map((t,i) => pipeline(gen(t, i), iterAll, createWriteStream(paths[i])));
}
*/

const Defer = () => {
    let resolve;
    let promise = new Promise(r => resolve = r);
    return { promise, resolve }
};

let iterIndex = 0;
function listener(schedule) {
let messagesReceived = 0;
let fileReceived = 0;
const promisedMessages = schedule.map((t, i) => t.map((m) => Defer()));

const paths = schedule.map((arr, i) => `${dir}output_${i}.txt`);
port1.on('message', (msg) => {
        console.log(`letters received ${msg.letters} for message ${messagesReceived} of file ${fileReceived}`);
        //let messagesEnqueued = promisedMessages[fileReceived].length - 1; 
        const promise = promisedMessages[fileReceived][messagesReceived];
        console.log(`typeof ${typeof promise}`);
        console.log(`instanceof ${promise.promise instanceof Promise}`);
        //promisedMessages[fileReceived].push(Defer());
        if(++messagesReceived === schedule[fileReceived].length) {
            messagesReceived = 0;
            console.log(`all messages for file ${fileReceived} received`);
            if(++fileReceived === schedule.length) {
                console.log(`all messages for every file received`);
            }
        } 
        promise.resolve(msg);
});
const gen = async function*(totalMessageCount, fileIndex) {
    console.log(`created generator with for file ${fileIndex} with ${totalMessageCount+1} messages`);
    let receivedMessageCount = 0;
    while (receivedMessageCount < totalMessageCount) {
        console.log(`generator processing file ${fileIndex} : message ${receivedMessageCount}`);
        yield  await promisedMessages[fileIndex][receivedMessageCount++].promise
      //yield val;
    };
}
return schedule.map((t,i) => pipeline(gen(t.length, i), iterAll, formatOutput, createWriteStream(paths[i])));
}

(async function() {
    await Promise.all([...listener([[0,1],[2,3]])]).then(() => console.log(`completed`));
})();
port1.postMessage('ready');



let systemA1 = { "letters": "ABC" };
let systemB1 = { "letters": "DEF" };
let systemA2 = { "letters": "GHI" };
let systemB2 = { "letters": "JKL" };
let systemA3 = { "letters": "MNO" };
let systemB3 = { "letters": "PQR" };
let systemA4 = { "letters": "STU" };
let systemB4 = { "letters": "VWX" };

port2.on('message', () => {
    console.log(`sending A1 ${systemA1.letters}`);
    port2.postMessage([systemA1,systemB1]);
    console.log(`sending A2 ${systemA2.letters}`);
    port2.postMessage([systemA2,systemB2]);
    console.log(`sending A3 ${systemA3.letters}`);
    port2.postMessage([systemA3,systemB3]);
    console.log(`sending A4 ${systemA4.letters}`);
    port2.postMessage([systemA4,systemB4]);
});


async function* iterAll(sourceSystems) {
    let thisIndex = iterIndex;
    let receivedSystem = 0;
    iterIndex++;
    for await (const systems of sourceSystems) {
    let systemIndex = 0;
    
    for (let system of systems) {
    console.log(`iterator processing letters ${system.letters} for ${receivedSystem} of ${thisIndex}`);
    let letterIndex = 0;
    let letters = system.letters;
    while (letterIndex  < letters.length) {
        yield letters[letterIndex];
        letterIndex++;
    }
    systemIndex++;
}
    receivedSystem++;
    console.log(`iterAll processed ${receivedSystem} `);
}
};

async function* formatOutput(source) {
    let accumIndex = 0;
    for await(const letterResult of source) {
        yield `${accumIndex++}, ${letterResult};\n`;
    }
};
/*
const messageAggregator = async function*(targetFile, totalMessageCount) {
    let receivedMessageCount = 0;
    let fileIndex = 0;
    let active = true;
    while (receivedMessageCount<totalMessageCount) {
      const val = await promisedMessages[targetFile][0].promise
      yield [messageIndex,fileIndex,val];
      if(++messageIndex === schedule[fileIndex].length) {
        messageIndex = 0;
        if(++fileIndex === schedule.length) {
            active = false;
        }
    }
}
}




*/