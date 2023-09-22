"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();
const { pipeline } = require('stream');
const { createWriteStream } = require('fs');
const { join, format } = require('path');
const { cwd } = require('process');
console.log(`cwd: ${cwd()}`);
const dir = join(cwd(), 'code', 'testing', 'js');
console.log(`dir: ${dir}`);
let a = ['A', 'B']
let syntaxes = ['#0#', '#1#'];

let re = RegExp(`(${syntaxes.map(s => {
    return s.replaceAll(/#(\d+)#/g, (...args) => a[args[1]])
}).join(')|(')})`, 'g');

const TestSystem = {
    "letters": "B",
    "parameters": [[-1,0]]
}

const Data = class  {
    static reset() {
        this.letters = '';
        this.match = 0;
        this.rule = -1;
        this.params = [];
    }
    static set input(regexMatchArgs) {
        this.map = 0;
        this.sParams = [];
        console.log(`args In ${regexMatchArgs.join('-')}`);
        regexMatchArgs.pop();
        this.predecessor = regexMatchArgs.shift();
        this.offset = regexMatchArgs.pop();
        this.rule = regexMatchArgs.findIndex(el => el !== undefined);
        console.log(`offset ${Data.offset} rule ${Data.rule}`);
    }
    static get output() {
        if (this.sParams.length !== this.successor.length) [this.successor, this.sParams] = [this.predecessor, this.pParams];
        this.params.push(...this.sParams);
        this.match++;
        return this.successor;
    }
    static MapA(sys) {
        if(this.offset%3) return [];
        console.log(`successor into A ${this.successor}`); 
        let pOut = (new Array(this.successor.length)).fill([24, this.rule]);
        return pOut;
    }
}

function callMethod(system, methodID) {
    if (!(methodID && (typeof Data?.[methodID] === 'function'))) return [];
    console.log(`function ${methodID} called`);
    return Data[methodID](system);
}

function replacer(system, schema) {
    Data.reset();
    console.log(`regexp ${schema.regex.source}`);
    return system.letters.replaceAll(schema.regex, (...regexpMatchArgs) => {
        regexMatchArgs.pop();
        Data.map = 0;
        Data.sParams = [];
        Data.predecessor = regexMatchArgs.shift();
        Data.offset = regexMatchArgs.pop();
        Data.rule = regexMatchArgs.findIndex(el => el !== undefined);
        let activeRule = schema.rules?.[Data.rule];
        if (activeRule) {
            if(schema?.hooks?.pre_production)    
            Data.maps = Math.min(rule.successors.length, rule.maps.length);
            console.log(`maps ${Data.maps}`);
            while (Data.map < Data.maps) {
                console.log(`map ${Data.map}`);
                Data.successor = rule.successors[Data.map];
                Data.sParams = callMethod(system, rule.maps[Data.map++]);
                
                console.log(`successor ${Data.successor} param ${Data.sParams.join('|')}`);
                if (Data.sParams.length) break;
            }
            mapper(system, rule);
        }
        return Data.output;
    });
}

function setup(system, schema) {
    regexMatchArgs.pop();
    Data.map = 0;
    Data.sParams = [];
    this.predecessor = regexMatchArgs.shift();
    this.offset = regexMatchArgs.pop();
    Data.rule = regexMatchArgs.findIndex(el => el !== undefined);
    console.log(`offset ${Data.offset} rule ${Data.rule}`);
    if ((Data.rule === -1) || (schema.rules.length <= Data.rule)) return null;
    let rule = schema.rules?.[Data.rule];
    Data.pParams = callMethod(system, rule?.metric) ?? system.parameters.slice(Data.offset, Data.predecessor.length);
    console.log(`pParams ${Data.sParams} p ${Data.successor}`);
    return schema.rules[Data.rule];
}

function mapper(system, rule) {
    Data.maps = Math.min(rule.successors.length, rule.maps.length);
    console.log(`maps ${Data.maps}`);
    while (Data.map < Data.maps) {
        console.log(`map ${Data.map}`);
        Data.successor = rule.successors[Data.map];
        Data.sParams = callMethod(system, rule.maps[Data.map++]);
        
        console.log(`successor ${Data.successor} param ${Data.sParams.join('|')}`);
        if (Data.sParams.length) break;
    }
    console.log(`sParams ${Data.sParams} s ${Data.successor}`);
}
Data["MapB"] = require(join(dir, 'sr.js')).subroutine;


let rule = -1;
const TestSchema = {
    rules: [
        {
            "successor": "UU"
        },
        {
            "successor": "WW"
        },
        {
            "successor": "XX"
        },
        {
            "successor": "YY"
        },
        {
            "successor": "ZZ"
        }
    ]
};