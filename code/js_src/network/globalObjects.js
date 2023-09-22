"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../helpers/constants");
const paths = require("../helpers/paths");
const network_1 = require("../managers/network");
const formatters_1 = require("./formatters");
function editGlobalObjects(BP, interpreters, global, add) {
    let objNames = {};
    for (let objIndex of BP.globalObjects) {
        console.log(`getting object at index ${objIndex}`);
        let obj = global[objIndex];
        let varname = paths.maxVarName(obj);
        console.log(`editing object ${varname}`);
        if (!add) {
            console.log(`deleting object ${varname}`);
            (0, formatters_1.networkMsg)(10, `delete ${varname}`, 'data');
        }
        else {
            console.log(`adding object ${varname}`);
            let maxclass = interpreters[obj.interpreterID]?.format;
            if (maxclass in constants_1.DictionaryFormats) {
                maxclass = 'dict';
            }
            if (!(maxclass in objNames)) {
                objNames[maxclass] = [];
            }
            objNames[maxclass].push(addGlobalObj(obj, varname, maxclass, interpreters[obj.interpreterID]?.attrs));
        }
    }
    return objNames;
}
exports.default = editGlobalObjects;
function addGlobalObj(obj, varname, maxclass, attrs) {
    console.log(`adding a ${maxclass} object`);
    let pos = network_1.default.positions[maxclass];
    pos[1] += 100;
    (0, formatters_1.networkMsg)(100, (0, formatters_1.newObj)(maxclass, varname, pos, attrs), 'data');
    let experimentPath = paths.globalFilePath(maxclass, obj);
    (0, formatters_1.networkMsg)((obj?.loadtime ?? 1000), (0, formatters_1.readMsg)(varname, experimentPath, maxclass, attrs), 'data');
    console.log(`setting experiment Path for ${obj.interpreterID} ${obj.fileIndex} to ${experimentPath}`);
    (0, formatters_1.setFilepath)(obj, maxclass);
    return varname;
}
