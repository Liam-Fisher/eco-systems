"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("../managers/network");
const formatters_1 = require("./formatters");
const mediaObjects_1 = require("./mediaObjects");
const paths = require("../helpers/paths");
const promises_1 = require("fs/promises");
async function build_script(BP) {
    let { media, patchers, objects, interpreters, interpretations } = BP;
    network_1.default.reset(interpreters);
    console.log(`building script`);
    for (let mediaFile of media) {
        console.log(`building media file ${mediaFile.filename}`);
        for (let newPatcherID of mediaFile.patchers) {
            if (network_1.default.activePatcherIDs.has(newPatcherID))
                continue;
            console.log(`adding patcher ${newPatcherID}`);
            let patcher = patchers?.[newPatcherID];
            if (!patcher)
                throw new Error(`patcher ${newPatcherID} not loaded`);
            network_1.default.activePatcherIDs.add(newPatcherID);
            (0, formatters_1.loadPatcher)(newPatcherID, patcher);
            for (let newObjectID of patcher.fileObjects) {
                if (network_1.default.activeObjectIDs.has(newObjectID))
                    continue;
                let obj = objects[newObjectID];
                let interpreter = interpreters[obj.interpreterID];
                let attrs = interpreter?.attrs ?? {};
                let interpretation = interpretations[interpreter.interpretation];
                let maxclass = interpretation?.format;
                (0, formatters_1.setAttrs)(newPatcherID, newObjectID, interpreters[obj.interpreterID].attrs);
                network_1.default.writeLine((obj?.loadtime ?? 0), `${newPatcherID} ${(0, formatters_1.readMsg)(newObjectID, ((0, formatters_1.setFilepath)(obj, maxclass)), maxclass, attrs)}`);
            }
        }
        for (let oldID of network_1.default.activePatcherIDs) {
            if (mediaFile.patchers.includes(oldID))
                continue;
            console.log(`removing patcher ${oldID}`);
            network_1.default.activePatcherIDs.delete(oldID);
            network_1.default.writeLine(100, `${oldID} wclose`);
        }
        (0, mediaObjects_1.default)(mediaFile);
    }
    for (let remainingID of network_1.default.activePatcherIDs) {
        network_1.default.writeLine(100, `${remainingID} wclose`);
    }
    await (0, promises_1.writeFile)(paths.networkScript(), network_1.default.file);
}
exports.default = build_script;
