"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subroutine = function(letter, ...params) { 
    let theta = 2*this.direction*Math.PI;
    this.x_position += Math.sin(theta)*this.stepSize;
    this.y_position += Math.cos(theta)*this.stepSize;
    return [`lineto ${this.x_position.toFixed(6)} ${this.y_position.toFixed(6)} 0.`];
};
exports.props =  {
    "stepSize": 0.01,
    "x_position": 0,
    "y_position": 0,
    "direction": 0
};