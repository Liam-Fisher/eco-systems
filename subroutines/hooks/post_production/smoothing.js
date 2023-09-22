"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// worth noting that this is for testing purposes. using javascript arrays to do signal processing is, generally speaking, a bad call.


exports.subroutine = function(system) { 
    let prevParams = system.parameters.slice(-(system.smooth-1));
    for(let i=0; i<system.parameters.length; i++) {
        prevParams.push(Array.from(system.parameters[i]));
        for(let j=0; j<system.parameterSize; j++) {
            for(let k=0; k<system.smooth; k++) {
                system.parameters[i][j] += prevParams[k][j];
            }
            system.parameters[i][j] /= system.smooth;
        }
        prevParams.shift(); 
    } 
};
exports.stateProps =  {
    "smooth": 4
};