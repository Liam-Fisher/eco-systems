"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../helpers/constants");
const paths = require("../helpers/paths");
const network_1 = require("../managers/network");
const formatters_1 = require("./formatters");
function editObjects(ID, BP, interpreters, global, local) {
    console.log(`editing object for patcher ${ID}`);
    let objNames = editGlobalObjects(BP, interpreters, global, local);
    if (local) {
        for (let globalClass in objNames) {
            network_1.default.writeLine(10, `${ID} globals ${globalClass} ${objNames[globalClass].join(' ')}`);
        }
        editLocalObjects(ID, BP, local, interpreters);
    }
}
exports.default = editObjects;
function editGlobalObjects(BP, interpreters, global, local) {
    let objs = {};
    for (let objIndex of BP.globalObjects) {
        console.log(`getting object at index ${objIndex}`);
        let obj = global[objIndex];
        let varname = paths.maxVarName(obj);
        console.log(`editing object ${varname}`);
        if (!local) {
            console.log(`deleting object ${varname}`);
            network_1.default.remoteMsg(10, `delete ${varname}`, 'data');
        }
        else {
            console.log(`adding object ${varname}`);
            let maxclass = interpreters[obj.interpreterID]?.format;
            if (maxclass in constants_1.DictionaryFormats) {
                maxclass = 'dict';
            }
            if (!(maxclass in objs)) {
                objs[maxclass] = [];
            }
            objs[maxclass].push(addGlobalObj(obj, varname, maxclass, interpreters[obj.interpreterID]?.attrs));
        }
    }
    return objs;
}
function addGlobalObj(obj, varname, maxclass, attrs) {
    console.log(`adding a ${maxclass} object`);
    let pos = network_1.default.positions[maxclass];
    pos[1] += 100;
    network_1.default.remoteMsg(100, (0, formatters_1.newObj)(maxclass, varname, pos, attrs), 'data');
    let experimentPath = paths.experimentOutput(maxclass, obj);
    network_1.default.remoteMsg((obj?.loadtime ?? 1000), `send ${(0, formatters_1.readMsg)(experimentPath, maxclass, attrs)}`, 'data', varname);
    console.log(`setting experiment Path for ${obj.interpreterID} ${obj.fileIndex} to ${experimentPath}`);
    network_1.default.interpreterFilePaths[obj.interpreterID][obj.fileIndex] = {
        "experiment": experimentPath
    };
    return varname;
}
function editLocalObjects(ID, BP, local, interpreters) {
    for (let objFileName of BP.localObjects) {
        let obj = local[objFileName];
        setLocalAttrs(ID, objFileName, interpreters[obj.interpreterID].attrs);
        setLocalFilepaths(obj, BP.filename, objFileName, interpreters[obj.interpreterID]?.format);
    }
}
function setLocalFilepaths(obj, patcherFile, objFile, maxclass) {
    console.log(`setting experiment Path for ${obj.interpreterID} ${obj.fileIndex} to ${paths.experimentOutput(maxclass, obj)}`);
    console.log(`setting patcher Path for ${obj.interpreterID} ${obj.fileIndex} to ${paths.localFilePath(patcherFile, objFile, maxclass)}`);
    network_1.default.interpreterFilePaths[obj.interpreterID][obj.fileIndex] = {
        "experiment": paths.experimentOutput(maxclass, obj),
        "patcher": paths.localFilePath(patcherFile, objFile, maxclass)
    };
}
function setLocalAttrs(patcherID, objectID, attrs) {
    for (let attrName in attrs) {
        let val = attrs[attrName];
        if (Array.isArray(attrs))
            val = attrs.join(' ');
        network_1.default.writeLine(10, `${patcherID} script send ${objectID} ${attrName} ${val}`);
    }
}
