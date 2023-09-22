import * as paths from '../helpers/paths';
import * as fs from 'fs/promises';
import Alphabet from '../helpers/alphabet';
import { Messenger } from '../helpers/messaging';
import { experiment_blueprint } from '../definitions/classes/experiment';

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

export function setValue(component: (keyof experiment_blueprint), key: string, value: any, overwrite?: boolean) {
        if (overwrite) this[component][key] = value;
        else this[component][key] ??= value;
    }
    // value should be a dictionary built in the maxJS design UI
export function addValues(syntax: experiment_blueprint["syntax"]) {
        for (let material in syntax) {
            let v = syntax[material];
            if (this.syntax[material].includes(v)) continue;
            this.syntax[material].push(v);
        }
}
export function addEvent(component: keyof experiment_blueprint["timetable"], timeExpression: string, componentID: string, ...systemIDs: string[]) {
        this.timetable[component][timeExpression] ??= {};
        this.timetable[component][timeExpression][componentID] ??= [];
        // disallow adding undefined flag ?
        systemIDs.forEach((id) => {
            if(!this.timetable[component][timeExpression][componentID].includes(id)){
                this.timetable[component][timeExpression][componentID].push(id);
        }
            if(!(id in this.systems)) {
                Messenger.ee.emit('design', `undefined system ${id}`);
            }
        });
        if((component === 'interpretations')&&!(componentID in this.interpreters)) {
            Messenger.ee.emit('design', `undefined interpreter ${componentID}`);
        }
        if((component === 'schemata')&&!(componentID in this.schemata)) {
            Messenger.ee.emit('design', `undefined schema ${componentID}`);
        }
    }


//? could add a function for exporting media
