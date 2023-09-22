import Production from '../../managers/production';
import State from '../state'
import { Schema } from '../schema';
import { System } from '../system';
import { Successor } from '../../definitions/classes/schema';
const outputParameters: number[][] = [];
function callHooks(system: System, ...methodIDs: string[]) {
    let loadedHooks = methodIDs.filter(hook => typeof Production?.[hook] === 'function');
    loadedHooks.map(lHook => Production[lHook](system));
}
export const produce = function* (system: System): Generator<string, string, unknown> {
    system.status = 'active';
    Production.log('start', [system]);
    console.log('start');
    while (system.status === 'active') {
        const schema: Schema = Production.schemata.get(system.schema)
        callHooks(system, ...(schema?.hooks?.pre_production ?? []));
        console.log('pre_production');
        Production.log('pre_production', [system, schema]);
        assignToTemp(system.parameters, outputParameters)
        system.letters = replace(system, schema);
        assignToTemp(outputParameters, system.parameters);
        callHooks(system, ...(schema?.hooks?.post_production ?? []));
        Production.log('post_production', [system, schema]);
        if (system.isActive) {
            console.log(system.status);
            yield system.status;
        }
        else {
            console.log('completed');
            Production.log('end', [system]);
            return 'complete';
        }
    }
};


function replace(system: System, schema: Schema): string {
    State.sOffset = 0;
    State.matchCount = 0;
    return system.letters.replaceAll(schema.regex, (...regexpMatchArgs) => {
        State.input = regexpMatchArgs;
        State.pParameters = system.parameters[State.pOffset];
        Production.log('per_production', [system, schema]);
        let successorOptions = schema.successors?.[State.ruleIndex];
        if (successorOptions) {
            callHooks(system, ...(schema?.hooks?.pre_mapping ?? []));
            Production.log('pre_mapping', [system, schema]);
            State.sParameters = applyMaps(system, successorOptions);
            callHooks(system, ...(schema?.hooks?.post_mapping ?? []));
            Production.log('post_mapping', [system, schema]);
        }
        if (State.sOffset === 0) {
            State.sOffset = State.pOffset;
        }
        outputParameters.splice(State.sOffset, 1, ...State.sParameters);
        Production.log('parameters', outputParameters);
        return State.output;
    });
}

function applyMaps(system: System, successors: Successor) {
    State.mapIndex = 0;
    State.mapCount = successors.length;
    for (let [mapID, successor] of successors) {
        State.successor = successor;
        Production.log('per_mapping', [system as System]);
        let parameters = State[mapID](system) as number[][];
        State.mapIndex++;
        if (!parameters?.length) continue;
        return parameters;
    }
    State.successor = State.predecessor;
    return [State.pParameters];
}

function assignToTemp(src: number[][], tgt: number[][]) {
    for (let i = 0; i < src.length; i++) {
        tgt[i] = Array.from(src[i]);
    }
}
/*

export const produce = function* (system: System, schema: Schema): Generator<string, string, unknown> {
    system.status = 'active';
    do {
        callHooks(system, ...(schema?.hooks?.pre_production ?? []));
        State.sOffset = 0;
        State.outputParameters = system.parameters;
        system.letters = system.letters.replaceAll(schema.regex, (...regexpMatchArgs) => {
            State.input = regexpMatchArgs;
            State.pParameters = system.parameters[State.pOffset];
            let successorOptions = schema.successors?.[State.ruleIndex];
            if (successorOptions) {
                callHooks(system, ...(schema?.hooks?.pre_mapping ?? []));
                State.sParameters = State.map(system, successorOptions);
                callHooks(system, ...(schema?.hooks?.post_mapping ?? []));
            }
            return State.output;
        });
        system.parameters = State.outputParameters;
        callHooks(system, ...(schema?.hooks?.post_production ?? []));
        yield system.status;
    } while (system.isActive);
    return 'complete';
};

function callHooks(system: System, ...methodIDs: string[]) {
    let loadedHooks = methodIDs.filter(hook => typeof Production?.[hook] === 'function');
    loadedHooks.map(lHook => Production[lHook](system));
}

*/