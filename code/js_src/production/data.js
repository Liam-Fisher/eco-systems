"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Data {
    static ruleIndex;
    static matchCount;
    static pOffset;
    static sOffset;
    static predecessor;
    static pParameters;
    static successor;
    static sParameters;
    static outputParameters;
    static set input(regexMatchArgs) {
        regexMatchArgs.pop();
        this.pOffset = regexMatchArgs.pop();
        this.predecessor = regexMatchArgs.shift();
        this.successor = this.predecessor;
        this.ruleIndex = regexMatchArgs.findIndex(el => el);
    }
    static map(system, successors) {
        for (let [map, successor] of successors) {
            this.successor = successor;
            let parameters = this[map](system);
            if (!parameters)
                continue;
            return parameters;
        }
        return [this.pParameters];
    }
    static get output() {
        this.outputParameters.splice(this.pOffset, 1, ...this.sParameters);
        this.sOffset += this.successor.length;
        this.matchCount++;
        return this.successor;
    }
}
exports.default = Data;
