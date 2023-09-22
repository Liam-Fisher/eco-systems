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
};
export const MaxClassesNamespaces = {
    "table": 'named',
    "jit_matrix": 'named',
    "dict": 'named',
    "coll": 'arg',
    "dsp_buffer": 'arg',
    "qlist": 'msg',
    "jit_gl_model": 'msg',
    "dsp_seq": 'msg'
};
export const MediaExts = {
    "jit.matrix": 'png',
    "mc.sfrecord~": "wav",
    "jit.vcr~": "mov",
    "jit.record": "mov"
};
export const MaxClassExts = {
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
export const DictionaryFormats = {
    "items": ["umenu"],
    "multitrack": ["mtr"],
    "pattern": ["mc.pattern~"],
    "progression": ["mc.chord~"],
    "sequence": ["live.step"],
    "matrix": ["matrix", "matrix~", "mc.matrix~"],
    "warp": ["groove~", "mc.groove~", "sfplay~", "mc.sfplay~"],
    "filter": ["cascade~", "mc.cascade~", "biquad~", "mc.biquad~", "filtergraph~", "zplane~"],
};
