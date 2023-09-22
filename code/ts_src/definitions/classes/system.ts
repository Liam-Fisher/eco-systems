
import { constants } from 'buffer';
import { props } from '../static/aliases';
import { id, initVars, Parametric } from '../static/interfaces';
import { status, systemStage, systemStages } from '../static/literals';

interface system_constants {
    terminalAge: number
    maxLetters: number
    parameterSize: number
}
export interface Axiom extends Parametric, initVars {
    letters: number[]
}


export interface system_blueprint extends initVars { 
    axiom: number // index of Syntax.parametricWords
    constants?: props
};
export interface links {
    schema: string
    interaction: Set<string>
    interpretation: Set<string>
}
interface ParametricWord extends  Parametric { letters: string }
export type State = initVars&ParametricWord
export interface SystemClass extends ParametricWord,initVars, id, Partial<system_constants> { 
    age: number
    schema: string;
    status: status;
}
interface ProductionProgress {
rule: number
match: number
map: number
}

interface ProductionMemory {
    predecessor: string;
    successor: string;
    pOffset: number;
    sOffset: number;
    pParams: number[][];
    sParams: number[][];
    outputParameters: number[][];
}
export interface DataClass extends ProductionMemory, ProductionProgress {

}