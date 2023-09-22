import Production from '../../managers/production';
import State from '../state';
const outputParameters = [];
function callHooks(system, ...methodIDs) {
    let loadedHooks = methodIDs.filter(hook => typeof Production?.[hook] === 'function');
    loadedHooks.map(lHook => Production[lHook](system));
}
export const produce = function* (system) {
    system.status = 'active';
    Production.log('start', [system]);
    console.log('start');
    while (system.status === 'active') {
        const schema = Production.schemata.get(system.schema);
        callHooks(system, ...(schema?.hooks?.pre_production ?? []));
        console.log('pre_production');
        Production.log('pre_production', [system, schema]);
        assignToTemp(system.parameters, outputParameters);
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
function replace(system, schema) {
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
function applyMaps(system, successors) {
    State.mapIndex = 0;
    State.mapCount = successors.length;
    for (let [mapID, successor] of successors) {
        State.successor = successor;
        Production.log('per_mapping', [system]);
        let parameters = State[mapID](system);
        State.mapIndex++;
        if (!parameters?.length)
            continue;
        return parameters;
    }
    State.successor = State.predecessor;
    return [State.pParameters];
}
function assignToTemp(src, tgt) {
    for (let i = 0; i < src.length; i++) {
        tgt[i] = Array.from(src[i]);
    }
}
