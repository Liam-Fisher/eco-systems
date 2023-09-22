"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveForward =  function(system, ...params) { 
    let theta = 2*system.direction*Math.PI;
    system.x_position += Math.sin(theta)*system.stepSize;
    system.y_position += Math.cos(theta)*system.stepSize;
    return ['lineto', system.x_position.toFixed(6), system.y_position.toFixed(6), 0.];
};
exports.turnLeft =  function(system, ...params) { 
    system.direction = (system.direction+system.turnIncrement)%1;
    return [];
};
exports.turnRight =  function(system, ...params) { 
    system.direction = ((system.direction+1)-system.turnIncrement)%1;
    return [];
};
exports.systemProps = {
    "turnIncrement": 0.25,
    "stepSize": 0.01,
    "x_position": 0,
    "y_position": 0,
    "direction": 0
};
/*
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveForward =  function(system, ...params) { 
    let theta = 2*system.props.direction*Math.PI;
    //console.log(`moving from ${system.props.x_position} ${system.props.y_position} in direction ${system.props.direction}`);
    system.props.x_position += Math.sin(theta)*system.props.stepSize;
    system.props.y_position += Math.cos(theta)*system.props.stepSize;
    //console.log(`position is now ${system.props.x_position} ${system.props.y_position}`);
    return ['lineto', system.props.x_position.toFixed(6), system.props.y_position.toFixed(6), 0.];
};
exports.turnLeft =  function(system, ...params) { 
    //console.log(`turning left from ${system.props.direction}`);
    system.props.direction = (system.props.direction+system.props.turnIncrement)%1;
    //console.log(`direction is now ${system.props.direction}`);
    return [];
};
exports.turnRight =  function(system, ...params) { 
    //console.log(`turning right from ${system.props.direction}`);
    system.props.direction = ((system.props.direction+1)-system.props.turnIncrement)%1;
    //console.log(`direction is now ${system.props.direction}`);
    return [];
};
exports.props = {
    "turnIncrement": 0.25,
    "stepSize": 0.01,
    "x_position": 0,
    "y_position": 0,
    "direction": 0
};
*/