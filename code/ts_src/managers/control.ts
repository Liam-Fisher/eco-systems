import { status } from "../definitions/static/literals";
import Production from "./production";
import Interpretation from "./interpretation";

import {Messenger} from "../helpers/messaging";
import Interaction from "./interaction";
import { ControlOptions } from "../definitions/classes/experiment";

export class Control {
// progress
static timeout: number;
static status: status;
static age: number;
static gen: null|Generator<undefined,void,unknown>;
static terminalAge: number;
static ProductionYield?: boolean
static InteractionYield?: boolean
static InterpretationYield?: boolean
// pseudo ctor
static reset(options?: ControlOptions, generations?: number) { 
    [this.status, this.age, this.gen] = ['active', 0, null];
    [this.terminalAge, this.timeout] = [(generations ?? 9**9), 8**8];
    Object.entries(options).forEach(([k,v]) => Control[k] = v);
}
// processing methods
static iter(generations?: number) {
    if(generations) this.terminalAge = generations;
    while(this.step) {
        console.log(`beginning generation: ${this.age+1} of ${this.terminalAge}`);
        Production.generate(this.age);
        Interaction.generate(this.age);
        Interpretation.generate(this.age);
        this.age++;
    }
    if(Production.debugger){
    Production.debugger.end();
    }
}
static next(generations?: number) {
    if(generations) this.terminalAge = generations;
    if((this.gen === null)&&(this.status === 'active')) {
        Messenger.ee.emit("update", `beginning production generation`);
        this.gen = this.generatorFunction();
    }
    if((this.status === 'active')||(this.status === 'waiting')) {
        Messenger.ee.emit("update", `generating production at generation ${this.age} of ${this.terminalAge}`);
        if(this.gen.next().done) {
            this.gen = null;
            this.status = 'complete';
            Messenger.ee.emit("update", `production generator complete`);
        }
    }
    else {
        Messenger.ee.emit("update",  `generator must be reset before beginning new production cycle`);
    }
}
static *generatorFunction() {
    while(this.step) {
        Production.generate(this.age);
        if(this?.ProductionYield) {
            this.status = 'waiting'; 
            Messenger.ee.emit("update", "production", "waiting");
            yield;
            this.status = 'active'; 
        }
        Interaction.generate(this.age);
        if(this?.InteractionYield) {
            this.status = 'waiting'; 
            Messenger.ee.emit("update", "production", "waiting");
            yield;
            this.status = 'active'; 
        }
        Interpretation.generate(this.age);
        if(this?.InterpretationYield) {
            this.status = 'waiting'; 
            Messenger.ee.emit("update", "production", "waiting");
            yield;
            this.status = 'active'; 
        }
    }
}
static get step(): boolean {
    if((this.status === 'complete')) {
        Messenger.ee.emit("update", "production", "exited");
        return false;
    }
    if((this.status === 'error')) {
        Messenger.ee.emit("update", "production", "error");
        return false;
    }
    if((Messenger.startTime-Date.now()) >= this.timeout) {
        Messenger.ee.emit("update", "production", "timeout");
        return false;
    }
    if(this.age < this.terminalAge) return true;
    Messenger.ee.emit("update", "production", "complete");
    return false;
    }
}