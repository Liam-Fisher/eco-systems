import { Debugger } from '../../helpers/debugging';
export default class InterpretationDebugger extends Debugger {
    targets;
    constructor(path, targets) {
        super(path);
        this.targets = Array.isArray(targets) ? targets : 'all';
        this.lineSymbols.set_attributes = ['‗', '‖', '┄'];
        this.lineSymbols.set_data = ['…', "⋮"];
        this.lineSymbols.set_systems = ['⌁', '‡'];
        this.lineSymbols.apply_sequence_method = ['⁍', '⁌'];
        this.lineSymbols.apply_group_method = ['⁍', '⁌'];
        this.lineSymbols.set_interpretation = ['∼', '∽'];
    }
    systemFiles(dequeuedMsg, filepath) {
        let data = `logging system data in file ${filepath} for systems: \n${dequeuedMsg.map(s => s.id).join(', ')}\n`;
        return data;
    }
    link(dequeuedMsg) {
        return `linking systems: \n ${dequeuedMsg.map(s => `data: \n${this.sData(s)}props: \n${this.sProps(s)}`).join('\n')}`;
    }
    addMethod(isSequence, module, target, letter, ...methodIDs) {
        let data = `adding ${isSequence ? 'sequence' : 'group'} methods from module ${module} for `;
        if (isSequence)
            data += `system ${target} at letter ${letter}: `;
        else
            data += `word ${target}: `;
        data += `${methodIDs.join(', ')}\n`;
        return data;
    }
    logText(stage, dequeuedMsg, info) {
        if ((!this.targets.includes(stage)) && (this.targets !== 'all'))
            return;
        switch (stage) {
            case 'write_systems': return this.log([this.systemFiles(dequeuedMsg, info[0])], stage);
            case 'write_interpretation': return this.log([`creating ${this.suffix(info[1])} interpretation file ${info[0]}\n`], stage);
            case 'write_attributes': return this.log([`creating new interpreter attributes file ${info[0]}\n`], stage);
            case 'add_sequence_method': return this.log([this.addMethod(true, info[0], info[1], info[2], ...info.slice(3))], stage);
            case 'add_group_method': return this.log([this.addMethod(false, info[0], info[1], '', ...info.slice(2))], stage);
            case 'add_props': return this.log([`added interpreter prop: ${info[0]} = ${info[1]}\n`], stage);
            case 'set_systems': return this.log([this.link(dequeuedMsg)], stage);
            case 'apply_sequence_method': return this.log([`applying sequence method ${info[0]} to system ${info[1]} (${info[2]})\narguments: ${info[3]} (${info[4]})\n`], stage);
            case 'apply_group_method': return this.log([`applying group method ${info[0]} at (${info[2]})\narguments: ${info[3]} (${info[4]})\n`], stage);
            case 'set_attributes': return this.log([`set interpreter attribute ${info[0]} to ${info[1]}\n`], stage);
            case 'set_data': return this.log([`method ${info[0]} returned data: ${info[1]}\n`], stage);
            case 'write_data': return this.log([`writing data: ${info[0]} - ${info[1]}\n`], stage);
            case 'set_interpretation': return this.log([`interpreter - ${info[0]}\n`], stage);
            case 'write_complete': return this.log([`completed ${info[0]} of ${info[1]} writes to file ${info[2]} of ${info[3]}\n`], stage);
            default: return this.log([`unknown stage ${stage}: ${info.join('\n')}\n`], stage);
        }
    }
}
