autowatch = 1;
inlets = 1;
outlets = 3;
var syntax = {
    "axioms": [],
    "contexts": [],
    "letterCodes": [],
    "indexWords": []
};
var axioms = [];
var contexts = [];
var letters = [];
var words = [];
var syntax = new Dict("ActiveSyntax");
var dialogMode = 0;
var editMode = null;
var editTarget = null;
// add, insert at index, delete, delete at index, send to node, add and send to node, retrieve from node, send all to node, clear dictionary, 

var editModes = ["DELETE", "BACKSPACE", "INSERT", "UP", "DOWN", "LEFT", "RIGHT", "PGUP", "PGDOWN", "HOME", "END"];
var editTargets = [
    "AXIOM", "BLUEPRINT", "CONTEXT", null, "EXPERIMENT", null, "GENERATIONS", "HOOK", "INTERPRETER", null, null, "LETTER",
    "MAP", "NODE", null, "PRODUCTION", null, "SYSTEM", "TIMETABLE", null, "VIEW", "WORD", "INTERACTION", null, null 
];
function keyInput(editCode, targetCode) {
    editMode = editModes[-(editCode+6)];
    activeTarget = editTargets[(targetCode-97)];
    if(!(editMode&&activeTarget)) {
        outlet(2, 1, "INVALID", "INPUT");
    }
    else {
        outlet(2, 0, editMode, editTarget);
    }
    switch(editMode) {
        case "DELETE":
        break;
        case "BACKSPACE":
        
        break;
        case "INSERT":
            if(activeTarget === "AXIOM") {

            }
        break;
        case "UP":
        
        break;
        case "DOWN":
        
        break;
        case "LEFT":
        
        break;
        case "RIGHT":
        
        break;
        case "PGUP":
        
        break;
        case "PGDOWN":
        
        break;
        case "HOME":
        
        break;
        case "END":
        break;
        default:
            post("unknown error");
        break;
    }
}
function dialogInput() {
    var args = arrayfromargs(arguments);



}
function insertDialog() {
    var dialogText = 
    outlet(0, dialogMode, dialogText)
    

}
function syntaxToString() {
    var tgt = [];
    var args = arrayfromargs(arguments);
    var arr = [];

    for(i=0;i<syntax[tgt].length;i++) {
        if(Array.isArray(syntax[tgt][i])) {
            arr.push(syntax[tgt][i].join('_'));
        }
    };
    return arr.join('|');
}
function testA() {
    syntax.clear();
    syntax.setparse("axioms", '{ "0": [], "1": []}');
}
function testB() {
    syntax.append("axioms", "");
    syntax.setparse("axioms[1]", '{ "0": [0.3,0.4], "1": 0.7}');
}
function testC() {
    syntax.append("axioms[0]", 1);
}
function testD() {
    syntax.append("axioms[0][0]", 1);
}
function reset() {
    syntax.clear();
}
function addAxiom() {
    if(!syntax.getsize("axioms")) {


        syntax.set("axioms", [0, [0,1],[0,1],[0,1]]);
    }
    else {
        syntax.append("axioms", [1, [0],[1]]);
    }


}