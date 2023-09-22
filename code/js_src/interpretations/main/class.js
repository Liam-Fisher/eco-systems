import { cloneRecurse } from "../../helpers/loading";
import InterpretationDebugger from "./debugger";
export default class Interpreter {
    systemIndex;
    letterIndex;
    sequenceSchema;
    groupSchema;
    systemProps;
    attrs;
    wordLengths;
    parameterSizes;
    maxLetters;
    debugger;
    constructor(data) {
        [this.wordLengths, this.systemProps, this.systemIndex, this.letterIndex] = [[], {}, 0, 0];
        [this.sequenceSchema, this.groupSchema, this.attrs] = [data.sequenceSchema, data.groupSchema, data.attrs];
        if ('debugLog' in data) {
            this.debugger = new InterpretationDebugger(data.debugLog, data?.debugTargets);
        }
        else {
            this.debugger = null;
        }
    }
    log(stage, dequeuedMsg, messages) {
        if (!this.debugger)
            return;
        if (stage === 'subroutine')
            this.debugger.subroutineLog(messages[0]);
        else
            this.debugger.logText(stage, dequeuedMsg, messages);
    }
    set linkSystems(tgts) {
        this.letterIndex = 0;
        this.systemIndex = 0;
        this.wordLengths = tgts.map(s => s.letters.length);
        this.parameterSizes = tgts.map(s => s.parameters?.[0]?.length ?? 0);
        this.maxLetters = Math.max(...this.wordLengths);
        for (let tgt of tgts) {
            cloneRecurse(this.systemProps, tgt);
        }
        this.log('set_systems', tgts, [this.parameterSizes.join(' '), this.wordLengths.join(' ')]);
    }
}
