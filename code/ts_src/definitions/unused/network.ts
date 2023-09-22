import { interpreter_blueprint } from '../classes/interpretation';

export default class Network  {
    static activePatcherIDs: Set<string>;
    static activeObjectIDs: Set<string>;
    static lineIndex: number;
    static file: string;
    static addIDs: string[];
    static delIDs: string[];
    static positions: Record<string, [number, number]>;
    static interpreterFilePaths: Record<string, string[]>;                                            
    static reset(interpretations: Record<string, interpreter_blueprint>)   {
        [this.file,this.addIDs,this.delIDs,this.activePatcherIDs,this.activeObjectIDs,this.lineIndex] = ['',[],[],(new Set()),(new Set()),0];
        this.interpreterFilePaths = {};
        for(let ID of Object.keys(interpretations)) {
            this.interpreterFilePaths[ID] = [];
        }
        this.positions = {   
            "table": [50, 0],
            "jit.matrix": [150, 0],
            "dict": [300,0],
            "coll": [400,0],
            "buffer~": [ 500,0],
            "texture": [ 750,0],
            "material": [1000,0],
            "shader": [1300,0],
            "pass": [1500,0]
        };
    }
    static writeLine(delay: number, str: string){ // 1 is asap, 0 is await
        this.file += `${str};\n${delay} ${this.lineIndex++};\n`;
    }
};