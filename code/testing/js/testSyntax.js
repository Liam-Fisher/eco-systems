const {EventEmitter} = require('events');

const ee = new EventEmitter();
class Experiment {
    static blueprint = {
        "syntax": {}
    }
}

class SyntaxUI {
    static assoc = false;
    static dialogMode = 0;
    static activeDialog = null;
    static activeArgs = [];
    static alphabet = [];
    static axioms = [];
    static contexts = [];
    static letters = [];
    static words = [];
    static reset(src)   {
        for(let k in src) {
            this[k] = this.assoc ? src[k] : Array.from(src[k]);
        }
        this.letters.forEach((l,i) => this.alphabet[i] = this.decode(l));
    }
    static input(args) {
        this.activeArgs = args;
        if ((this.dialogMode === 1) || (args[0] === 'cancel')) {
            this.activeDialog = null;
            this.dialogMode = 0;
            return;
        }
        if (!this.activeDialog) {
            console.log(`creating new dialog`);
            this.activeDialog = axiomInput(...args);
            if (!this.activeDialog) {
                this.errorAlert(`invalid editing mode ${this.editMode} for target ${this.editTarget}`);
            }
        }
        console.log(`${args.length} input args to main gen ${args.join(' ')}`);
        let gen = this.activeDialog.next();
        if (gen.done) {
            this.activeDialog = null;
        }
        else {
            this.dialogMode = gen.value[0];
            ee.emit("dialog", gen.value[1]);
        }
    }
    static errorAlert(str) {
        this.dialogMode = 1;
        return ee.emit("dialog", str);
    }
    
    static decode(...codes) { return String.fromCodePoint(...codes); }
    static encode(word) { return Array.from(word).map(letter => letter.codePointAt(0)); }
    static lookup(...indices) { return indices.map(index => this.alphabet[index]).join(''); }

}

function *axiomInput() {
    let indexGen, parameterGen;
    let indexInput = indexInputDialog('word', 'axiom');
    while(true) {
        indexGen = indexInput.next();
        if(indexGen.done) break;
        yield indexGen.value;
    }
    let indexWord = SyntaxUI.words[indexGen.value];
    console.log(`wordIndex: ${indexGen.value} indexWord: ${indexWord}`);
    let parameterInput = parameterInputDialog(indexWord);
    while(true) {
        parameterGen = parameterInput.next();
        if(parameterGen.done) break;
        yield parameterGen.value;
    }
    console.log(` ${indexGen.value} indexWord: ${indexWord}`);
    SyntaxUI.axioms.push([indexGen.value, ...parameterGen.value]);
    console.log(`added axiom ${SyntaxUI.axioms.length}: ${SyntaxUI.axioms[SyntaxUI.axioms.length-1]} `);
    return;
}

function *parameterInputDialog(indexWord) {
    let num;
    let parameters = [];
    while(true) {
        yield [0, `input the number of parameters (1-256)`];
        num = SyntaxUI.activeArgs[0];
        if ((typeof num !== 'number') || (num > 256) || (num < 1)) {
            yield [2, `invalid number of parameters ${num}`];
            continue;
        }
        break;
    }
    while(parameters.length<indexWord.length) {
        yield [0, `input ${num} parameters for letter '${SyntaxUI.lookup(indexWord[parameters.length])}' at index ${parameters.length} of ${indexWord.length}?`];
        if(SyntaxUI.activeArgs.length !== num) {
            yield [2,`parameter size was set to ${num}. received ${SyntaxUI.activeArgs.length} parameters`];
            continue;
        }
        let invalidArgs = SyntaxUI.activeArgs.filter(a => typeof a !== 'number');
        if(invalidArgs.length) {
            yield [2,`parameters must be numbers. received invalid inputs ${invalidArgs.join(' ')}`]
            continue;
        }
        parameters.push(Array.from(SyntaxUI.activeArgs));
    }
    return parameters;
}
function *indexInputDialog(src,tgt) {
    let count = SyntaxUI[`${src}s`].length;
    if(count === 0) return [1, `there are no ${src}s to associate the ${tgt} with`];
    while(true) {
        yield [0, `input the the associated ${tgt} index (0-${count})`];
        let index = SyntaxUI.activeArgs[0];
        if(index === undefined) {
            yield [2, `no arguments provided`];
            continue;
        }
        if ((typeof SyntaxUI.activeArgs[0] !== 'number')) {
            yield [2, `invalid index type ${typeof SyntaxUI.activeArgs[0]}`];
            continue;
        }
        if (SyntaxUI.activeArgs[0] >= count) {
            yield [2, `index ${SyntaxUI.activeArgs[0]} out of range. there are only ${count} ${src}s`];
            continue;
        }
        break;
    }
        return SyntaxUI.activeArgs[0];
}
   
ee.addListener("dialog", (label) => console.log(`mode: ${SyntaxUI.dialogMode} label: ${label}`));
Experiment.blueprint.syntax = {
    "axioms": [[-1,[-1]]],
    "contexts": [],
    "letters": [70,71,72],
    "words": [[0,1,2],[2,1,0]]
};
SyntaxUI.axioms = [[0,[0]],[1,[1]]];
function test(...args) {
     SyntaxUI.input(args);
}
SyntaxUI.reset(Experiment.blueprint.syntax);
test();

test();
test('ok');
test("p");
test('ok');
test(4);
test('ok');
test(0);
test("p");
test('ok');
test(2);
test("p");
test('ok');
test(0,1,2);
test('ok');
test(0,1);
test(0,1);
test(0,1);
