import { GroupSchema, InterpreterClass, InterpreterWorkerData, SequenceSchema } from "../../definitions/classes/interpretation";
import { MethodModule } from "../../definitions/interpretation/subroutines";
import { cloneRecurse } from "../../helpers/loading";
// create another version of this for group Interpretation    

import Interpreter from "./class";

type interpretationStage =  'link'|`write_${'system'|'interpretation'|'attributes'|'complete'}`|`${'add'|'apply'}_${'group'|'sequence'|'props'}`|'iter'|'methods'|'result'|'format';
export default function buildInterpreter(data: InterpreterWorkerData) {
    let tgt = new Interpreter(data);
    if(data.methodModule === 'default') return tgt;
    let sequenceMethodIDs: string[] = [];
    let groupMethodIDs: string[] = [];
    let methodModule = (require(data.methodModule) as MethodModule);
    tgt.systemProps = methodModule?.systemProps ?? {};
    if(methodModule?.stateProps){
        Object.entries(methodModule?.stateProps).forEach(e => tgt.log('add_props', [], [e[0], e[1].toString()])); 
        cloneRecurse(methodModule?.stateProps, tgt);
    };
    if ((tgt.sequenceSchema !== null)&&(tgt.sequenceSchema !== 'default')) {
        for(let systemID in tgt.sequenceSchema){
            let systemMethods  = tgt.sequenceSchema[systemID]
            for(let letterID in systemMethods)  {
                let methodIDs = systemMethods[letterID];
                tgt.log('add_sequence_method', [],[data.methodModule,systemID,letterID, ...methodIDs]);
                sequenceMethodIDs.push(...methodIDs);
        }
    }
    }
    if ((tgt.groupSchema !== null)&&(tgt.groupSchema!=='default')) {
        for(let wordID in tgt.groupSchema){
                let methodIDs = tgt.groupSchema[wordID];
                tgt.log('add_group_method', [],[data.methodModule, wordID, ...methodIDs]);
                groupMethodIDs.push(...methodIDs);
        }
    }
    return addMethods(tgt, methodModule, sequenceMethodIDs.concat(groupMethodIDs));
};

function addMethods(interpreter: Interpreter, targetModule: any, methods: string[]) {
    for (const methodID of methods) {
        if (!targetModule?.[methodID]) {
            throw new Error(`method ${methodID} defined in interpreter but not present in module`);
        }
        interpreter[methodID] = targetModule[methodID];
    }
    return interpreter;
}

/* Module pattern

export default function buildInterpreter(data: InterpreterWorkerData) {
    let tgt = new Interpreter(data.attrs,  data.sequenceSchema, data.groupSchema);
    if(data.methodModule === 'default') return tgt;
    let methodIDs: string[] = [];
    let methodModule = (require(data.methodModule) as MethodModule);
    tgt.props = methodModule?.props;
    if ((tgt.sequenceSchema !== null)&&(tgt.sequenceSchema !== 'default')) {
        Object.values(tgt.sequenceSchema).forEach((v) => {
            methodIDs.push(...Object.values(v).flat(2))
        });
    }
    if ((tgt.groupSchema !== null)&&(tgt.groupSchema!=='default')) {
        Object.values(tgt.groupSchema).forEach((v) =>  methodIDs.push(...(v)));
    }
    return addMethods(tgt, methodModule, methodIDs);
};

function addMethods(interpreter: Interpreter, targetModule: any, methods: string[]) {
    for (const methodID of methods) {
        if (!targetModule?.[methodID]) {
            throw new Error(`method ${methodID} defined in interpreter but not present in module`);
        }
        interpreter[methodID] = targetModule[methodID];
    }
    return interpreter;
}
*/