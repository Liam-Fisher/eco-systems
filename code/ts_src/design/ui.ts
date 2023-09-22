import { experiment_blueprint } from "../definitions/classes/experiment";
import { Messenger } from "../helpers/messaging";
import { Experiment } from "../managers/experiment";
import SyntaxUI from "./components/SyntaxUI";
import TimetableUI from "./components/TimetableUI";
import ComponentUI from "./components/ComponentUI";
import * as paths from "../helpers/paths";
import { addValues, setValue } from './blueprint';
import { dialogModes, editCategories, editModes, EditTargets, propertyAliases } from "./constants";

export class UI {
    static editMode: (keyof typeof editModes);
    static editCategory:(keyof typeof editCategories);
    static editTarget: string;
    static dialogMode: number = 0; //0|1|2|3
    static activeArgs: (string|number)[] = [];
    static activeDialog: Generator<unknown, void, (string | number)[]> | null;
    static dialogs:  (GeneratorFunction|null)[] = []
    static reset() {
        this.dialogMode = 0;
        this.activeDialog = null;
    }
    static trigger(code1: number, code2: number, code3: number) {
        
        this.editMode = editModes[-(code1 + 6)] as (keyof typeof editModes);
        this.editCategory = editCategories[(code2 - 48)] as (keyof typeof editCategories);
        this.editTarget = EditTargets?.[this.editMode]?.[this.editCategory]?.[String.fromCharCode(code3)];
        if (!(this.editMode && this.editCategory&& this.editTarget)) {
            this.errorAlert(`invalid input codes ${code1} ${code2}`);
        }
        this.dialogMode = 0;

        this.input([]);
    }
    static errorAlert(str: string) {
        this.dialogMode = dialogModes.ALERT;
        return Messenger.ee.emit("dialog", str);
    }
    static input(args: (string|number)[]) {
        this.activeArgs = args;
        if ((this.dialogMode === 1) || (args[0] === 'cancel')) {
            this.activeDialog = null;
            this.dialogMode = 0;
            return;
        }
        if (!this.activeDialog) {
            //this.activeDialog = createGenerator(this.editMode, this.editTarget);

            if (!this.activeDialog) {
                return;
            }
        }
        console.log(`${args.length} input args to main gen ${args.join(' ')}`);
        let gen = this.activeDialog.next();
        if (gen.done) {
            this.activeDialog = null;
            this.dialogMode = 1;
            return;
        }
        this.dialogMode = gen.value[0];
        Messenger.ee.emit("dialog", gen.value[1]);
    }
    
    static async merge(srcID: string, overwrite?: boolean) {
        if (!(await Experiment.isBuilt(srcID))) {
            return `experiment ${srcID} does not exist`;
        }
        let src_bp = (await require(paths.blueprint(srcID)) as experiment_blueprint);
        for (let component in src_bp) {
            let componentObject = src_bp[component];
            if (component === 'syntax') {
                addValues.call(Experiment.blueprint, componentObject);
            }
            else {
                for (let key in componentObject) {
                    setValue.call(Experiment.blueprint, component as (keyof experiment_blueprint), key, componentObject[key], overwrite);
                }
            }
        }
    }
}


function viewProp(tgt: (keyof experiment_blueprint)|(keyof typeof ComponentUI)|(keyof typeof SyntaxUI)|(keyof typeof TimetableUI)) {
    if(tgt in Experiment.blueprint) {
        Messenger.ee.emit('view', Experiment.blueprint[tgt]);
    }
    else if (tgt in SyntaxUI) {
        Messenger.ee.emit('view', Experiment.blueprint.syntax[tgt]);
    }
    else {
        Messenger.ee.emit('view', Experiment.blueprint.timetable[tgt]);
        TimetableUI[tgt] = {};
    }
}


function *clearDialog(tgt: (keyof experiment_blueprint)|(keyof typeof ComponentUI)|(keyof typeof SyntaxUI)|(keyof typeof TimetableUI)) {
    yield [2, `remove all ${tgt}s in active blueprint?`];
    if(tgt in Experiment.blueprint) {
        if(tgt === "syntax"){
            SyntaxUI.reset();
        }
        else if(tgt === "timetable"){
            TimetableUI.reset();
        }
        else {
            Experiment.blueprint[tgt] = {};
        }
    }
    else {
    if(tgt in SyntaxUI) {
        SyntaxUI[tgt] = [];
    }
    else if(tgt in TimetableUI) {
        TimetableUI[tgt] = {};
    }
    else {
        ComponentUI[tgt] = {};
    }
    }
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
  
    console.log(`added axiom ${SyntaxUI.axioms.length}: ${SyntaxUI.axioms[SyntaxUI.axioms.length-1]} `);
    return;
}

function *parameterInputDialog(indexWord: number[]) {
    let num;
    let parameters = [];
    while(true) {
        yield [0, `input the number of parameters (1-256)`];
        num = UI.activeArgs[0];
        if ((typeof num !== 'number') || (num > 256) || (num < 1)) {
            yield [2, `invalid number of parameters ${num}`];
            continue;
        }
        break;
    }
    while(parameters.length<indexWord.length) {
        yield [0, `input ${num} parameters for letter '${SyntaxUI.lookup(indexWord[parameters.length])}' at index ${parameters.length} of ${indexWord.length}?`];
        if(UI.activeArgs.length !== num) {
            yield [2,`parameter size was set to ${num}. received ${UI.activeArgs.length} parameters`];
            continue;
        }
        let invalidArgs = UI.activeArgs.filter(a => typeof a !== 'number');
        if(invalidArgs.length) {
            yield [2,`parameters must be numbers. received invalid inputs ${invalidArgs.join(' ')}`]
            continue;
        }
        parameters.push(Array.from(UI.activeArgs));
    }
    return parameters;
}
function *indexInputDialog(src: string, tgt:string) {
    let count = SyntaxUI[`${src}s`].length;
    if(count === 0) return [1, `there are no ${src}s to associate the ${tgt} with`];
    while(true) {
        yield [0, `input the the associated ${tgt} index (0-${count})`];
        let index = UI.activeArgs[0];
        if(index === undefined) {
            yield [2, `no arguments provided`];
            continue;
        }
        if ((typeof UI.activeArgs[0] !== 'number')) {
            yield [2, `invalid index type ${typeof UI.activeArgs[0]}`];
            continue;
        }
        if (UI.activeArgs[0] >= count) {
            yield [2, `index ${UI.activeArgs[0]} out of range. there are only ${count} ${src}s`];
            continue;
        }
        break;
    }
        return UI.activeArgs[0];
}