import Network from "../network";
import { mediaConnect, networkMsg, newObj } from "./formatters";
import * as paths from '../../../helpers/paths';
import { MediaExts } from "../../../helpers/constants";
export default function mediaLifecycle(obj) {
    let maxclass, isAudio, isVcr, isImg, objArgs;
    let hasMsgs = ('msgs' in obj) && (obj?.msgs?.length);
    [maxclass, isAudio, isVcr, isImg, objArgs] = classInfo(obj.format, obj?.channels);
    networkMsg(100, newObj(maxclass, 'writer', [100, 200], obj.attrs, objArgs), 'media', 'object');
    if (isAudio)
        Network.writeLine(100, `GLOBAL chans ${objArgs[0]}`);
    mediaSetup(isAudio, isVcr, obj?.channels);
    let ext = (obj?.ext ?? MediaExts[maxclass]);
    let file = paths.media(obj.filename, ext);
    if (!isImg)
        Network.writeLine(1, `MSG_OUT ${mediaOpenMsg(file, ext, isAudio, obj?.args)}`);
    networkMsg(1, `inx script send timeout ${obj?.timeout ?? 0} ${isAudio ? 0 : (isImg ? `exportimage "${file}" ${ext}` : 'stop')}`, 'media');
    if (isAudio)
        Network.writeLine(1, 'MSG_OUT 1');
    Network.writeLine(+hasMsgs, 'GLOBAL start');
    if (hasMsgs)
        obj.msgs.forEach((msg) => Network.writeLine(msg[0], msg.slice(1).join(' ')));
    Network.writeLine((+isAudio) * 1000, 'GLOBAL stop');
    networkMsg(10, 'inx script send delete writer', 'media', 'object');
}
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
        mediaConnect('from', 'MSG', 2);
        mediaConnect('from', 'L', 0);
        mediaConnect('from', `${channels > 1 ? 'R' : 'L'}`, 1);
    }
    else
        mediaConnect('from', 'MSG', 0);
    if (isAudio) {
        mediaConnect('from', 'MC', 0);
        mediaConnect('to', 'monitor', 0);
    }
    else
        mediaConnect('to', 'response', 1);
    networkMsg(100, `inx script send dac ${+(isAudio || isVcr)}`, 'media');
}
function mediaOpenMsg(file, ext, isAudio, args) {
    if (isAudio)
        return `open "${file}" ${ext}`;
    let writeArgs = args ? ` ${args.join(' ')}` : '';
    return `write "${file}"${writeArgs}`;
}
