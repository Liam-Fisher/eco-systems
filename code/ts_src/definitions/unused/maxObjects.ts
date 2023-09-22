
export interface networkNode {
    id: number;
    input: string;
    obj: string;
    args: (string | number)[]
}

type SystemDataObjects = {
    letters: { "filein" }
    vars: { "dict" }
    parameters: { "jit.fprint" }
}
// json extras:  "filter", "timestretch" (groove~/mc.groove~), ""
// text extras:  "coll", "seq~", "buffer~"{data},"jit.attrs" {xml}
// add key rendering: "obj"{txt}, "dae"{xml}, "gltf"{json, bin},  "pass"{xml}, "shader"{xml}  "mtl" (json) 
// add key gen: "dsp.gen", "jit.gen", "max.gen", "jit.gl.pix" (all json files)


// events sequence objects 
// qlist(txt) -> use for remote sends and goto messaging
// mtr(json) -> use for multitrack (more memory used per event)
//

// enables recording and playback
// max.seq -> use for midi messages
// dsp.seq -> use for signal control, 

// event lookup
// max.coll -> use for in depth manipulation and querying of content (merge, min)
// mc.chord -> use for signal control and mc output
// max.table -> use for signal envelopes
// dsp.buffer -> use for large signal files

class CollectionStorage {
    accumIndex: number = 0;
    collData: Map<number | string, (string | number)[]> = new Map();
    numMap: Map<number, string> = new Map();
    strMap: Map<string, number> = new Map();
    constructor() { }
    *[Symbol.iterator]() {
        for (let entry of this.collData) {
            let ind = entry[0];
            if (typeof entry[0] === 'number' && this.numMap.has(entry[0])) {
                ind = `${entry[0]} ${this.numMap.get(entry[0])}`;
            }
            yield `${entry[0]}, ${entry[1].join(' ')};\n`;
        };
    }
    store(args: (string | number)[], index?: string | number | [number, string]) {
        if (typeof index === 'undefined') {
            while (this.collData.has(this.accumIndex)) {
                this.accumIndex++;
            }
            return this.collData.set(this.accumIndex, args);
        }
        if (typeof index === 'number') {
            if (this.numMap.has(index)) {
                let assocStr = this.numMap.get(index);
                this.strMap.delete(assocStr);
                this.numMap.delete(index);
                this.collData.delete(index);
            }
            return this.collData.set(index, args);
        }
        if (typeof index === 'string') {
                if (this.strMap.has(index)) {
                    let assocNum = this.strMap.get(index);
                    this.numMap.delete(assocNum);
                    this.strMap.delete(index);
                    this.collData.delete(assocNum);
                }
                return this.collData.set(index, args);
        }
        if (this.collData.has(index[1])) {
            this.collData.delete(index[1]);
        }
        this.numMap.set(index[0], index[1]);
        this.strMap.set(index[1], index[0]);
        this.collData.set(index[0], args);
        }
}







/* 
export type RecordingObjects = {
    midi: 'max.seq'
    text: 'max.text'
    trackEvents: 'max.mtr'
    phaseEvents: 'dsp.seq'
    audio: 'dsp.sfrecord'
    image: 'jit.matrix'
    video: 'jit.record'
    movie: 'jit.vcr' // technically, this is an "audio" object, but the dsp. prefix is only used to indicate a tilde
};

*/




