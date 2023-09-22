

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subroutine = function(system) {
    if(system.noiseVal<((this.mapIndex+1)/this.mapCount)) {
        let amp = Math.random()*0.1+0.4;
        let successorParameters = new Array(this.successor.length);
        for(let i = 0; i< this.successor.length; i++)   {
            let phaseOffset = (this.ruleIndex%2)*2 - 1; 
            //this.log(`phaseOffset: ${phaseOffset}`);
            let phase = (this.pOffset+phaseOffset+system.letters.length)%system.letters.length;
            //this.log(`phase: ${phase}`);
            amp *= this.ampOffset;
            //this.log(`amp: ${amp}`);
            successorParameters[i] = system.parameters[phase].map((p,n) => ((this.pParameters[n]*(1-amp))+p*amp)/this.successor.length);
        }
        return successorParameters;
    }
};
exports.stateProps = {
    "ampOffset": 0.9
};
exports.systemProps = {
    "noiseVal": 0.
};
/*

        let letters = system.letters.length;
        console.log(`number of letters is system: ${letters}`);
        console.log(`number of letters in successor: ${this.successor.length}`);
        let successorParameters = [];
        for(let i = 0; i< this.successor.length; i++)   {
            let phaseOffsetDirection = this.ruleIndex%2; 
            console.log(`phaseOffsetDirection: ${phaseOffsetDirection}`);
            let phaseOffset = system.delays[phaseOffsetDirection];
            console.log(`phaseOffset1: ${phaseOffset}`);
            system.delays[phaseOffsetDirection] += (phaseOffsetDirection * 2 - 1);
            
            while(phaseOffset<=0) {
                phaseOffset += letters;
            }
            console.log(`phaseOffset2: ${phaseOffset}`);
            console.log(`pOffset: ${this.pOffset}`);
            let phase = (this.pOffset+phaseOffset)%letters;
            console.log(`phase: ${phase}`);
            let ampOffset = (Math.random()-0.5)*system.ampOffset;
            console.log(`ampOffset: ${ampOffset}`);
            let parameter = ampOffset+system.parameters[phase][0];
            successorParameters.push([parameter]);
        }
exports.props = {
    "noiseVal": 0.,
    "delays": [-1,1],
    "ampOffset": 0.1
};
        return successorParameters;
*/