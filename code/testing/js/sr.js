"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveForward =  function(system, ...params) { 
    let theta = 2*this.props.direction*Math.PI;
    this.props.x_position += Math.sin(theta)*this.props.stepSize;
    this.props.y_position += Math.cos(theta)*this.props.stepSize;
    return ['lineto', this.props.x_position.toFixed(6), this.props.y_position.toFixed(6), 0.];
};
exports.turnLeft =  function(system, ...params) { 
    this.props.direction = (this.props.direction+this.props.turnIncrement)%1;
    return [];
};
exports.turnRight =  function(system, ...params) { 
    this.props.direction = ((this.props.direction+1)-this.props.turnIncrement)%1;
    return [];
};
exports.defaultProps = {
    "turnIncrement": 0,
    "stepSize": 0.01,
    "x_position": 0,
    "y_position": 0,
    "direction": 0
};