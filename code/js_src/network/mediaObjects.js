"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("../managers/network");
const formatters_1 = require("./formatters");
const paths = require("../helpers/paths");
const constants_1 = require("../helpers/constants");
function mediaLifecycle(obj) {
    let maxclass, isAudio, isVcr, isImg, objArgs;
    let hasMsgs = ('msgs' in obj) && (obj?.msgs?.length);
    [maxclass, isAudio, isVcr, isImg, objArgs] = classInfo(obj.format, obj?.channels);
    (0, formatters_1.networkMsg)(100, (0, formatters_1.newObj)(maxclass, 'writer', [100, 200], obj.attrs, objArgs), 'media', 'object');
    if (isAudio)
        network_1.default.writeLine(100, `GLOBAL chans ${objArgs[0]}`);
    mediaSetup(isAudio, isVcr, obj?.channels);
    let ext = (obj?.ext ?? constants_1.MediaExts[maxclass]);
    let file = paths.media(obj.filename, ext);
    if (!isImg)
        network_1.default.writeLine(1, `MSG_OUT ${mediaOpenMsg(file, ext, isAudio, obj?.args)}`);
    (0, formatters_1.networkMsg)(1, `inx script send timeout ${obj?.timeout ?? 0} ${isAudio ? 0 : (isImg ? `exportimage "${file}" ${ext}` : 'stop')}`, 'media');
    if (isAudio)
        network_1.default.writeLine(1, 'MSG_OUT 1');
    network_1.default.writeLine(+hasMsgs, 'GLOBAL start');
    if (hasMsgs)
        obj.msgs.forEach((msg) => network_1.default.writeLine(msg[0], msg.slice(1).join(' ')));
    network_1.default.writeLine((+isAudio) * 1000, 'GLOBAL stop');
    (0, formatters_1.networkMsg)(10, 'inx script send delete writer', 'media', 'object');
}
exports.default = mediaLifecycle;
function classInfo(format, channels) {
    if (format === 'audio')
        return ['mc.sfrecord~', true, false, false, [(channels ?? 1)]];
    if (format === 'image')
        return ['jit.matrix', false, false, true, []];
    if (channels)
        return ['jit.vcr', false, true, false, []];
    return ['jit.record', false, false, false, []];
}
function mediaSetup(isAudio, isVcr, channels) {
    if (isVcr) {
        (0, formatters_1.mediaConnect)('from', 'MSG', 2);
        (0, formatters_1.mediaConnect)('from', 'L', 0);
        (0, formatters_1.mediaConnect)('from', `${channels > 1 ? 'R' : 'L'}`, 1);
    }
    else
        (0, formatters_1.mediaConnect)('from', 'MSG', 0);
    if (isAudio) {
        (0, formatters_1.mediaConnect)('from', 'MC', 0);
        (0, formatters_1.mediaConnect)('to', 'monitor', 0);
    }
    else
        (0, formatters_1.mediaConnect)('to', 'response', 1);
    (0, formatters_1.networkMsg)(100, `inx script send dac ${+(isAudio || isVcr)}`, 'media');
}
function mediaOpenMsg(file, ext, isAudio, args) {
    if (isAudio)
        return `open "${file}" ${ext}`;
    let writeArgs = args ? ` ${args.join(' ')}` : '';
    return `write "${file}"${writeArgs}`;
}
