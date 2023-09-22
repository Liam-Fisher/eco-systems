import { Messenger } from '../helpers/messaging';
export function reset() {
    this.syntax = {
        "axioms": [],
        "contexts": [],
        "indexWords": [],
        "letterCodes": []
    };
    this.timetable = {
        "generations": Number.MAX_SAFE_INTEGER,
        "schemata": {},
        "interaction": {},
        "interpretation": {}
    };
    [this.options, this.systems, this.schemata, this.interpreters] = [{}, {}, {}, {}, {}];
}
export function setValue(component, key, value, overwrite) {
    if (overwrite)
        this[component][key] = value;
    else
        this[component][key] ??= value;
}
export function addValues(syntax) {
    for (let material in syntax) {
        let v = syntax[material];
        if (this.syntax[material].includes(v))
            continue;
        this.syntax[material].push(v);
    }
}
export function addEvent(component, timeExpression, componentID, ...systemIDs) {
    this.timetable[component][timeExpression] ??= {};
    this.timetable[component][timeExpression][componentID] ??= [];
    systemIDs.forEach((id) => {
        if (!this.timetable[component][timeExpression][componentID].includes(id)) {
            this.timetable[component][timeExpression][componentID].push(id);
        }
        if (!(id in this.systems)) {
            Messenger.ee.emit('design', `undefined system ${id}`);
        }
    });
    if ((component === 'interpretations') && !(componentID in this.interpreters)) {
        Messenger.ee.emit('design', `undefined interpreter ${componentID}`);
    }
    if ((component === 'schemata') && !(componentID in this.schemata)) {
        Messenger.ee.emit('design', `undefined schema ${componentID}`);
    }
}
