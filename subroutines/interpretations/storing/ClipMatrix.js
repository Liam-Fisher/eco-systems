"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clip =  function(system, ...params) {
return params.map(p => Math.max(this.min, Math.min(this.max, p))); 
};
exports.stateProps = {
    "min": -1,
    "max": 1
};