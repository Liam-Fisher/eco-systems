import { experiment_blueprint } from "../../definitions/classes/experiment";
import { interpreter_blueprint } from "../../definitions/classes/interpretation";
import { schema_blueprint, Syntax } from "../../definitions/classes/schema";
import { system_blueprint } from "../../definitions/classes/system";
/*

export type interpreter_blueprint = attrs & { // if it has an index, it should be a global object
    initThread?: boolean; // default true, if true, create the interpreter thread at start, else create at the first scheduled message
    fileGroupSizes: number|number[]
    //interpretation: number
    format: (keyof (GlobalMaxClass&LocalMaxClass))
    mode?: 'streaming'|'storing' // default is streaming, except for formats that cannot operate in streaming mode
    method?: string
    sequenceSchema?: SequenceSchemaBlueprint // per system, per alphabet letter, a system followed by a list of methods
    groupSchema?: GroupSchemaBlueprint // per method, a list of indices, per system
    printSystems?: boolean
}
*/
export default class ComponentUI {
    static systems: experiment_blueprint["systems"]
    static schemata: experiment_blueprint["schemata"]
    static interpreters: experiment_blueprint["interpreters"]
    static reset(src: experiment_blueprint) {
        this.systems = src.systems;
        this.schemata = src.schemata;
        this.interpreters = src.interpreters;
    }
}
