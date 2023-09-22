import { wordTypes } from "./alphabet";
import { SystemClass } from "./system";
import { attrs, InitProps, initVars} from "../static/interfaces";
import { GlobalMaxClass, LocalMaxClass, MaxClassNamespace } from "./network";
import { props } from "../static/aliases";
import { interpretationStage } from "./experiment";
export type ObjInfo = (Partial<attrs&{experiment: string, patcher: string|null}>)[];

export type LetterMap = { [subroutineModule: string ]: wordTypes };
export type InterpretationSchema = Record<string,Record<string, string[]>>;

export type interpreter_blueprint = attrs & { // if it has an index, it should be a global object
    initThread?: boolean; // default true, if true, create the interpreter thread at start, else create at the first scheduled message
    fileGroupSizes: number|number[]
    //interpretation: number
    format: (keyof (GlobalMaxClass&LocalMaxClass))
    mode: 'streaming'|'storing' // default is streaming, except for formats that cannot operate in streaming mode
    method?: string
    sequenceSchema?: SequenceSchemaBlueprint // per system, per alphabet letter, a system followed by a list of methods
    groupSchema?: GroupSchemaBlueprint // per method, a list of indices, per system
    printSystems?: boolean
    printAttributes?: boolean
}
// system_letterIndex: methods
// key => `${string|number}_${number}`
export type SequenceSchemaBlueprint = Record<string|number, string[]>;

// method: letterIndices
export type GroupSchemaBlueprint = Record<string, number[]>;

export type InterpreterMessage = SystemClass[];
export type SequenceSchema = Record<string, Record<string, string[]>>|'default'|null;
// word: 
export type GroupSchema =  Record<string, string[]>|'default'|null;
export interface InterpreterWorkerData extends attrs {
        index: number
        mode: 'streaming'|'storing' 
        systemFiles: string[]
        attributeFiles: string[]
        interpretedFiles: string[]
        debugLog?: string
        debugTargets?: interpretationStage[]|boolean;
        methodModule: string
        formatPath: string
        fileGroupSizes: number[]
        sequenceSchema: SequenceSchema
        groupSchema: GroupSchema 
}

export interface InterpreterClass {
    systemIndex: number
    letterIndex: number
    wordLengths: number[]
    maxLetters: number
    sequenceSchema: SequenceSchema
    groupSchema: GroupSchema
    systemProps: props
}



