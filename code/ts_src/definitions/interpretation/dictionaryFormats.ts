import { props } from "../static/aliases";

        // // // Items -> the umenu object

type items_data = string[]
type items_format = { items: string[]}
type sequence_data = [number,number,number,number,number][][]
// interval, active ?? false, loopStart ?? 1, loopEnd ?? nstep  
type sequence_track_info = [ number, boolean?, number?, number?][]

        // // // Sequence -> the live.step object
type sequence = {
    active: 0|1
    nstep: number // length of sequence_data array
    interval: number
    loop: [number, number]
    pitch: number[]
    velocity: number[]
    duration: number[]
    extra1: number[]
    extra2: number[]
}

type sequence_format = {
    schema: "live.step",
    extra1_range : [ number, number ],
    extra2_range : [ number, number ],
    sequences: sequence[]
}

        // // // Warp -> the mc.groove~ object

// absent arguments for beats or ticks set to 1
// source time 0 set to start, dest time 0 set to "end"
// negative number indicate source time in samples (changed to positive), 
type warp_point = number|[number, number?, number?];
type pitch_warp = { pitchshift: number } | { pitchshiftcents: number };
// data might need to check previous array element for overlap
export type warp_data =  [warp_point, warp_point, pitch_warp?][][];

type source_warp = { sourcetime: number|"start" }|{ sourcetimesample: number }|{ sourcetimebbu: [number,number,number] };
type dest_warp = { desttime: number|"end" }|{ desttimesample: number }|{ desttimebbu: [number,number,number] };
// markerN should be the string literal `marker${number}` where number is the element index in the warp data array
export type warp_format = { 
    [markerN: string]: source_warp&dest_warp&Partial<pitch_warp> 
};

        // // // Progression -> the mc.chord~ object

// data is an array of values in sequence order
type progression_data = number[][];
type chord = {
    index: number // by default, the array index
    values: number[]
};
type progression_format = { data: chord[] }

        // // // Pattern -> the mc.pattern~ object

// data is an array of maps (for each channel) with phase keys 
type pattern_data = Map<number, number>[];
// ramp ?? false, wrap ?? false, mute ?? false 
type pattern_track_info = [boolean?,boolean?,boolean?][];

type pattern = {
    channel: number // the array index of a map
    phases: number[] // keys in the map
    values: number[] // values in the map
    mute: boolean 
    ramp: boolean 
    wrap: boolean 
    quantize: 0
}
export type pattern_format = { channels: pattern[]}


        // // // Sequence -> the mtr object

// data is stored as an array of maps (one for each track) with keys indicating the time of an event in milliseconds, and values as max messages, followed by arguments
export type recording_data = Map<number, [string, ...(string|number)[]]>[];
// trackspeed ?? 1, loop ?? false
type recording_track_info = [number?, boolean?][]; 

// for now, mtr should be message only. route unnessecary messages in the patcher
// export type event = {time: number}&({ float: number }|{ int: number }|{message: string, args: (string|number)[]});
type event = {
    time: number
    message: string
    args: (string|number)[]
};
type track = {
    events: event[]
    length: number // calculated from last event time
    loop: boolean 
    trackspeed: number 
}
export type recording_format = { tracks: track[] }

        // // // Matrix -> the mc.matrix~ object

// depth 2 array representing an adjacency matrix with elements indicating normalized gain
type matrix_data = number[][][]; // data per channel
type matrix_track_info = number[]; // ramptime
interface matrix_connection {
    in: number
    out: number
    gain: number
}
export interface matrix_format {
    numins :number, // calculated from matrix_data.length
    numouts :number, // calculated from matrix_data[0].length
    ramptime?: number, // present for matrix~ and mc.matrix~
    offset: 0, 
    exclusive : 0,
    enablegain: 1,
    connections: matrix_connection[]
}


export interface DictDataTypes {
    dict: props[];
    items: items_data
    warp: warp_data
    matrix: matrix_data
    progression: progression_data
    pattern: pattern_data
    recording: recording_data
    sequence: sequence_data
}


export interface DictFormatTypes {
    dict: {"data": props[]}
    items: items_format
    warp: warp_format
    matrix: matrix_format
    progression: progression_format
    pattern: pattern_format
    recording: recording_format
    sequence: sequence_format
}
    

// other possible types
/*    


        // // // Filter -> the cascade object
// type, gain, frequency/frequencies
type outline = ['highpass'|'lowpass', number, number]|['bandstop'|'bandpass', number, number, number];
type topology = ['butterworth', ]
type filter_data = outline[]; // data as design, per channel

    interface sos_filter {
        cascade: number[]
    }
    interface tf_filter {
        denominators: number[]
        numerators: number[]
    }
    interface zpk_filter {
        poles: number[]
        zeroes: number[]
    }
    export type filter_format =  (sos_filter|tf_filter|zpk_filter) & {
        schema: 'filterdesign',
        response: outline[0],
        frequencies: outline[1],
        ripple: number,
        gain: number,
        topology: 'butterworth'|'chebyshev-1'|'chebyshev-2'
    }

    // // // List -> the umenu object
export type list_data = string[];
export type list_format = {items: string[]}


// // // Preset -> the pattrstorage object

type pattr_data = {
    // pattr_name may also be a max object scripting name, as long as the data is of the right type
    [pattr_name: string]: json_el
}
// data is storage per slot id (index becomes slot name)
export type preset_data = pattr_data[]


interface PattrstoragePresetSlot {
    [slot_name: string]: {
        id: number,
        data: pattr_data
    }
}
export type preset_format = {
pattrstorage: {
    name: string 
    slots: {
    [slot_name: string]: PattrstoragePresetSlot
    }
}
}

*/
