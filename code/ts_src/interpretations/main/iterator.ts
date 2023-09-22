import { SystemClass } from "../../definitions/classes/system";
import Interpreter from "./class";

import * as worker from 'worker_threads';
export default function* iterateSystems(...systems: SystemClass[]) { 
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
}


/*
export default function* iterateSystems(...systems: SystemClass[]) { // implementation specific iteration
    worker.parentPort.postMessage(`beginning iteration`);
    while (this.letterIndex < this.maxLetters) {
        //worker.parentPort.postMessage(`iteration ${this.letterIndex} of ${this.maxLetters} letters`);
        if (this?.sequenceSchema) {
            //this.log('subroutine', [], [`beginning sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            yield* sequenceMethod(this, systems);
            //this.log('subroutine', [], [`completed sequence schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        if (this?.groupSchema) {
            //this.log('subroutine', [], [`beginning group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
            yield* groupMethod(this, systems);
            //this.log('subroutine', [], [`completed group schema at letter ${this.letterIndex} of ${this.maxLetters}`]);
        }
        this.letterIndex++;
    }
    this.log('subroutine', [], [`completed iteration of ${this.maxLetters} letters`]);
}
    
function* sequenceMethod(tgt: Interpreter, systems: SystemClass[]) {
            for (let targetSystem of systems) {
                //worker.parentPort.postMessage(`(sequence) system ${targetSystem.id} letters`);
                let letter = targetSystem.letters?.[tgt.letterIndex];
                let parameter = targetSystem.parameters?.[tgt.letterIndex];
                //worker.parentPort.postMessage(`letter ${letter} parameters ${parameter}`);
                if (letter && parameter) {
                        let activeMethods: string[] = tgt?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                        //worker.parentPort.postMessage(`methods ${activeMethods.join(' ')}`);
                        for (let methodID of activeMethods) {
                            if (typeof tgt?.[methodID] === 'function') {
                                let result = tgt[methodID].call(tgt, targetSystem, ...parameter);
                                //worker.parentPort.postMessage(`methodResult ${result.join(' ')}`);
                                yield result;
                        }
                    }
                }
            }
        }
    
function* groupMethod(tgt: Interpreter, systems: SystemClass[]) { 
            let word = systems.map(s => s.letters?.[tgt.letterIndex] ?? '').join('');
            let parameterVector = systems.map(s => s.parameters?.[tgt.letterIndex] ?? []);
            if (tgt.groupSchema === 'default') {
                tgt.log('apply_group_method', [], 
                ['default',String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
       
                yield [word, parameterVector];
            }
            else {
                let activeMethods: string[] = this?.groupSchema?.[word] ?? [];
                for (let methodID of activeMethods) {
                    if (typeof tgt?.[methodID] === 'function') {
                        tgt.log('apply_group_method', [], 
                        [methodID,String(tgt.letterIndex), tgt.debugger.pWord(word, parameterVector)]);
                        yield tgt[methodID].call(this, systems, ...parameterVector);
                    }
                }
            }
        }

*/