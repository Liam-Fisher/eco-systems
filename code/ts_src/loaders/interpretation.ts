import Alphabet from "../helpers/alphabet";

import { InterpreterWorkerData, LetterMap, interpreter_blueprint, SequenceSchemaBlueprint, SequenceSchema, GroupSchemaBlueprint, GroupSchema } from "../definitions/classes/interpretation";

import * as paths from '../helpers/paths';
import { Experiment } from "../managers/experiment";
import { InterpreterSchemaDefaults } from "../helpers/constants";
import { interpretationStage } from "../definitions/classes/experiment";

export default async function workerData(log: boolean|interpretationStage[], ID: string, index: number, BP: interpreter_blueprint, schedule: Map<number, Record<string, string[]>>) {
    let obj: Partial<InterpreterWorkerData> = {};
    obj.attrs = (BP?.attrs ?? {});
    obj.index = index;
    obj.mode = BP.mode;
    obj.formatPath = paths.formatScript(BP.format, obj.mode);
    if(log) {
        obj.debugLog = paths.debugLog(ID);
        obj.debugTargets =  log;
    }
    console.log(`formatPath: ${obj.formatPath}`);
    obj.methodModule = paths.interpretationModule(obj.mode, BP?.method);
    buildWorkerSchedule(ID, schedule, obj, BP?.fileGroupSizes);
    buildFilePaths(ID, schedule, obj, BP);
    buildGroupSchema(obj, BP?.groupSchema);
    buildSequenceSchema(obj, BP?.sequenceSchema);

    if (!(obj?.groupSchema || obj?.sequenceSchema)) {
        let defaults = InterpreterSchemaDefaults?.[BP.format] ?? InterpreterSchemaDefaults.dict;
        [obj.groupSchema, obj.sequenceSchema] = defaults[+(obj.mode === 'storing')];
    };
    //printInfo(ID, obj);
    return { "workerData": (obj as InterpreterWorkerData) };
}
function buildWorkerSchedule(ID: string, schedule: Map<number, Record<string, string[]>>,tgt: Partial<InterpreterWorkerData>, fileGroupSizes?: number | number[]) {
    if (Array.isArray(fileGroupSizes)) return (tgt.fileGroupSizes = fileGroupSizes);
        let totalMessageCount = 0;
        schedule.forEach((entry, generation) => totalMessageCount += +(ID in entry));
        console.log(`totalMessageCount ${totalMessageCount}`);
        if (!fileGroupSizes)  return (tgt.fileGroupSizes =  [totalMessageCount]);
        tgt.fileGroupSizes = Array(Math.floor(totalMessageCount / fileGroupSizes)).fill(fileGroupSizes);
        if (totalMessageCount % fileGroupSizes) tgt.fileGroupSizes.push(totalMessageCount % fileGroupSizes);
}
function buildFilePaths(ID: string, schedule: Map<number, Record<string, string[]>>, tgt: Partial<InterpreterWorkerData>, BP: interpreter_blueprint) {
    let groupIndex = 0;
    let messageIndex = 0;
    tgt.systemFiles = [];
    tgt.attributeFiles = [];
    tgt.interpretedFiles = [];
    schedule.forEach((entry, generation) => {
        if (ID in entry) {
            messageIndex %= tgt.fileGroupSizes[groupIndex];
            if (BP?.printSystems) tgt.systemFiles.push(paths.systemFilePath(tgt.index, generation, messageIndex, groupIndex));
            if (BP?.printAttributes) tgt.attributeFiles.push(paths.attributesFilePath(BP.format, ID, groupIndex));
            if (messageIndex++ === 0) tgt.interpretedFiles.push(paths.interpretedFilePath(BP.format, ID, groupIndex++));
        }
    });
}
// four types of key syntax. values are always an array of methods that are exports of the method module 
// _: adds the methods for every letter of 
// <number>: (refers to an index of blueprint.syntax.letters), add the method(s) to every system for that letter  
// <string>: (refers to a key of blueprint.systems), adds the methods at every letter for that system
// <string>_<number>: adds the methods for the system (string), at the letter (number)
// <number>_<number>: adds the methods for the nth system, at the letter (number) 
function buildSequenceSchema(tgt: Partial<InterpreterWorkerData>, sequenceSchema?: SequenceSchemaBlueprint) {
    if (!sequenceSchema) return (tgt.sequenceSchema = null);
    let systemID, letterID, systemKey, letterKey;
    tgt.sequenceSchema = {};
    let systemIDs = Object.keys(Experiment.blueprint.systems);
    let letterIDs = Alphabet.alphabet;
    let globalSystemKeys: string[] = [];
    let globalLetterKeys: string[] = [];
    let globalMethods: string[];
    for (let key in sequenceSchema) {
        if(key === '_') {
            globalMethods  = sequenceSchema[key];
        }
        else if (!Number.isNaN(+key)) {
            globalLetterKeys.push(key);
        }
        else if(!key.includes('_')) {
            globalSystemKeys.push(key);
        }
        else {
            systemID = key.split('_')[0]; 
            letterID = key.split('_')[1]; 
            systemKey = (Number.isNaN(+systemID)) ? systemID : systemIDs[systemID];
            letterKey = (Number.isNaN(+letterID)) ? letterID : letterIDs[letterID];
            addMethods(tgt.sequenceSchema, systemKey, letterKey, ...sequenceSchema[key]);
        }
    }
    for(let globalSystemKey of globalSystemKeys) {
        for(let activeLetterID of letterIDs) {
            addMethods(tgt.sequenceSchema, globalSystemKey, activeLetterID, ...sequenceSchema[globalSystemKey]);
        }
    }
    for (let globalLetterKey of globalLetterKeys) {
        for (let activeSystemID of systemIDs) {
            addMethods(tgt.sequenceSchema, activeSystemID, letterIDs[globalLetterKey], ...sequenceSchema[globalLetterKey]);
        }
    }
    if(globalMethods) {
        for (let activeSystemID of systemIDs) {
            for(let activeLetterID of letterIDs) {
                addMethods(tgt.sequenceSchema, activeSystemID, activeLetterID, ...globalMethods);
            }
        }
    }
}
function addMethods(schema: Record<string, Record<string, string[]>>, system: string, letter: string, ...methods: string[]){
    //console.log(`adding methods ${methods} to system ${system} at letter ${letter}`);
    schema[system] ??= {};
    if (letter in schema[system]) {
        for (let method of methods) {
            if (!schema[system][letter].includes(method)) {
                schema[system][letter].push(method);
            }
        }
    }
    else {
        schema[system][letter] = methods;
    }
}
// method: wordIndices -> word: methods

function buildGroupSchema(tgt: Partial<InterpreterWorkerData>, groupSchema?: GroupSchemaBlueprint): GroupSchema {
    if (!groupSchema) return (tgt.groupSchema = null);
    tgt.groupSchema = {};
    let schemaOut: GroupSchema = {};
    for (let key in groupSchema) {
        let words = groupSchema[key].map((wordIndex) => {
            let indexWord = Experiment.blueprint.syntax.words[wordIndex];
            return Alphabet.lookup(...indexWord);
        });
        for (let word of words) {
            schemaOut[word] ??= [];
            schemaOut[word].push(key);
        }
    };
}
function printInfo(ID: string, obj: object) {
    for (let key in obj) {
        let val = obj[key];
        if (typeof val !== 'object') {
            console.log(`keys are ${ID}: ${key}, value is  ${val}`);
        }
        else if (Array.isArray(val) && (!val.some(e => typeof e === 'object'))) {
            console.log(`keys are ${ID}: ${key}, values are ${val.join(' ')}`);

        }
        else {
            printInfo(`${ID}: ${key}`, val);
        }
    }
}

/*
function buildSequenceSchema(tgt: Partial<InterpreterWorkerData>, sequenceSchema?: SequenceSchemaBlueprint) {
    if (!sequenceSchema) return (tgt.sequenceSchema = null);
    tgt.sequenceSchema = {};
    let systemIDs: string[] = [];
    let letterIDs: number[] = [];
    for (let key in sequenceSchema) {
        if (!Number.isNaN(+key)) {
            letterIDs.push(+key);
        }
        else if(!key.includes('_')) {
            systemIDs.push(key)
        }
        else {
            let systemID: string = key.split('_')[0];
            let letterKey: string = Alphabet.alphabet[(+key.split('_')[1])];
            if (!Number.isNaN(+systemID)) {
                systemID = Object.keys(Experiment.blueprint.systems)[systemID];
            }
            if (!(systemID in tgt.sequenceSchema)) {
                tgt.sequenceSchema[systemID] = {};
            }
            tgt.sequenceSchema[systemID][letterKey] = sequenceSchema[key];
        }
    }
    for(let systemID of systemIDs) {
        let methods = sequenceSchema[systemID];
        for(let letterKey of Alphabet.alphabet) {
            addMethods(tgt.sequenceSchema, letterKey, systemID, ...methods);
        }
    }
    for (let letter of letterIDs) {
        let methods = sequenceSchema[letter];
        for (let systemID in tgt.sequenceSchema) {
            addMethods(tgt.sequenceSchema, Alphabet.alphabet[letter], systemID, ...methods);
        }
    }
}
function addMethods(schema: Record<string, Record<string, string[]>>, letterKey: string, systemID: string, ...methods: string[]){
    if (!(systemID in schema)) {
        schema[systemID] = {};
    }
    if (letterKey in schema[systemID]) {
        for (let method of methods) {
            if (!schema[systemID][letterKey].includes(method)) {
                schema[systemID][letterKey].push(method);
            }
        }
    }
    else {
        schema[systemID][letterKey] = methods;
    }
}
*/