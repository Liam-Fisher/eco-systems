const {join} = require('path');
const {cwd, exit} = require("process");
const {writeFile } = require('fs');
let dir = cwd();
const process = require('process');
const worker = require("worker_threads");
//console.log(`ID ${threadId}`);
worker.parentPort.postMessage(`hi ${dir}`);

worker.parentPort.on('message', (msg) => {
    
writeFile(join(cwd(),'experiments/testA/test3.txt'), 'hi', () => exit());
    //worker.parentPort.postMessage(`writing ${msg}`);
    //writeFile('./code/testing/js/test.txt', msg, () => process.exit(worker.threadId));
});

function outputIntepreted() {
    queue.paused = true;
    fs.writeFile('./code/testing/js/file.txt', 't3st', () => {
            worker.parentPort.postMessage(`completed all writes`);
            process.exit(worker.threadId);
     
    });
}
