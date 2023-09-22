import Production from "../managers/production";
import * as paths from '../helpers/paths';
import {cloneRecurse} from '../helpers/loading';
import { Schema } from "../production/schema";
import { rule_template, schema_blueprint, Successor, Syntax } from "../definitions/classes/schema";
import Alphabet from "../helpers/alphabet";
import Data from "../production/state";


export async function rules(tgt: Schema, systemIDs: string[], ...ruleInfo: [string,Successor][]): Promise<Schema> {
    let patterns = [];
    for await (const rule of ruleInfo) {
        patterns.push(rule[0]);
        tgt.successors.push(rule[1]);
        for await (const successor of rule[1] ?? []) {
            Production.log('load', `successor: map = ${successor[0]}, word = ${successor[1]}\n`);
            if(successor?.[0]) await subroutine.call(Data, successor[0], systemIDs, 'maps')
        }
    };
    tgt.regex = new RegExp(`(${patterns.join(')|(')})`, 'g');
    return tgt;
};
// alternate declaration for non-schema component with hooks
// export async function load_hooks<HasHooks extends {hooks: Hooks<Record<string, any[]>>}>(tgt: HasHooks, stored: Hooks<Record<string, any[]>>): Promise<HasHooks> {
export async function hooks(tgt: Schema, systemIDs: string[], stored: schema_blueprint["hooks"]): Promise<Schema> {
    if (!tgt?.hooks) tgt.hooks = {};
    for await (const [stage, subroutines] of Object.entries(stored)) {
        for await (const hook of subroutines) {
            let hookID = await subroutine.call(Production, hook, systemIDs, 'hooks', stage);
            if (hookID) {
                let activeHooks = tgt.hooks?.[stage];
                if (!activeHooks) activeHooks = [hookID];
                if (!activeHooks.includes(hook)) activeHooks.push(hook);
                tgt.hooks[stage] = activeHooks;
            }
        }
    }
    return tgt;
}
export function buildRule(rule: rule_template, syntax: Syntax): [string, Successor] {
        let fullPredecessor = '';
        if(rule.leftContext) fullPredecessor +=  `(?<=${syntax.contexts[rule.leftContext]})`;
        fullPredecessor += Alphabet.alphabet[rule.strictPredecessor];
        if(rule.rightContext) fullPredecessor +=  `(?=${syntax.contexts[rule.rightContext]})`;
        if(Production.debugger!==null){
            let data = `regular expression:\n`;
            data += `leftContext = ${rule?.leftContext ?? 'none'}\n`;
            data += `strictPredecessor = ${Alphabet.alphabet[rule.strictPredecessor]} (index: ${rule.strictPredecessor})\n`;
            data += `rightContext = ${rule?.leftContext ?? 'none'}\n`;
            Production.log('load', data);
    }
        return [fullPredecessor, rule.successors.map(s => [(s[0] ?? null), Alphabet.lookup(...syntax.words[s[1]])])];
}

export async function subroutine(ID: string, systemIDs: string[], ...categories: string[]) {
    if ((!ID) || (typeof this?.[ID] === 'function')) return;
    let mod;
    mod = await require(paths.subroutine(ID, ...categories));
    if (!mod?.subroutine) throw new Error(`module ${paths.subroutine(ID, ...categories)} improperly formatted, no "subroutine" key`);
    this[ID] = mod.subroutine;
    if(mod?.systemProps)  {
        for(let systemID of systemIDs) {
            cloneRecurse (mod.systemProps, Production.systems.get(systemID));
        }
    }
    if(mod?.stateProps) {
        cloneRecurse(mod.stateProps, this);
    }
    if(mod?.stateProps) {
        cloneRecurse(mod.stateProps, this);
    }
    return ID;
}
