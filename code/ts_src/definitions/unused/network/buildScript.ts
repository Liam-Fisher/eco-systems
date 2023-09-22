import Network from '../network';
import { experiment_blueprint } from '../../classes/experiment';
import { loadPatcher, readMsg, setAttrs, setFilepath } from './formatters';
import mediaLifecycle from './mediaObjects';
import * as paths from '../../../helpers/paths';
import {writeFile} from 'fs/promises';
import { attrs } from '../../static/interfaces';
import { GlobalMaxClass, LocalMaxClass } from '../../classes/network';
/*
export default async function build_script(BP: experiment_blueprint) {
        let {media,patchers,objects,interpreters, interpretations} = BP;
        Network.reset(interpreters);
        console.log(`building script`);
        for(let mediaFile of media) {
            console.log(`building media file ${mediaFile.filename}`);
            for(let newPatcherID of mediaFile.patchers) {
                if(Network.activePatcherIDs.has(newPatcherID)) continue;
                console.log(`adding patcher ${newPatcherID}`);
                let patcher = patchers?.[newPatcherID];
                if(!patcher) throw new Error(`patcher ${newPatcherID} not loaded`); 
                Network.activePatcherIDs.add(newPatcherID);
                loadPatcher(newPatcherID, patcher);
                for(let newObjectID of patcher.fileObjects) {
                    if(Network.activeObjectIDs.has(newObjectID)) continue;
                    let obj = objects[newObjectID];  
                    let interpreter = interpreters[obj.interpreterID];
                    let attrs = interpreter?.attrs ?? {};
                    let interpretation = interpretations[interpreter.interpretation];
                    let maxclass = interpretation?.format;
                    setAttrs(newPatcherID, newObjectID, interpreters[obj.interpreterID].attrs);
                    Network.writeLine((obj?.loadtime ?? 0), `${newPatcherID} ${readMsg(newObjectID, (setFilepath(obj, maxclass)), maxclass, attrs)}`);
                }
            }
            for(let oldID of Network.activePatcherIDs){
                if (mediaFile.patchers.includes(oldID)) continue;
                console.log(`removing patcher ${oldID}`);
                Network.activePatcherIDs.delete(oldID);
                Network.writeLine(100, `${oldID} wclose`);
            }
            mediaLifecycle(mediaFile);
    }
    for(let remainingID of Network.activePatcherIDs) {
        Network.writeLine(100, `${remainingID} wclose`);
    }
    await writeFile(paths.networkScript(), Network.file);
}
*/
/*

const jxfTemplate = Buffer.from([
    70, 79, 82, 77, 
    0, 0, 0, 0, 
    74, 73, 84, 33, 
    70, 86, 69, 82, 
    0, 0, 0, 12, 
    60, 147, 220, 128, 
    77, 84, 82, 88, 
    0, 0, 0, 0, 
    0, 0, 0, 28, 
    70, 76, 54, 52, 
    0, 0, 0, 0, 
    0, 0, 0, 1, 
    0, 0, 0, 1]);

const matrixFormats = [[1, 'UInt8', 'CHAR'],[4, 'UInt32', 'LONG'],[4, 'Float', 'CHAR'],[8, 'Double', 'FL64']];
export const compile_matrix = function(sysID: string, fileID: string, params: number[][], matrixType?: 0|1|2|3) {
    
    let pCount =  params.length;
    let pLen = Math.max(...params.map(p => p.length));
    let filesize = pLen*pCount*8+52;
    let buf = Buffer.alloc(filesize, 0);
    jxfTemplate.copy(buf);
    buf.writeUInt32BE(filesize,4);
    buf.writeUInt32BE(filesize-24,28);
    buf.writeUInt32BE(pLen,40);
    buf.writeUInt32BE(pCount,48);
    let offset = 52;
    for (const letterParams of params) {
          for(let i=0;i<pLen;i++) {
               if(letterParams.length>i){
                    buf.writeDoubleBE(letterParams[i],offset);
               }
               offset += 8;
          }
     }
};
export const write_text = async function (sysID: string, patcherID: string, mode: InterpretationMode, cycle: number, letters: string, ...args: number[]) {

    let targetDict = CtrlClass.fileDicts.get(patcherID);
    if (!targetDict) throw new Error(`unable to find file dictionary for patcher ${patcherID}`);
    let first = !targetDict?.filein;
    if (first) throw new Error(`unable to find file entry ${} for patcher ${patcherID}`);
    let targetEntry = !targetDict?.filein;

    let offset = 0;
    let str = '';
    let maxAsciiSize = Math.max(...([...Alphabet.asciiTranslations].map(ascii => ascii[1].length)));
    let line_length = Math.floor((args?.[0] ?? (255)) / maxAsciiSize);
    let translatedLetters = Alphabet.translateAscii(letters);
    let filename: string = mode;
    let mode = mode === 'stream';
    if (first) targetDict.filein = {};

    while (offset < translatedLetters.length) {
        str += `${translatedLetters.slice(offset, offset + line_length)}\n`;
        offset += line_length;
    }
    str += `${translatedLetters.slice(offset)}`;
    if (mode) {
        await CtrlClass.append(sysID, filename, str);

    }
};

/*
export const write_matrix = async function(sysID: string, fileID: string, params: number[][]) {
    let pCount =  params.length;
    let pLen = Math.max(...params.map(p => p.length));
    let filesize = pLen*pCount*8+52;
    let buf = Buffer.alloc(filesize, 0);
    jxfTemplate.copy(buf);
    buf.writeUInt32BE(filesize,4);
    buf.writeUInt32BE(filesize-24,28);
    buf.writeUInt32BE(pLen,40);
    buf.writeUInt32BE(pCount,48);
    let offset = 52;
    for await(const letterParams of params) {
          for(let i=0;i<pLen;i++) {
               if(letterParams.length>i){
                    buf.writeDoubleBE(letterParams[i],offset);
               }
               offset += 8;
          }
     }
     await CtrlClass.writeOutput(sysID, fileID, 'jxf', buf);
};
*/
