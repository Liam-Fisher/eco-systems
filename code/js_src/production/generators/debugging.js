"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produce = void 0;
const production_1 = require("../../managers/production");
const state_1 = require("../state");
const produce = function* (system, schema) {
    system.status = 'active';
    do {
        callHooks(system, ...(schema?.hooks?.pre_production ?? []));
        state_1.default.sOffset = 0;
        state_1.default.outputParameters = system.parameters;
        console.log(`inputLetters (${system.letters.length}) ${system.letters}`);
        system.letters = system.letters.replaceAll(schema.regex, (...regexpMatchArgs) => {
            state_1.default.input = regexpMatchArgs;
            state_1.default.pParameters = system.parameters[state_1.default.pOffset];
            let successorOptions = schema.successors?.[state_1.default.ruleIndex];
            if (successorOptions) {
                callHooks(system, ...(schema?.hooks?.pre_mapping ?? []));
                state_1.default.sParameters = state_1.default.map(system, successorOptions);
                callHooks(system, ...(schema?.hooks?.post_mapping ?? []));
            }
            return state_1.default.output;
        });
        system.parameters = state_1.default.outputParameters;
        callHooks(system, ...(schema?.hooks?.post_production ?? []));
        console.log(`cycle letters (${system.letters.length}) ${system.letters}`);
        console.log(`cycle Params (${system.parameters.length}) ${system.parameters.join('-')}`);
        yield system.status;
    } while (system.isActive);
    console.log(`final letters (${system.letters.length}) ${system.letters}`);
    console.log(`final Params (${system.parameters.length}) ${system.parameters.join('-')}`);
    return 'complete';
};
exports.produce = produce;
function callHooks(system, ...methodIDs) {
    let loadedHooks = methodIDs.filter(hook => typeof production_1.default?.[hook] === 'function');
    loadedHooks.map(lHook => production_1.default[lHook](system));
}
