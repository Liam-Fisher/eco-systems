import { cloneRecurse } from "../../helpers/loading";
import Interpreter from "./class";
export default function buildInterpreter(data) {
    let tgt = new Interpreter(data);
    if (data.methodModule === 'default')
        return tgt;
    let sequenceMethodIDs = [];
    let groupMethodIDs = [];
    let methodModule = require(data.methodModule);
    tgt.systemProps = methodModule?.systemProps ?? {};
    if (methodModule?.stateProps) {
        Object.entries(methodModule?.stateProps).forEach(e => tgt.log('add_props', [], [e[0], e[1].toString()]));
        cloneRecurse(methodModule?.stateProps, tgt);
    }
    ;
    if ((tgt.sequenceSchema !== null) && (tgt.sequenceSchema !== 'default')) {
        for (let systemID in tgt.sequenceSchema) {
            let systemMethods = tgt.sequenceSchema[systemID];
            for (let letterID in systemMethods) {
                let methodIDs = systemMethods[letterID];
                tgt.log('add_sequence_method', [], [data.methodModule, systemID, letterID, ...methodIDs]);
                sequenceMethodIDs.push(...methodIDs);
            }
        }
    }
    if ((tgt.groupSchema !== null) && (tgt.groupSchema !== 'default')) {
        for (let wordID in tgt.groupSchema) {
            let methodIDs = tgt.groupSchema[wordID];
            tgt.log('add_group_method', [], [data.methodModule, wordID, ...methodIDs]);
            groupMethodIDs.push(...methodIDs);
        }
    }
    return addMethods(tgt, methodModule, sequenceMethodIDs.concat(groupMethodIDs));
}
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
