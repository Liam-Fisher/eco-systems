"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generator = function* (...tgts) {
    for(let i=0; i<tgts.length; i++) {
        //console.log(`interacting with ${tgts[i].id}: ${tgts[i].testInd++}`);
    }
    //console.log(`interacted with ${tgts.map(t => `${t.id}: ${t.testInd}`).join(' ')}`);
    return;
};
exports.dependencies = [];
exports.dependents = [];
exports.systemProps = {
    "testInd": 0
}; 