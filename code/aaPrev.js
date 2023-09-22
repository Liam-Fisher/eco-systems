const {Experiment}  = require('./js_src/managers/experiment');
const {Control}  = require('./js_src/managers/control');
const { argv } = require('process');
const start = Date.now();
const MaxAPI =  (argv[2] === 'max') ? require("max-api") : null;
argv.forEach((a, i) => console.log(`${i}: ${a}`));

process.on('exit', () => console.log(`process ended at ${Date.now()-start}`));



          // functions that can be called from the terminal or max
const handlers = {
     erase: async (ID) => await Experiment.removeBuild(ID),
     init: async (ID) => {
          console.log(`loading experiment ${ID}`);
          await Experiment.load(ID);
          console.log(`experiment ${ID} loaded`);
     },
     run: () => {
          console.log(`beginning production`);
          Control.info.once('complete', (path) => {
               console.log(`interpretation complete at ${path}`);
               if(MaxAPI) {
                    MaxAPI.outlet('read', path.replaceAll('\\', '/'));
               }
          });
          Control.run();
          console.log(`production complete`);
     }
};

 // main 

if (MaxAPI) { // running from node.script
     if(argv.length === 4) { // load and run the experiment
          handlers.init(argv[3]).then(() => handlers.run());
     }
     else {  // else wait for a command message to node.script
          MaxAPI.addHandlers(handlers);
     }
}
else if (argv.length === 3) { // load and automatically run from a terminal
     handlers.init(argv[2]).then(() => handlers.run());
}
else { // call a handler from a terminal
     if(typeof handlers?.[argv[2]] === 'function') {
          handlers[argv[2]](...argv.slice(3))
     }
     else {
          throw new Error(`handler ${argv[2]} not recognized`);
     }
}
