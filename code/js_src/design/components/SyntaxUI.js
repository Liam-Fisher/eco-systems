export default class SyntaxUI {
    static axioms = [];
    static contexts = [];
    static letters = [];
    static words = [];
    static alphabet = [];
    static reset() {
        for (let key in this) {
            if (Array.isArray(this[key]))
                this[key] = [];
        }
    }
    static add(...codes) {
        let added = 0;
        for (let code of codes) {
            if (this.letters.includes(code))
                continue;
            added++;
            this.letters.push(code);
            this.alphabet.push(this.decode(code));
        }
        return added;
    }
    static decode(...codes) {
        return String.fromCodePoint(...codes);
    }
    static encode(word) {
        return Array.from(word).map(letter => letter.codePointAt(0));
    }
    static lookup(...indices) {
        return indices.map(index => this.alphabet[index]).join('');
    }
    static indexed(word) {
        let indices = this.encode(word).map(code => this.letters.indexOf(code));
        if (Math.min(...indices) < 0)
            return;
        return indices;
    }
}
