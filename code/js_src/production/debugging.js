import { Control } from '../managers/control';
import State from './state';
import { Debugger } from '../helpers/debugging';
const defaultSystemProps = ['id', 'axiom', 'schema', 'letters', 'parameters', 'parameterSize', 'maxLetters', 'age', 'terminalAge'];
export default class ProductionDebugger extends Debugger {
    targets;
    constructor(path, targets) {
        super(path);
        this.targets = Array.isArray(targets) ? targets : 'all';
        this.lineSymbols.pre_production = ['‗', '‖', '┄'];
        this.lineSymbols.per_production = ['.', "'", '•'];
        this.lineSymbols.post_production = ['…', "⋮", '⋯'];
        this.lineSymbols.pre_mapping = ['⌁', '‡'];
        this.lineSymbols.per_mapping = ['⁍', '⁌'];
        this.lineSymbols.post_mapping = ['∿', '≀', '‣'];
        this.lineSymbols.parameters = ['…', "#", '⋯'];
    }
    logMatchState(letters) {
        return `${this.suffix(State.matchCount)} match at offset ${State.pOffset} of ${letters}: ${this.pWord(State.predecessor, [State.pParameters])}\n`;
    }
    logRuleInfo(schema) {
        let data = '';
        let group = schema.regex.source.split('|')?.[State.ruleIndex];
        if (!group)
            return data;
        data += `matched ${this.suffix(State.ruleIndex)} capturing group: ${group}\n`;
        data += `successors: ${schema.successors[State.ruleIndex].map(s => `\tmap: ${s[0]} | word: ${s[1]}`).join('\n')}\n`;
        return data;
    }
    logMapState() {
        return `attempting map (${State.mapIndex + 1} of ${State.mapCount}) to ${State.successor}\n`;
    }
    logSuccessorState() {
        if (State.predecessor === State.successor)
            return `no replacement\n`;
        let data = `replaced ${State.predecessor} at ${State.pOffset}\n${this.pWord(State.predecessor, [State.pParameters])}\n`;
        data += `with ${State.successor} at ${State.sOffset}\n${this.pWord(State.successor, State.sParameters)}\n`;
        return data;
    }
    systemFiles(dequeuedMsg, filepath) {
        let data = `logging system data in file ${filepath} for systems: \n${dequeuedMsg.map(s => s.id).join(', ')}\n`;
        return data;
    }
    logHooks(stage, schema) {
        if (!(stage in schema.hooks))
            return `no hooks applied\n`;
        return `applying hooks ${schema.hooks[stage].join(', ')}\n`;
    }
    logSchema(schema) {
        let data = `\tgeneration: ${Control.age} of ${Control.terminalAge}\n`;
        data += `applying schema: ${schema.id}\n`;
        data += `with regular expression ${schema.regex.source}\n`;
        return data;
    }
    logData(stage, system, schema) {
        if ((!this.targets.includes(stage)) && (this.targets !== 'all'))
            return;
        switch (stage) {
            case 'start': return this.log([`beginning system: ${system.id} (axiom: ${system.axiom}) and schema ${system.schema}\n`], stage);
            case 'pre_production': return this.log([this.logSchema(schema), this.logHooks(stage, schema), this.sData(system), this.sProps(system)], stage);
            case 'per_production': return this.log([this.logMatchState(system.letters.length), this.logRuleInfo(schema)], stage);
            case 'pre_mapping': return this.log([this.logHooks(stage, schema)], stage);
            case 'per_mapping': return this.log([this.logMapState()], stage);
            case 'post_mapping': return this.log([this.logHooks(stage, schema), this.logSuccessorState()], stage);
            case 'post_production': return this.log([this.sData(system)], stage);
            case 'end': return this.log([`completed ${system.id} with schema ${system.schema}\n`], stage);
            default: return [`WARNING: unknown error\n`];
        }
    }
}
