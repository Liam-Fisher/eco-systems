import { Syntax } from "../definitions/classes/schema";
import Alphabet from "../helpers/alphabet";
import { Experiment } from "../managers/experiment";

class SyntaxUI {
    static axioms: Syntax["axioms"] = [];
    static contexts: Syntax["contexts"] = [];
    static letters: Syntax["letters"] = [];
    static words: Syntax["words"] = [];

    static alphabet: string[] = [];
    static reset() {
        for(let key in this){
            if(Array.isArray(this[key])) this[key] = [];
        }
    }
    static add(...codes: number[]){
        let added = 0;
        for(let code of codes) {
            if(this.letters.includes(code)) continue; 
            added++;
            this.letters.push(code);
            this.alphabet.push(this.decode(code));
        }
        return added;
    }
    static decode(...codes: number[]): string { 
        return String.fromCodePoint(...codes); 
    }
    static encode(word: string): number[] { 
        return Array.from(word).map(letter => letter.codePointAt(0)); 
    }
    static lookup(...indices: number[]) { 
        return indices.map(index => this.alphabet[index]).join(''); 
    }
    static indexed(word: string) { 
        let indices = this.encode(word).map(code => this.letters.indexOf(code)); 
        if(Math.min(...indices)<0) return;
        return indices;
    }
}

