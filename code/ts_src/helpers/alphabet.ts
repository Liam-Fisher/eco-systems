import { Codex, wordTypes } from "../definitions/classes/alphabet";
import { system_blueprint } from "../definitions/classes/system";
import { Experiment } from "../managers/experiment";


export default class Alphabet {
    static codes: Set<number> = new Set();
    static alphabet: string[] = [];
    constructor() {}
    static define(codes: number[]) {
        this.alphabet = [];
        this.codes.clear();
        codes.forEach((code, index) => {
                let letter = this.decode(code);
                this.codes.add(code);
                this.alphabet[index] = (letter);
        });
    }
    static decode(...codes: number[]): string { return String.fromCodePoint(...codes); }
    static encode(word: string): number[] { return Array.from(word).map(letter => letter.codePointAt(0)); }
    static lookup(...indices: number[]) { return indices.map(index => this.alphabet[index]).join(''); }
    //static lookup(...indices: number[]) { return indices.map(index => this.codes[index]).filter(code => code); }
    //static indexed(...codes: number[]) { return codes.map(code => this.codes.indexOf(code)).filter(index => index !== -1); }
    //static getLetters(word: wordTypes): string { return word?.letters ?? this.decode(...(word?.codes ?? this.lookup(...word?.indices))); }
    //static getCodes(word: wordTypes): number[] { return word?.codes ?? this.lookup(...word?.indices) ?? this.encode(word?.letters); }
    //static getIndices(word: wordTypes): number[] { return word?.indices ?? this.indexed(...(word?.codes ?? this.encode(word?.letters))); }
}
