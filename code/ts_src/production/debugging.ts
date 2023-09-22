
import * as paths from '../helpers/paths';
import * as fs from 'fs';
import { System } from './system';
import { Schema } from './schema';
import { Control } from '../managers/control';
import State from './state';
import { SystemClass } from '../definitions/classes/system';
import { productionStage } from '../definitions/classes/experiment';
import { Debugger } from '../helpers/debugging';
const defaultSystemProps = ['id','axiom', 'schema', 'letters', 'parameters', 'parameterSize', 'maxLetters', 'age', 'terminalAge'];

export default class ProductionDebugger extends Debugger {
    targets: productionStage[]|'all'
    constructor(path: string, targets?: productionStage[]|boolean){
        super(path);
        this.targets = Array.isArray(targets) ? targets : 'all'; 
        this.lineSymbols.pre_production = ['‗', '‖','┄'];
        this.lineSymbols.per_production = ['.', "'", '•'];
        this.lineSymbols.post_production = ['…', "⋮",'⋯'];
        this.lineSymbols.pre_mapping = ['⌁', '‡'];
        this.lineSymbols.per_mapping = ['⁍', '⁌'];
        this.lineSymbols.post_mapping = ['∿', '≀','‣'];
        this.lineSymbols.parameters = ['…', "#",'⋯'];
    } 
    logMatchState(letters: number) {
        return `${this.suffix(State.matchCount)} match at offset ${State.pOffset} of ${letters}: ${this.pWord(State.predecessor, [State.pParameters])}\n`;
    }
    logRuleInfo(schema: Schema) {
        let data: string = '';
        let group = schema.regex.source.split('|')?.[State.ruleIndex]; 
        if(!group) return data;
        data += `matched ${this.suffix(State.ruleIndex)} capturing group: ${group}\n`;
        data += `successors: ${schema.successors[State.ruleIndex].map(s => `\tmap: ${s[0]} | word: ${s[1]}`).join('\n')}\n`; 
        return data;
    }
    logMapState() {
        return `attempting map (${State.mapIndex+1} of ${State.mapCount}) to ${State.successor}\n`;
    }
    logSuccessorState() {
        if(State.predecessor === State.successor) return `no replacement\n`;
        let data = `replaced ${State.predecessor} at ${State.pOffset}\n${this.pWord(State.predecessor, [State.pParameters])}\n`;
        data += `with ${State.successor} at ${State.sOffset}\n${this.pWord(State.successor, State.sParameters)}\n`;
        return data;
    }
    systemFiles(dequeuedMsg: SystemClass[], filepath: string){
        let data = `logging system data in file ${filepath} for systems: \n${dequeuedMsg.map(s=>s.id).join(', ')}\n`;
        return data; 
    }
    logHooks(stage: productionStage, schema: Schema){
        if(!(stage in schema.hooks)) return `no hooks applied\n`;
        return `applying hooks ${schema.hooks[stage].join(', ')}\n`;
    }
    logSchema(schema: Schema){
        let data = `\tgeneration: ${Control.age} of ${Control.terminalAge}\n`;
        data += `applying schema: ${schema.id}\n`;
        data += `with regular expression ${schema.regex.source}\n`;
        return data;
    }
    logData(stage: productionStage, system: System, schema?: Schema) {
        if((!this.targets.includes(stage))&&(this.targets!=='all')) return;
        switch (stage) {
            case 'start': return this.log([`beginning system: ${system.id} (axiom: ${system.axiom}) and schema ${system.schema}\n`], stage);
            case 'pre_production': return this.log([this.logSchema(schema), this.logHooks(stage,schema), this.sData(system),this.sProps(system)], stage);
            case 'per_production':return this.log([this.logMatchState(system.letters.length), this.logRuleInfo(schema)], stage);
            case 'pre_mapping': return this.log([this.logHooks(stage, schema)], stage);
            case 'per_mapping': return this.log([this.logMapState()], stage);
            case 'post_mapping':return this.log([this.logHooks(stage, schema), this.logSuccessorState()], stage);
            case 'post_production':  return this.log([this.sData(system)], stage);
            case 'end':  return this.log([`completed ${system.id} with schema ${system.schema}\n`], stage);
            default: return [`WARNING: unknown error\n`];
        }
    }
         
}
/*
export default class ProductionDebugger {
    logIndex: number = 0;
    loggedIndex: number = 0;
    done: boolean;
    ready: boolean;
    infoFile: fs.WriteStream;
    queue: string[];
    subroutineMessages: boolean
    targets: productionStage[]|'all'
    constructor(path: string, targets?: productionStage[]){
        this.targets = targets ?? 'all';
        this.queue = [];
        this.logIndex++;
        this.loggedIndex++;
        this.subroutineMessages = false;
        this.ready = true;
        this.done = false;
        this.infoFile = fs.createWriteStream(path);
        this.infoFile.write(`${'|'.repeat(256)}\n`);
    }
    get predecessor(){
        return `| ${State.predecessor}: [ ${State.pParameters.map(p => p.toExponential(4)).join(' ')} ]`;
    }       
    logMatchState(letters: number) {
        return `${suffix(State.matchCount)} match at offset ${State.pOffset} of ${letters}: ${this.predecessor}\n`;
    }
    logRuleInfo(schema: Schema) {
        let group = schema.regex.source.split('|')?.[State.ruleIndex]; 
        if(!group) return '';
        return `${suffix(State.ruleIndex)} capturing group: ${group}\n`;
    }
    logMapState() {
        return `attempting map (${State.mapIndex+1} of ${State.mapCount}) to ${State.successor}\n`;
    }
    logSuccessorState() {
        if(State.predecessor === State.successor) return `no replacement\n`;

        return `replaced ${pWord(State.predecessor, [State.pParameters])} at ${State.pOffset}\nwith ${State.successor} at ${State.sOffset}\n${pWord(State.successor, State.sParameters)}\n`;
    }
    subroutineLog(id: string, message: string) {
        let data: string = '';
        if(!this.subroutineMessages){
            this.subroutineMessages = true;   
            data += `${'<'.repeat(256)}\n`;
        }
        data += `${id}: " ${message} "\n`;
        this.queue.push(data);
    }
    systemFiles(dequeuedMsg: SystemClass[], filepath: string){
        let data = `logging system data in file ${filepath} for systems: \n${dequeuedMsg.map(s=>s.id).join(', ')}\n`;
        return data; 
    }
    loadLog(component: string, data: string){
        this.queue.push(`${'!'.repeat(256)}\nloaded ${component} ${data}\n`);
        if(this.ready)  {
            this.dequeue();
            }
    }


    productionLog(stage: productionStage, system: System, schema?: Schema) {
        let data: string = '';
        if(this.subroutineMessages) {
            this.subroutineMessages = false;   
            data += `${'>'.repeat(256)}\n`;
        }
        data += `${'_'.repeat(256)}\n`;
        data += `\t#${this.logIndex++} | stage: ${stage}\n`;
        switch (stage) {
            
            case 'start': 
            data += `${'_'.repeat(256)}\n`;
            data += `beginning system: ${system.id} (axiom: ${system.axiom}) and schema ${system.schema}\n`;
            data += `${'_'.repeat(256)}\n`;
            break;
            case 'pre_production':
                data += `${':'.repeat(256)}\n`;
                data += `\tgeneration: ${Control.age} of ${Control.terminalAge}\n`;
                data += `beginning production cycle with system: ${system.id} and schema ${schema.id}\n`;
                data += `regular expression: ${schema.regex.source}\n`;
                data += `${'~'.repeat(256)}\n`;
                data += this.logHooks(stage, schema);
                data += `${'~'.repeat(256)}\n`;
                data += this.logBasicSystemInfo(system);
                data += `${'~'.repeat(256)}\n`;
                data += this.logProps(system);
                data += `${":".repeat(256)}\n`;
                break;
            case 'per_production':
                data += `${'.'.repeat(256)}\n`;
                data += this.logMatchState(system.letters.length);
                data += `${'-'.repeat(256)}\n`;
                data += this.logRuleInfo(schema);
                data += `${"'".repeat(256)}\n`;
                break;
            case 'pre_mapping':
                data += `${'x'.repeat(256)}\n`;
                data += this.logHooks(stage, schema);
                data += `${'*'.repeat(256)}\n`;
                break;
            case 'per_mapping':
                data += `${'='.repeat(256)}\n`;
                data += this.logMapState();
                data += `${'='.repeat(256)}\n`;
                break;
            case 'post_mapping':
                data += `${'v'.repeat(256)}\n`;
                data += this.logHooks(stage, schema);
                data += this.logSuccessorState();
                data += `${'^'.repeat(256)}\n`;
                break;
            case 'post_production':  
                data += `${':'.repeat(256)}\n`;
                data += `completed production cycle with system: ${system.id} and schema ${schema.id}\n`;
                data += `${'~'.repeat(256)}\n`;
                data += this.logHooks(stage, schema);
                data += `${":".repeat(256)}\n`;
                break;
            case 'end':  
                data += `${'_'.repeat(256)}\n`;
                data += `completed ${system.id} with schema ${system.schema}\n`;
                data += `${'_'.repeat(256)}\n`;
                break;
            default:
                data += `WARNING: unknown error\n`;
        }
        this.queue.push(data);
        if(this.ready)  {
            this.dequeue();
        }
    }
    end(){
        this.done = true;
        this.queue.push(`${this.target} completed\n`);
        if(this.ready)  {
            this.dequeue();
        }
    }
    drained() {
        console.log(`drained`);
        this.ready = true;
        this.dequeue();
    }
    dequeue() {
        while(this.ready&&this.queue.length) {
            let data = this.queue.shift();
            this.loggedIndex++;
            this.ready = this.infoFile.write(data);
        };
        if(this.queue.length) {
            console.log(`waiting drain`);
            this.infoFile.once('drain', () => this.drained());
        }
        else {
            this.ready = true;
            if(this.done) {
                this.infoFile.end(`${'|'.repeat(256)}`, () => console.log(`all logs dequeued`));
            }
        }
}
printRecurse(obj: any|any[]) {
    for(let key in obj) {
        let val = obj?.[key];
        if(typeof val === 'object') {
            this.printRecurse(Object.create(val));
        }
        else {
            this.queue.push(`\t${key}: ${val}\n`);
        }
    }
}
         
}
*/