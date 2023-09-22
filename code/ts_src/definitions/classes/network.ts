import { props } from "../static/aliases";
import { attrs, file, id, index, timeout } from "../static/interfaces";

// {"pass", "vertex_shader", "frag_shader"};
type GLClasses = {"model", "texture", "material", "shader", "pass"};
 // !! make glClasses a union
export type DataClasses = {"table", "buffer", "collection", "dictionary", "matrix"}; 
export type DataObjects = {
    [Obj in keyof DataClasses]: string[]
}

// public means an object in the main patcher whose name is shared across multiple patchers, 
// this means that the object is created via script message, and all references to such objects are availible in patchers as a value object
// shared means an object whose name is shared across multiple patchers, 
// this means that the object 
// patcher means an object without a global name, 
// this means that the object should be loaded from a local file in the patcher 
export type MaxClassNamespace = ['public'|'shared'|'private'|'unnamed', string|null, string];

export type MediaMaxClass = {"mc.sfrecord~", "jit.vcr", "jit.record", "jit.matrix", "detonate"}; 
export type CodeMaxClass = {"js","poly~","mc.poly~","gen","mc.gen","mc.gen~","jit.gen","jit.pix","jit.gl.pix"};
export type LocalMaxClass = {"qlist","jit.gl.model","seq","text","funbuff","seq~"}; 
export type DictionaryFormat = {"multitrack", "pattern","progression","sequence","matrix","warp","filter","items"}; 
export type DataMaxClass = {'table','coll', 'dict','jit.matrix', 'buffer~'};
export type GlMaxClass = {'texture', 'material','shader', 'pass'};
export type GlobalMaxClass = {'table','coll', 'dict','jit.matrix', 'buffer~'}&GlMaxClass;



export type loadTypes = { 'load','shroud','loadunique' }
export type loadMode = keyof loadTypes; 


export interface network_blueprint extends file {
    patchers: string[]
}

export type patcher_blueprint = file & {
    //globalObjects: number[] //  indices of global objects 
   // localObjects: string[] // keys of local objects
    fileObjects: string[] 
    loadMode?: loadMode
    args?: (string | number)[]
}


 // for local objects, key is the object filename
export type object_blueprint = {
    interpreterID: string,
    fileIndex: number,
    loadtime?: number
};




export type media_object_blueprint = attrs&file&timeout&{ // array index is the order of script execution
    patchers: string[] // active patchers
    format: 'audio'|'video'|'image';
    channels?: number;
    args?: (number|string)[]
    ext?: string // else default in MaxClassExtensions is used
    msgs?: [number, string, ...(string|number)[]][] // duration, receive object, message 
}


// attr lists

/* video
open: 
filename, nchans [0 to 2]
// 0 will use jit.record 
(opt) 
dim 
// any collection of 2 element pairs
fps (float)
// default 30
codec (enum)
// too many to list here... see the help file

(vcr only)
quality (enum)
// lossless max min low normal high 
timescale (float)
*/
/* image
1: filename,
2: fileext
(opt) 
3-4: dim
5: name
*/
/*
open: 
filename, file extension, nchans [1 to 8]
// for more than 8 channels, use a cen
(opt)
// any collection of 2 element pairs

bitdepth (8|16|32|64)
// bits for each sample
dither (0|1|2) 
// off, on, on w/ noise shaping
quantization (0|1)
// round, floor
resample (float)
// from 0. to 4., where 1.0 is the current sampling rate
*/