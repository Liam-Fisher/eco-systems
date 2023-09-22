import { nested_el, nested_obj } from "./generics";

export type maxmsg =  [string, ...(string|number)[]];
export type el = string|number|boolean;
export type json_el = nested_el<el|nested_obj<el>>;
// string is a function created at runtime that takes an argument "n" and returns a boolean, 
// it indicates whether the target component is active for the current generation
// ex: if generations = 7, '!(n%3)' would be equivalent to [0, 3, 6]
export type schedule = (number[])|string;

export type props =  Record<string, json_el>|json_el[];