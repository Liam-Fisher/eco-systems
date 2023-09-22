import Alphabet from "../helpers/alphabet";
import * as paths from '../helpers/paths';
import { Experiment } from "../managers/experiment";
import { InterpreterSchemaDefaults } from "../helpers/constants";
export default async function workerData(log, ID, index, BP, schedule) {
    let obj = {};
    obj.attrs = (BP?.attrs ?? {});
    obj.index = index;
    obj.mode = BP.mode;
    obj.formatPath = paths.formatScript(BP.format, obj.mode);
    if (log) {
        obj.debugLog = paths.debugLog(ID);
        obj.debugTargets = log;
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
    }
    ;
    return { "workerData": obj };
}
function buildWorkerSchedule(ID, schedule, tgt, fileGroupSizes) {
    if (Array.isArray(fileGroupSizes))
        return (tgt.fileGroupSizes = fileGroupSizes);
    let totalMessageCount = 0;
    schedule.forEach((entry, generation) => totalMessageCount += +(ID in entry));
    console.log(`totalMessageCount ${totalMessageCount}`);
    if (!fileGroupSizes)
        return (tgt.fileGroupSizes = [totalMessageCount]);
    tgt.fileGroupSizes = Array(Math.floor(totalMessageCount / fileGroupSizes)).fill(fileGroupSizes);
    if (totalMessageCount % fileGroupSizes)
        tgt.fileGroupSizes.push(totalMessageCount % fileGroupSizes);
}
function buildFilePaths(ID, schedule, tgt, BP) {
    let groupIndex = 0;
    let messageIndex = 0;
    tgt.systemFiles = [];
    tgt.attributeFiles = [];
    tgt.interpretedFiles = [];
    schedule.forEach((entry, generation) => {
        if (ID in entry) {
            messageIndex %= tgt.fileGroupSizes[groupIndex];
            if (BP?.printSystems)
                tgt.systemFiles.push(paths.systemFilePath(tgt.index, generation, messageIndex, groupIndex));
            if (BP?.printAttributes)
                tgt.attributeFiles.push(paths.attributesFilePath(BP.format, ID, groupIndex));
            if (messageIndex++ === 0)
                tgt.interpretedFiles.push(paths.interpretedFilePath(BP.format, ID, groupIndex++));
        }
    });
}
function buildSequenceSchema(tgt, sequenceSchema) {
    if (!sequenceSchema)
        return (tgt.sequenceSchema = null);
    let systemID, letterID, systemKey, letterKey;
    tgt.sequenceSchema = {};
    let systemIDs = Object.keys(Experiment.blueprint.systems);
    let letterIDs = Alphabet.alphabet;
    let globalSystemKeys = [];
    let globalLetterKeys = [];
    let globalMethods;
    for (let key in sequenceSchema) {
        if (key === '_') {
            globalMethods = sequenceSchema[key];
        }
        else if (!Number.isNaN(+key)) {
            globalLetterKeys.push(key);
        }
        else if (!key.includes('_')) {
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
    for (let globalSystemKey of globalSystemKeys) {
        for (let activeLetterID of letterIDs) {
            addMethods(tgt.sequenceSchema, globalSystemKey, activeLetterID, ...sequenceSchema[globalSystemKey]);
        }
    }
    for (let globalLetterKey of globalLetterKeys) {
        for (let activeSystemID of systemIDs) {
            addMethods(tgt.sequenceSchema, activeSystemID, letterIDs[globalLetterKey], ...sequenceSchema[globalLetterKey]);
        }
    }
    if (globalMethods) {
        for (let activeSystemID of systemIDs) {
            for (let activeLetterID of letterIDs) {
                addMethods(tgt.sequenceSchema, activeSystemID, activeLetterID, ...globalMethods);
            }
        }
    }
}
function addMethods(schema, system, letter, ...methods) {
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
function buildGroupSchema(tgt, groupSchema) {
    if (!groupSchema)
        return (tgt.groupSchema = null);
    tgt.groupSchema = {};
    let schemaOut = {};
    for (let key in groupSchema) {
        let words = groupSchema[key].map((wordIndex) => {
            let indexWord = Experiment.blueprint.syntax.words[wordIndex];
            return Alphabet.lookup(...indexWord);
        });
        for (let word of words) {
            schemaOut[word] ??= [];
            schemaOut[word].push(key);
        }
    }
    ;
}
function printInfo(ID, obj) {
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
