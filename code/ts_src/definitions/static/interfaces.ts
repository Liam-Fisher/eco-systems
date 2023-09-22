import { json_el, props } from "./aliases";

export interface initVars { props?: props }
export interface InitProps { props: props }
export interface id { id: string }
export interface file { filename: string }
export type index = {index: number};
export type attrs = {attrs: Record<string, string|(number|number[])>};
export interface extraargs { args: (string|number)[] }
export interface timeout { timeout?: number };
export type Parametric = { parameters: number[][] }
