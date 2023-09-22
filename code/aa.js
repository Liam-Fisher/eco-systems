const {Control}  = require('./js_src/managers/control');
const {Experiment}  = require('./js_src/managers/experiment');
const {Messenger} = require('./js_src/helpers/messaging');
Messenger.reset();
const MaxAPI =  require("max-api");
Messenger.ee.addListener("update", (msg, tgt) => MaxAPI.outlet("update", Messenger.update(msg, tgt)));
Messenger.ee.addListener("dialog", (label) => MaxAPI.outlet("dialog", UI.dialogMode, label));
Messenger.ee.addListener("view", (i) => MaxAPI.outlet("view", Messenger.stored(i)));
Messenger.ee.emit('update', 'process started');

const handlers = {
     experiment: async (method, ...args) => Experiment[method](...args),
     control: (method, ...args) => Control[method](...args),
     message: (event, ...args) => Messenger.emit(event, ...args) 
};
MaxAPI.addHandlers(handlers);