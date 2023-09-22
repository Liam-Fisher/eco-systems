import { MediaMaxClass, media_object_blueprint } from "../../classes/network";
import Network from "../network";
import { mediaConnect, networkMsg, newObj } from "./formatters";
import * as paths from '../../../helpers/paths';
import { MediaExts } from "../../../helpers/constants";

export default function mediaLifecycle(obj: media_object_blueprint) {
    let maxclass: keyof MediaMaxClass, isAudio: boolean, isVcr: boolean, isImg: boolean, objArgs: number[]; 
    let hasMsgs = ('msgs' in obj)&&(obj?.msgs?.length);
    [maxclass, isAudio, isVcr, isImg, objArgs] = classInfo(obj.format, obj?.channels);
    networkMsg(100, newObj(maxclass, 'writer', [100,200], obj.attrs, objArgs), 'media', 'object');
    if(isAudio) Network.writeLine(100, `GLOBAL chans ${objArgs[0]}`);     // channel count for mc objects
    mediaSetup(isAudio, isVcr, obj?.channels);
    let ext = (obj?.ext ?? MediaExts[maxclass]);
    let file = paths.media(obj.filename, ext);
    if(!isImg) Network.writeLine(1, `MSG_OUT ${mediaOpenMsg(file, ext, isAudio, obj?.args)}`); // open the file for writing 
    networkMsg(1, `inx script send timeout ${obj?.timeout ?? 0} ${isAudio ? 0 :( isImg ? `exportimage "${file}" ${ext}` : 'stop')}`, 'media');
    if(isAudio) Network.writeLine(1, 'MSG_OUT 1'); // begin recording audio
    Network.writeLine(+hasMsgs, 'GLOBAL start'); // begin generating data in patchers
    if (hasMsgs) obj.msgs.forEach((msg) => Network.writeLine(msg[0], msg.slice(1).join(' '))); // runtime msgs
    Network.writeLine((+isAudio)*1000, 'GLOBAL stop'); // stop recording/
    networkMsg(10, 'inx script send delete writer', 'media', 'object');
}

function classInfo( format: media_object_blueprint["format"], channels?: number): [(keyof MediaMaxClass), boolean, boolean, boolean, number[]] {
    // could add disk buffer calculation here if channel count is greater than 8
    if(format === 'audio') return ['mc.sfrecord~', true, false, false, [(channels ?? 1)]]
    if(format === 'image') return ['jit.matrix', false, false, true, []]
    if (channels) return ['jit.vcr', false, true,  false, []]
    return ['jit.record', false, false,  false, []]
}
function mediaSetup(isAudio: boolean, isVcr: boolean, channels?: number){
    if(isVcr) {
        mediaConnect('from', 'MSG', 2);
        mediaConnect('from', 'L', 0);
        mediaConnect('from', `${channels > 1 ? 'R' : 'L' }`, 1);
    }
    else mediaConnect('from', 'MSG', 0);
    if(isAudio)  {
        mediaConnect('from', 'MC', 0);
        mediaConnect('to', 'monitor', 0);// connect the time-elapsed signal
    } 
    else mediaConnect('to', 'response', 1); // connect to emit on write messages
    networkMsg(100, `inx script send dac ${+(isAudio||isVcr)}`, 'media'); // start/stop the dac
}
function mediaOpenMsg(file: string, ext: string, isAudio: boolean,args?: (string|number)[]){
    if(isAudio) return `open "${file}" ${ext}`;
    let writeArgs = args ? ` ${args.join(' ')}` : '';
    return `write "${file}"${writeArgs}`;
}