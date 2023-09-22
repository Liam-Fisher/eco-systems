import Alphabet from '../helpers/alphabet';
import { Axiom, SystemClass, system_blueprint } from '../definitions/classes/system';
import { json_el, props } from '../definitions/static/aliases';
import { status } from '../definitions/static/literals';


export class System implements SystemClass {
    // Info
    id: string;
    schema: string;
    axiom: number;
    // Constants 
    parameterSize: number = 1;
    maxLetters: number = 2 ** 30;
    terminalAge: number  = 2 ** 60;
    // Progress
    age: number;
    status: status;
    // Data
    letters: string;
    parameters: number[][];
    //props: props;
    constructor(ID: string, letters: string, parameters: number[][], BP: system_blueprint) {
        [this.id,this.letters,this.parameters] = [ID, letters, parameters];
        [this.age,this.status, this.axiom] = [0, 'active', BP.axiom];

        this.parameters.forEach(p => this.parameterSize = Math.max(this?.parameterSize ?? 1, p.length));
        if (BP?.props) Object.entries(BP.props).forEach(c => this[c[0]] = c[1]);
    }
    get isActive() {
        return ((this.status === 'active')&&(++this.age < this.terminalAge)&&(this.maxLetters > this.letters.length));
    }
}