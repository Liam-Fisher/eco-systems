import { props } from "../definitions/static/aliases";
import * as fsPromises from 'fs/promises';
import { SystemClass } from "../definitions/classes/system";
import State from "../production/state";
import { experiment_blueprint } from "../definitions/classes/experiment";
import { Experiment } from "../managers/experiment";
interface SubroutineTestOptions {
    forceWrite?: boolean
    testSystem?: Partial<SystemClass>
    testState?: Partial<State>
    noWrite?: boolean
};
export enum dialogModes {
    //["DELETE", "BACKSPACE", "INSERT", "UP", "DOWN", "LEFT", "RIGHT", "PGUP", "PGDOWN", "HOME", "END"];
    INPUT, // "DELETE"
    ALERT, //"BACKSPACE"
    CONFIRM, // "INSERT"
    DECIDE
};
export enum editCategories {
    Task,
    Syntax,
    Timetable,
    Schemata,
    Systems,
    Interpretation, 
    Subroutine,
    Recording,
    Media

}

export enum editModes {
    //["DELETE", "BACKSPACE", "INSERT", "UP", "DOWN", "LEFT", "RIGHT", "PGUP", "PGDOWN", "HOME", "END"];
    DELETE, // "DELETE" - remove all values from the target (usually the same as reset)
    REMOVE, // "BACKSPACE" - remove a keyed value from an array or object
    INSERT, // "INSERT" - add a keyed element to an array or object
    LOAD,  // "UP" - load a file 
    SAVE, // "DOWN" - save a file
    NEXT, //"LEFT" - target next UI component (syntax.letters, syntax.words, syntax.contexts, syntax.axioms etc... )
    PREV,  // "RIGHT" - target prev ordered UI component
    OPEN,  // "PGUP" - open the associated ui 
    CLOSE, // "PGDOWN" - close the associated ui
    EVAL, // "HOME" - direct evaluation of javascript in the given context
    // END - Turn Dialog input/output on/off (in patcher)
};
export const EditTargets: Record<(keyof typeof editModes), Partial<Record<(keyof typeof editCategories), Record<string,string>>>> = {
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
}
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