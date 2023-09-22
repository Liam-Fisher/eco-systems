export class System {
    id;
    schema;
    axiom;
    parameterSize = 1;
    maxLetters = 2 ** 30;
    terminalAge = 2 ** 60;
    age;
    status;
    letters;
    parameters;
    constructor(ID, letters, parameters, BP) {
        [this.id, this.letters, this.parameters] = [ID, letters, parameters];
        [this.age, this.status, this.axiom] = [0, 'active', BP.axiom];
        this.parameters.forEach(p => this.parameterSize = Math.max(this?.parameterSize ?? 1, p.length));
        if (BP?.props)
            Object.entries(BP.props).forEach(c => this[c[0]] = c[1]);
    }
    get isActive() {
        return ((this.status === 'active') && (++this.age < this.terminalAge) && (this.maxLetters > this.letters.length));
    }
}
