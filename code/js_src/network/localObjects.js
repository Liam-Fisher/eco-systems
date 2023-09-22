"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paths = require("../helpers/paths");
const network_1 = require("../managers/network");
const formatters_1 = require("./formatters");
function editLocalObjects(ID, BP, local, interpreters) {
    for (let objFileName of BP.localObjects) {
        console.log(`getting object ${objFileName} in patcher ${ID}`);
        let obj = local[objFileName];
        let attrs = interpreters[obj.interpreterID]?.attrs ?? {};
        setLocalAttrs(ID, objFileName, interpreters[obj.interpreterID].attrs);
        let maxclass = interpreters[obj.interpreterID].format;
        network_1.default.writeLine(10, `${ID} script send ${objFileName} read "${paths.max((0, formatters_1.setFilepath)(obj, maxclass))}"`);
        (0, formatters_1.setFilepath)(obj, interpreters[obj.interpreterID]?.format);
    }
}
exports.default = editLocalObjects;
function setLocalAttrs(patcherID, objectID, attrs) {
    for (let attrName in attrs) {
        let val = attrs[attrName];
        if (Array.isArray(attrs))
            val = attrs.join(' ');
        network_1.default.writeLine(10, `${patcherID} script send ${objectID} ${attrName} ${val}`);
    }
}
