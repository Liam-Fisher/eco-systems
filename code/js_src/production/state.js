import Production from "../managers/production";
export default class State {
    static ruleIndex;
    static matchCount;
    static mapIndex;
    static mapCount;
    static pOffset;
    static sOffset;
    static predecessor;
    static pParameters;
    static successor;
    static sParameters;
    static outputParameters;
    static log(message) {
        Production.log('subroutine', message);
    }
    static set input(regexMatchArgs) {
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
