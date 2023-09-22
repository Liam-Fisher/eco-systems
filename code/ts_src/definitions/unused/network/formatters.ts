
import * as paths from '../../../helpers/paths'
import Network  from "../network";
import { attrs } from "../../static/interfaces";
import { GlMaxClass, GlobalMaxClass, LocalMaxClass, MediaMaxClass, object_blueprint, patcher_blueprint } from '../../classes/network';
import { DictionaryFormats, MaxClassesNamespaces } from '../../../helpers/constants';

export function mediaConnect(input: 'to'|'from', tgt: string, index: number) {
    let msg = `inx script connect `;
    if(input === 'from') msg += `${tgt} 0 writer ${index}`;
    else msg += `writer ${index} ${tgt} 0`;
    networkMsg(10, msg, 'media', 'object');
}
export function networkMsg(delay: number, scriptMsg: string, ...tgts:string[]) {
    let msg = 'NETWORK ';
    if(tgts.length) msg += `${tgts.join('::')} `;
    msg += scriptMsg;
    Network.writeLine(delay, msg);
}

export function setFilepath(obj: object_blueprint, maxclass: keyof (GlobalMaxClass&GlMaxClass&MediaMaxClass&LocalMaxClass)){
    if(maxclass in DictionaryFormats) {
        maxclass = 'dict';
    }
    let path = paths.globalFilePath(maxclass as string, obj);
    Network.interpreterFilePaths[obj.interpreterID][obj.fileIndex] = path;
    return path;
}
export function loadPatcher(ID: string, BP: patcher_blueprint) {
    let loadMsg = `${BP.loadMode} ${paths.patcher(BP.filename)} ${ID}`;
    if(BP?.args) loadMsg += ` ${BP.args.join(' ')}`;
    networkMsg(2000, loadMsg);
}

export function newObj(maxclass: (keyof (GlobalMaxClass&GlMaxClass&MediaMaxClass)), varname: string, pos: [number, number], attrs: attrs["attrs"], args?: (string|number)[]) {
    let objText= `${maxclass} `;
    if(MaxClassesNamespaces[maxclass] === 'gl') objText = `jit.gl.${maxclass}global-ctx @name ${varname}`
    else if (args) objText += args.join(' ');
    else if(maxclass === 'buffer~') objText += varname;
    else if(maxclass === 'coll') objText += `${varname} 1`;
    else objText += `@name ${varname}`;
    objText += Object.entries(attrs).map(attr => ` @${attr[0]} ${Array.isArray(attr[1]) ? attr[1].join(' ') : attr[1]}`).join(' ');
    return `inx script newobject newobj @text "${objText}"  @patching_position ${pos.join(' ')} @varname ${varname}`;
}


export function readMsg(varname: string, filepath: string, maxclass: (keyof (GlobalMaxClass&GlMaxClass&MediaMaxClass&LocalMaxClass)), attrs?: attrs["attrs"]){
    let msg = `script send ${varname}`; 
    let maxpath = paths.max(filepath);
    if(maxclass === 'buffer~') return `${msg} readraw "${maxpath}" ${attrs?.channels??1} `;
    else if(maxclass === 'material') return `${msg} import_material "${maxpath}"`;
    else return `${msg} read "${maxpath}"`;
}
export function setAttrs(patcherID: string, objectID: string, attrs: attrs["attrs"]){
    for(let attrName in attrs) {
        let val = attrs[attrName];
        if(Array.isArray(attrs)) val = attrs.join(' '); 
        Network.writeLine(10, `${patcherID} script send ${objectID} ${attrName} ${val}`);
    }
}
