import { Successor } from "../definitions/classes/schema"
import { SystemClass } from "../definitions/classes/system"
import Production from "../managers/production"
import Debugger from "./debugging"
import { System } from "./system"

export default class State {
    // Total Progress
    static ruleIndex: number
    static matchCount: number
    // Map Progress
    static mapIndex: number
    static mapCount: number
    // Position
    static pOffset: number
    static sOffset: number
    // Memory
    static predecessor: string
    static pParameters: number[]
    static successor: string
    static sParameters: number[][]
    static outputParameters: number[][]
    static log(message: string) {
        Production.log('subroutine', message);
    }
    static set input(regexMatchArgs: any[]) {
        regexMatchArgs.pop();
        this.pOffset = regexMatchArgs.pop();
        this.predecessor = regexMatchArgs.shift();
        this.successor = this.predecessor;
        this.ruleIndex = regexMatchArgs.findIndex(el => el);
    }
    static get output() {
        this.sOffset += this.successor.length;
        this.matchCount++;
        return this.successor;
    }
}

