export default class Alphabet {
    static codes = new Set();
    static alphabet = [];
    constructor() { }
    static define(codes) {
        this.alphabet = [];
        this.codes.clear();
        codes.forEach((code, index) => {
            let letter = this.decode(code);
            this.codes.add(code);
            this.alphabet[index] = (letter);
        });
    }
    static decode(...codes) { return String.fromCodePoint(...codes); }
    static encode(word) { return Array.from(word).map(letter => letter.codePointAt(0)); }
    static lookup(...indices) { return indices.map(index => this.alphabet[index]).join(''); }
}
