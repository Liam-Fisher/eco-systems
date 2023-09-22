import * as process from 'process';
import * as fs from 'fs';
const errorInfo = new RegExp(`((?<Type>\\w+)Error: (?<Message>.+)$)`, 'gm');
const errorLocation = new RegExp(`^\\s+at\\s(?<Object>(\\w|\\.)+)\\s?(.+)?((?<File>js_src.+\\d)|(?<Module>data.+\\d))`, 'gm');
process.on('worker', (worker) => console.log(`worker Loaded on thread ${worker.threadId}`));
export const parseError = async function (err) {
    const parsedError = {};
    const eStack = err.stack;
    for await (const match of eStack.matchAll(errorInfo)) {
        for (const prop in match.groups) {
            parsedError[prop] = match.groups[prop];
        }
    }
    for await (const match of eStack.matchAll(errorLocation)) {
        for (const prop in match.groups) {
            if (match.groups[prop]) {
                if (parsedError[prop])
                    parsedError[prop].push(match.groups[prop]);
                else
                    parsedError[prop] = [match.groups[prop]];
            }
        }
    }
    ;
    return ['parsed_error', err.message, parsedError];
};
export class Debugger {
    logIndex = 0;
    loggedIndex = 0;
    done;
    ready;
    infoFile;
    queue;
    subroutineMessages;
    lineSymbols;
    constructor(path) {
        this.lineSymbols = { "file": ['|', '|'], "load": ['!'], "schedule": ['~'], "subroutine": ["<", ">"] };
        this.queue = [];
        this.logIndex = 1;
        this.loggedIndex = 1;
        this.subroutineMessages = false;
        this.ready = true;
        this.done = false;
        this.infoFile = fs.createWriteStream(path);
        this.infoFile.write(this.line('file', 'begin'));
    }
    suffix(index) {
        return `${(+index) + 1}${(['st', 'nd', 'rd']?.[index] ?? 'th')}`;
    }
    pWord(letters, parameters) {
        let data = '';
        let line = `(0) `;
        for (let i = 0; i < letters.length; i++) {
            line += `| ${letters[i]}: ${parameters[i].map(p => p.toExponential(2)).join(' ')} `;
            if (line.length > 512) {
                data += `${line}\n`;
                line = `(${i}) `;
            }
        }
        if (line.length <= 512) {
            data += `${line}\n`;
        }
        return data;
    }
    sProps(system) {
        let propCount = 0;
        let propStrings = ``;
        for (let key in system) {
            if (['id', 'axiom', 'schema', 'letters', 'parameters', 'parameterSize', 'maxLetters', 'age', 'terminalAge'].includes(key))
                continue;
            let val = system[key];
            if (Array.isArray(val))
                val = val.join(' ');
            propStrings += `(${propCount++})\t${key}: ${val}\n`;
        }
        if (!propCount)
            return `${system.id} has no props\n`;
        return `${system.id} has ${propCount} props\n${propStrings}`;
    }
    params(parameters) {
        return `[ ${(parameters.map((param) => param.map(p => p.toExponential(2)).join(' ')).join('] ['))} ]\n`;
    }
    sData(s) {
        return `${s.id} parametric word (${s.letters.length} x ${s.parameterSize})\n${this.pWord(s.letters, s.parameters)}`;
    }
    line(key, position) {
        let sym = '_';
        if (key in this.lineSymbols) {
            let symbolSet = this.lineSymbols[key];
            if ((symbolSet.length === 1) || (!position) || (position === 'begin')) {
                sym = symbolSet[0];
            }
            if ((symbolSet.length > 1) && (position === 'end')) {
                sym = symbolSet[1];
            }
            if ((symbolSet.length === 3) && (position === 'separate')) {
                sym = symbolSet[2];
            }
        }
        return `${sym.repeat(256)}\n`;
    }
    subroutineLog(message) {
        let data = '';
        if (!this.subroutineMessages) {
            this.subroutineMessages = true;
            data += this.line('subroutine', 'begin');
        }
        else {
            data += this.line('subroutine', 'separate');
        }
        data += `" ${message} "\n`;
        return data;
    }
    log(info, stage) {
        let data = '';
        if (stage === 'subroutine') {
            data += this.subroutineLog(info[0]);
        }
        else {
            if (this.subroutineMessages) {
                this.subroutineMessages = false;
                data += this.line('subroutine', 'end');
            }
            data += `\t#${this.logIndex++} | stage: ${stage}\n`;
            data += this.line(stage, 'begin');
            data += info.join(`\n${this.line(stage, 'separate')}`);
            data += this.line(stage, 'end');
        }
        this.queue.push(data);
        if (this.ready) {
            this.dequeue();
        }
    }
    end() {
        this.done = true;
        this.queue.push(`completed\n`);
        if (this.ready) {
            this.dequeue();
        }
    }
    drained() {
        console.log(`drained`);
        this.ready = true;
        this.dequeue();
    }
    dequeue() {
        while (this.ready && this.queue.length) {
            let data = this.queue.shift();
            this.loggedIndex++;
            this.ready = this.infoFile.write(data);
        }
        ;
        if (this.queue.length) {
            console.log(`waiting drain`);
            this.infoFile.once('drain', () => this.drained());
        }
        else {
            this.ready = true;
            if (this.done) {
                this.infoFile.end(this.line('file', 'end'), () => console.log(`all logs dequeued`));
            }
        }
    }
    printRecurse(obj) {
        for (let key in obj) {
            let val = obj?.[key];
            if (typeof val === 'object') {
                this.printRecurse(Object.create(val));
            }
            else {
                this.queue.push(`\t${key}: ${val}\n`);
            }
        }
    }
}
