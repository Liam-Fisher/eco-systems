// default extension, name is attribute, isGL

// [[groupDefaultIfStreaming,sequenceDefaultIfStreaming], [groupDefaultIfStoring,sequenceDefaultIfStoring]]
export const InterpreterSchemaDefaults = {
    "table": [[null, 'default'], [null, 'default']],
    "coll": [[null, 'default'], [null, 'default']],
    "qlist": [[null, 'default'], [null, 'default']],
    "dsp_seq": [[null, 'default'], ['default', null]],
    "text": [[null, 'default'], [null, 'default']],
    "funbuff": [[null, 'default'], [null, 'default']],
    "seq": [[null, 'default'], [null, 'default']],
    "jit_matrix": [['default', null], ['default', null]],
    "dsp_buffer": [[null, 'default'], ['default', null]],
    "dict": [[null, null], ['default', null]],
    "jit_gl_model": [[null, null], [null, 'default']],
    "filein": [[null, 'default'], [null, 'default']]
}
export  const MaxClassesNamespaces: Record<string, 'named' | 'arg' | 'gl' | 'msg' | 'script'> = { // else auto
    "table": 'named',
    "jit_matrix": 'named',
    "dict": 'named',
    "coll": 'arg',
    "dsp_buffer": 'arg',
    "qlist": 'msg',
    "jit_gl_model": 'msg',
    "dsp_seq": 'msg'
};

export const MediaExts: Record<string, string> = {
    "jit.matrix": 'png',
    "mc.sfrecord~": "wav",
    "jit.vcr~": "mov",
    "jit.record": "mov"
}
// 'arg'|'named'|'gl'|'auto'|'msg'|'script'
export const MaxClassExts: Record<string, string> = {
    "table": 'txt',
    "coll": 'txt',
    "qlist": 'txt',
    "dsp_seq": 'txt',
    "text": 'txt',
    "funbuff": 'txt',
    "seq": 'txt',
    "jit_matrix": 'jxf',
    "dict": 'json',
    "dsp_buffer": 'data',
    "model": 'gltf',
    "filein": 'bin'
};

// object than accept a dictionary message 
export const DictionaryFormats: Record<string, string[]> = {
    "items": ["umenu"],
    "multitrack": ["mtr"],
    "pattern": ["mc.pattern~"],
    "progression": ["mc.chord~"],
    "sequence": ["live.step"],
    "matrix": ["matrix", "matrix~", "mc.matrix~"],
    "warp": ["groove~", "mc.groove~", "sfplay~", "mc.sfplay~"],
    "filter": ["cascade~", "mc.cascade~", "biquad~", "mc.biquad~", "filtergraph~", "zplane~"],
};

/*

// [[groupDefaultIfStreaming,sequenceDefaultIfStreaming], [groupDefaultIfStoring,sequenceDefaultIfStoring]]
export const InterpreterSchemaDefaults = {
    "table": [[null, 'default'], [null, 'default']],
    "coll": [[null, 'default'], [null, 'default']],
    "qlist": [[null, 'default'], [null, 'default']],
    "seq~": [[null, 'default'], ['default', null]],
    "text": [[null, 'default'], [null, 'default']],
    "funbuff": [[null, 'default'], [null, 'default']],
    "seq": [[null, 'default'], [null, 'default']],
    "gen": [[null, null], ['default', null]],
    "mc.gen": [[null, null], ['default', null]],
    "gen~": [[null, null], ['default', null]],
    "mc.gen~": [[null, null], ['default', null]],
    "jit.gen": [[null, null], ['default', null]],
    "jit.pix": [[null, null], ['default', null]],
    "jit.gl.pix": [[null, null], ['default', null]],
    "patcher": [[null, null], ['default', null]],
    "jit.matrix": [['default', null], ['default', null]],
    "dsp_buffer": [[null, 'default'], ['default', null]],
    "dict": [[null, null], ['default', null]],
    "model": [[null, null], [null, 'default']],
    "filein": [[null, 'default'], [null, 'default']],
    "texture": [[null, null], [null, 'default']],
    "material": [[null, null], ['default', null]],
    "shader": [[null, null], ['default', null]],
    "pass": [[null, null], ['default', null]]
}
export  const MaxClassesNamespaces: Record<string, 'named' | 'arg' | 'gl' | 'msg' | 'script'> = { // else auto
    "table": 'named',
    "jit.matrix": 'named',
    "dict": 'named',
    "coll": 'arg',
    "dsp_buffer": 'arg',
    "qlist": 'msg',
    "model": 'msg',
    "patcher": 'script',
    "texture": 'gl',
    "material": 'gl',
    "shader": 'gl',
    "pass": 'gl',
    "seq~": 'msg',
    "poly~": 'script',
    "pfft~": 'script',
    "mc.poly~": 'script',
    "mc.pfft~":'script',
    "node.script": 'script'
};

export const MediaExts: Record<string, string> = {
    "jit.matrix": 'png',
    "mc.sfrecord~": "wav",
    "jit.vcr~": "mov",
    "jit.record": "mov"
}
// 'arg'|'named'|'gl'|'auto'|'msg'|'script'
export const MaxClassExts: Record<string, string> = {
    "table": 'txt',
    "coll": 'txt',
    "qlist": 'txt',
    "dsp_seq": 'txt',
    "text": 'txt',
    "funbuff": 'txt',
    "seq": 'txt',
    "gen": 'gendsp',
    "mc_gen": 'gendsp',
    "dsp_gen": 'gendsp',
    "dsp_mc_gen": 'gendsp',
    "jit.gen": 'genjit',
    "jit.pix": 'genjit',
    "jit.gl.pix": 'genjit',
    "patcher": 'maxpat',
    "js": 'js',
    "jit_matrix": 'jxf',
    "dict": 'json',
    "dsp_buffer": 'data',
    "model": 'gltf',
    "filein": 'bin',
    "texture": 'png',
    "material": 'jitmtl',
    "shader": 'jxs',
    "pass": 'jxp'
};

// object than accept a dictionary message 
export const DictionaryFormats: Record<string, string[]> = {
    "items": ["umenu"],
    "multitrack": ["mtr"],
    "pattern": ["mc.pattern~"],
    "progression": ["mc.chord~"],
    "sequence": ["live.step"],
    "matrix": ["matrix", "matrix~", "mc.matrix~"],
    "warp": ["groove~", "mc.groove~", "sfplay~", "mc.sfplay~"],
    "filter": ["cascade~", "mc.cascade~", "biquad~", "mc.biquad~", "filtergraph~", "zplane~"],
};
*/