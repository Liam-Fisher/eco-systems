;
export var dialogModes;
(function (dialogModes) {
    dialogModes[dialogModes["INPUT"] = 0] = "INPUT";
    dialogModes[dialogModes["ALERT"] = 1] = "ALERT";
    dialogModes[dialogModes["CONFIRM"] = 2] = "CONFIRM";
    dialogModes[dialogModes["DECIDE"] = 3] = "DECIDE";
})(dialogModes || (dialogModes = {}));
;
export var editCategories;
(function (editCategories) {
    editCategories[editCategories["Task"] = 0] = "Task";
    editCategories[editCategories["Syntax"] = 1] = "Syntax";
    editCategories[editCategories["Timetable"] = 2] = "Timetable";
    editCategories[editCategories["Schemata"] = 3] = "Schemata";
    editCategories[editCategories["Systems"] = 4] = "Systems";
    editCategories[editCategories["Interpretation"] = 5] = "Interpretation";
    editCategories[editCategories["Subroutine"] = 6] = "Subroutine";
    editCategories[editCategories["Recording"] = 7] = "Recording";
    editCategories[editCategories["Media"] = 8] = "Media";
})(editCategories || (editCategories = {}));
export var editModes;
(function (editModes) {
    editModes[editModes["DELETE"] = 0] = "DELETE";
    editModes[editModes["REMOVE"] = 1] = "REMOVE";
    editModes[editModes["INSERT"] = 2] = "INSERT";
    editModes[editModes["LOAD"] = 3] = "LOAD";
    editModes[editModes["SAVE"] = 4] = "SAVE";
    editModes[editModes["NEXT"] = 5] = "NEXT";
    editModes[editModes["PREV"] = 6] = "PREV";
    editModes[editModes["OPEN"] = 7] = "OPEN";
    editModes[editModes["CLOSE"] = 8] = "CLOSE";
    editModes[editModes["EVAL"] = 9] = "EVAL";
})(editModes || (editModes = {}));
;
export const EditTargets = {
    "DELETE": {
        "Syntax": {
            "a": "axioms",
            "c": "contexts",
            "l": "letters",
            "w": "words"
        }
    },
    "REMOVE": {
        "Syntax": {
            "a": "axioms",
            "c": "contexts",
            "l": "letters",
            "w": "words"
        }
    },
    "INSERT": {
        "Syntax": {
            "a": "axioms",
            "c": "contexts",
            "l": "letters",
            "w": "words"
        },
        "Timetable": {
            "s": "schemata",
            "i": "interpreters",
            "x": "interactions"
        },
        "Schemata": {
            "s": "schema",
            "r": "rules",
            "i": "interpreters"
        },
        "Systems": {
            "n": "new",
            "p": "props"
        }
    },
    "LOAD": {},
    "SAVE": {},
    "PREV": {},
    "NEXT": {},
    "OPEN": {},
    "CLOSE": {},
    "EVAL": {}
};
export const propertyAliases = [
    "axioms",
    "blueprint",
    "contexts",
    null,
    "experiment",
    null,
    "interaction",
    "hook",
    "interpreters",
    null,
    null,
    "letters",
    "map",
    null,
    null,
    "productionRules",
    null,
    "schemata",
    "systems",
    "interpretation",
    "timetable",
    null,
    "words",
    "interactions",
    "syntax",
    null
];
export const defaultTestSystem = {
    "letters": "A",
    "maxLetters": 128,
    "parameters": [[0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5, 6, 7]],
    "parameterSize": 8,
    "id": "test",
    "axiom": 0,
    "schema": "test",
    "age": 1,
    "status": "active",
    "props": {}
};
export const defaultTestState = {
    "ruleIndex": 0,
    "matchCount": 1,
    "pOffset": 0,
    "sOffset": 0,
    "predecessor": "A",
    "pParameters": [0, 1, 2, 3, 4, 5, 6, 7],
    "successor": "BB",
    "sParameters": [[0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5, 6, 7]],
    "outputParameters": []
};
export const moduleHeader = `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n`;
export const functionHeader = `exports.subroutine = function(system) {\n\t`;
export const dataArgs = ["matchCount", "ruleIndex", "pOffset", "sOffset", "predecessor", "pParameters", "successor", "sParameters", "outputParameters"];
export const systemArgs = ["letters", "maxLetters", "parameters", "parameterSize", "id", "axiom", "schema", "age", "status"];
