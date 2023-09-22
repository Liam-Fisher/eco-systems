"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A =  function(system, ...params) { 
    let val = Math.sin(system.phaseA*2*Math.PI);
    system.phaseA += (this.letterIndex/this.samps);
    system.phaseA %= 1;
    return [val];
};
exports.B =  function(system, ...params) { 
    let val = Math.sin(system.phaseA*2*Math.PI);
    system.phaseB += (this.letterIndex/this.samps);
    system.phaseB %= 1;
    return [val];
};
exports.stateProps = {};
exports.systemProps = {
    "phaseA": 0,
    "phaseB": 0
};