
import { System } from "../../production/system";
import { SystemClass } from "../classes/system";
import { props } from "../static/aliases"
import { initVars } from "../static/interfaces";


type interpretationMode = 'streaming'|'storing';
type modeAndMaxClassReturnType
<MaxClass extends keyof MaxClassReturnType, mode extends interpretationMode> =
mode extends 'streaming' ? MaxClassReturnType[MaxClass] : void;

export type interpretationMethodArgs = [props: props, ...parameters: number[]];

interface MaxClassReturnType {
    table: number;
    buffer: number;
    matrix: number;
    collection: (number|string)
    dictionary: object
    model: void
}
type specificInterpretationModuleMethods<C extends keyof MaxClassReturnType, M extends interpretationMode> = {
    [m: string]: (prop: props, ...param: number[]) => modeAndMaxClassReturnType<C, M>[]
};
type interpretationModuleMethods = {
    [mono: string]: (system: SystemClass, ...param: number[]) => any[] // individal System methods

    
};
export type MethodModule = interpretationModuleMethods&{
    systemProps: props
    interpreterProps: props
}
//new () => interpretationModuleMethods&initVars

