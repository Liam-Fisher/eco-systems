import { Hooks,nested_el } from "../static/generics";
import { initVars } from "../static/interfaces";
import { systemStages } from "../static/literals";
import { wordTypes } from "./alphabet";

export type rule_blueprint_alt = {
    predecessor: string
    successors: (wordTypes&{ map: string })[]
}

type CharacterClass<Chars extends string> = `[${Chars}]`; 
type RepeatedContext<Ctx extends string, Min extends string, Max extends string> = `${Ctx}{${Min},${Max}}`;

// index=strictPredecessorIndex [leftContexts[], rightContexts[], [word,map][]]
export interface Syntax {
    words: number[][]
    axioms: [number, ...number[][]][] // index of this.indexWords and a list of parameters of equal length
    contexts: string[]
    letters: number[]
}
export type rule_template = {
    strictPredecessor: number
    leftContext?: number // index of Syntax.contexts
    rightContext?: number // index of Syntax.contexts
    successors: [string,number][] // file in subroutines/maps, index of Syntax.indexWords
} 
interface AltSyntax {
    words: string[]
    productionRule: [number|null, number|string, number|null, [string|null, number]]
    predecessorContexts: string[]
}
// number is index of AltSyntax.words 
type ProductionRule = [number|null, number|string, number|null, [string|null, number]];

export interface Schemata {
    production: [number, number, number]
    successor: [number]
    hooks: Hooks<systemStages>[]

}

export type schema_blueprint = {
    rules: rule_template[] // index of AlphabetCodes, index of rule_template
    hooks: Hooks<systemStages> // file in subroutines/hooks/(context)
};
export type Successor = [string, string][];
/*
export interface Constructed_Rule {
    link: number
    source: number;
    successors: [string, string|null][];
}
*/
export interface SchemaClass extends initVars {
    regex?: RegExp
    hooks: Hooks<systemStages>
    successors: Successor[]
}