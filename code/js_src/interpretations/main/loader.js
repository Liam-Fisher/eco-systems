"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_1 = require("./class");
function buildInterpreter(data) {
    let tgt = new class_1.default(data.attrs, data.sequenceSchema, data.groupSchema);
    if (data.methodModule === 'default')
        return tgt;
    let methodIDs = [];
    let methodModule = require(data.methodModule);
    for (const key in methodModule?.props ?? {}) {
        tgt.props[key] ??= methodModule?.props[key];
    }
    if ((tgt.sequenceSchema !== null) && (tgt.sequenceSchema !== 'default')) {
        Object.values(tgt.sequenceSchema).forEach((v) => {
            methodIDs.push(...Object.values(v).flat(2));
        });
    }
    if ((tgt.groupSchema !== null) && (tgt.groupSchema !== 'default')) {
        Object.values(tgt.groupSchema).forEach((v) => methodIDs.push(...(v)));
    }
    return addMethods(tgt, methodModule, methodIDs);
}
exports.default = buildInterpreter;
;
function addMethods(interpreter, targetModule, methods) {
    for (const methodID of methods) {
        if (!targetModule?.[methodID]) {
            throw new Error(`method ${methodID} defined in interpreter but not present in module`);
        }
        interpreter[methodID] = targetModule[methodID];
    }
    return interpreter;
}
