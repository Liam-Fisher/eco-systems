import { json_el } from "./aliases";
import { hookStages } from "./literals";


export type gctor<T> = new (...args: any[]) => T;
export type ctx_args<H> =  { [Handler in keyof H as `${string & Handler}_args`]: (string|number)[] };
export type ctx_attrs<H> =  { [Handler in keyof H as `${string & Handler}_attrs`]: Record<string,  json_el>};
export type nested_el<T> = T | (nested_el<T>[]);
export type nested_obj<T> = {
    [key: string]: T|nested_obj<T>;
}

export type Hooks<T extends Record<string, any[]>> = { [Prop in keyof T as `${keyof hookStages}_${string & T}`]?: string[]};