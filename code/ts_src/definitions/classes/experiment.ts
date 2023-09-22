import { id, timeout } from "../static/interfaces"
import {   interpreter_blueprint } from "./interpretation"
import { system_blueprint } from "./system"
import {  rule_template, schema_blueprint, Syntax } from "./schema"
import { interaction_blueprint } from "./interaction"
import { Control } from "../../managers/control"
export type interpretationStage =  `${'set'|'write'}_${'systems'|'interpretation'|'attributes'|'complete'|'data'}`|`${'add'|'apply'}_${'group_method'|'sequence_method'|'props'}`|'result';
export type productionStage =  `${'pre' | 'per' | 'post'}_${'production' | 'mapping'}`|'start'|'end';
export type wordTypes = {
    letters?: string
    codes?: number[]
    indices?: number[]
}
// number regexp: id: ...targetSystems
//export type schedule = Record<string, Record<string, string[]>>;
export type schedule = ScheduleEntry[];
export interface ScheduleEntry {
    times: number[]
    methods: Record<string, string[]>
}


export interface Timetable {
    generations: number
    schemata: schedule
    interactions: schedule
    interpretations: schedule
}

// schema_blueprint props not currently implemented but would fit better with the "scheduling/linking" data flow of interpretations 

//export type interaction_blueprint = file & { systems: string[] schedule: number[] }

export interface ControlOptions extends timeout {
    ProductionYield?: boolean
    InteractionYield?: boolean
    InterpretationYield?: boolean
    generative?: boolean
    interpretersStoreSystemObjects?: boolean
    interactionStackSize?: number
}
export interface Settings {
    concurrentSchemaHandling?: 'merge'|'sequence'
    circularMatching?: boolean
    threadingThreshold?: number
    systemTopologies?: boolean
    productionLog?: boolean|(productionStage[])
    interpretationLog?: boolean|(interpretationStage[])
}
interface ExperimentSettings extends id {
    generations: number 
}
//? add more option here? could include built in constructs like node CLI options, V8 memory options, etc... or control the automaticity of the process


export interface experiment_blueprint {
    settings: Settings
    options?: ControlOptions
    syntax: Syntax
    timetable: Timetable
    systems: Record<string, system_blueprint>
    schemata: Record<string, schema_blueprint>
    interpreters: Record<string, interpreter_blueprint>
}
// 3 three crosspatch UIs
// the alphabet chooser object
let f: experiment_blueprint = {
    "settings": {},
    "options": {},
   "interpreters": {
    "interpreterA": {
        "attrs": {
            "precision": 5
        },
        "fileGroupSizes": 1,
        "method": "SimpleTurtle",
        "mode": "streaming",
        "sequenceSchema": {
            "0": ["moveForward"],
            "systemA_1": ["turnLeft"],
            "systemA_2": ["turnRight"]
        },
        "format": "coll"
    }
},
    "systems": {
        "systemA": {
            "axiom": 0,
            "props": {
                "stepSize": 0.02,
                "turnIncrement": 0.25,
                "x_position": 0,
                "y_position": 0,
                "direction": 0.3
            }
        }
    },
    "syntax": {
        "words": [[0,2,0,2,0,2,0],[0,2,0,1,0,1,0,0,2,0,2,0,1,0]],
        "axioms": [[0, [0],[0],[0],[0],[0],[0],[0]]],
        "contexts": [],
        "letters": [70,71,72]
    },
    "timetable": {
        "generations": 3,
        "schemata": [
            {
                "times": [0,1,2,3],
                "methods": {
                    "schemaA": ["systemA"]
                }
            }
        ],
        "interactions": [],
        "interpretations": [
            {
                "times": [1],
                "methods": {
                    "interpreterA": ["systemA"]
                }
            }
        ]
    },
    "schemata": {
        "schemaA": {
            "rules": [{
                "strictPredecessor": 0,
                "successors": [["zero",1]]
            }],
            "hooks": {
                "pre_production": ["noise"]
            }
        }
    }
}