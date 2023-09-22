"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clip =  function(system, ...params) { 
    let channelOffset = this.channelGroups[this.systemIndex];
    for(let parameterIndex = 0; parameterIndex < params.length; parameterIndex++) {
        let channelIndex = parameterIndex+channelOffset; 
        let clipped = Math.min(Math.max(params[channelIndex], thi.max), system.min);
        this.data[channelIndex].writeFloatLE(clipped, this.letterIndex*4);
    }
    return [];
};
exports.stateProps = {
    "min": -1,
    "max": 1
};