import { GroupSchema, InterpreterClass, InterpreterWorkerData, SequenceSchema } from "../../definitions/classes/interpretation";
import { SystemClass } from "../../definitions/classes/system";
import { props } from "../../definitions/static/aliases";
import { attrs } from "../../definitions/static/interfaces";
import { cloneRecurse } from "../../helpers/loading";
import Debugger from "../../production/debugging";
import InterpretationDebugger from "./debugger";

type interpretationStage =  `${'set'|'write'}_${'systems'|'interpretation'|'attributes'|'complete'|'data'}`|`${'add'|'apply'}_${'group_method'|'sequence_method'|'props'}`|'result';
export default class Interpreter implements InterpreterClass {
    systemIndex: number;
    letterIndex: number;
    sequenceSchema: SequenceSchema
    groupSchema: GroupSchema
    systemProps: props
    attrs: attrs['attrs']
    wordLengths: number[];
    parameterSizes: number[];
    maxLetters: number
    debugger: InterpretationDebugger|null
    constructor(data:InterpreterWorkerData) {
        [this.wordLengths, this.systemProps, this.systemIndex, this.letterIndex] = [[], {}, 0,0];
        [this.sequenceSchema, this.groupSchema, this.attrs] = [data.sequenceSchema, data.groupSchema, data.attrs];
        if('debugLog' in data){
            this.debugger = new InterpretationDebugger(data.debugLog, data?.debugTargets);
        }
        else {
            this.debugger = null;
        }
    }
    log(stage: interpretationStage|'subroutine', dequeuedMsg: SystemClass[], messages: string[]){
        if(!this.debugger) return;
        if(stage === 'subroutine') this.debugger.subroutineLog(messages[0]);
        else this.debugger.logText(stage, dequeuedMsg, messages);
    }
    set linkSystems(tgts: SystemClass[]) {
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
/*
export default class Interpreter implements InterpreterClass {
    systemIndex: number;
    letterIndex: number;
    sequenceSchema: SequenceSchema
    groupSchema: GroupSchema
    systemProps: props
    attrs: attrs['attrs']
    wordLengths: number[];
    parameterSizes: number[];
    maxLetters: number
    debugger: InterpretationDebugger|null
    constructor(data:InterpreterWorkerData) {
        [this.wordLengths, this.systemProps, this.systemIndex, this.letterIndex] = [[], {}, 0,0];
        [this.sequenceSchema, this.groupSchema, this.attrs] = [data.sequenceSchema, data.groupSchema, data.attrs];
        if('debugLog' in data){
            this.debugger = new InterpretationDebugger(data.debugLog, data?.debugTargets);
        }
        else {
            this.debugger = null;
        }
    }
    log(stage: interpretationStage|'subroutine', dequeuedMsg: SystemClass[], messages: string[]){
        if(!this.debugger) return;
        if(stage === 'subroutine') this.debugger.subroutineLog(messages[0]);
        else this.debugger.logText(stage, dequeuedMsg, messages);
    }
    set linkSystems(tgts: SystemClass[]) {
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
while (this.letterIndex < this.maxLetters) {
    //worker.parentPort.postMessage(`iteration ${this.letterIndex} of ${this.maxLetters} letters`);
    if (this?.sequenceSchema) {
        //this.log('subroutine', [], [`beginning sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        for (let targetSystem of systems) {
            //worker.parentPort.postMessage(`(sequence) system ${targetSystem.id} letters`);
            let letter = targetSystem.letters?.[this.letterIndex];
            let parameter = targetSystem.parameters?.[this.letterIndex];
            //worker.parentPort.postMessage(`letter ${letter} parameters ${parameter}`);
            if (letter && parameter) {
                    let activeMethods: string[] = this?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                    //worker.parentPort.postMessage(`methods ${activeMethods.join(' ')}`);
                    for (let methodID of activeMethods) {
                        let result = this[methodID].call(this, targetSystem, ...parameter);
                        if(result) {
                            yield result;
                        }
                    }
                }
            }
        }
        this.letterIndex++;
}
*/