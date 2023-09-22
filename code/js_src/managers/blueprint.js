"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blueprint = void 0;
const paths = require("../helpers/paths");
const blueprintRegExp = /(.+)_(\d+)$/g;
class Blueprint {
    settings;
    options;
    systems;
    schemata;
    syntax;
    interactions;
    interpreters;
    constructor(id, generations) {
        this.settings = {
            "id": id,
            "generations": generations ?? Number.MAX_SAFE_INTEGER
        };
        this.syntax = {
            "axioms": [],
            "contexts": [],
            "indexWords": [],
            "letterCodes": []
        };
        [this.options, this.systems, this.schemata, this.interactions, this.interpreters] = [{}, {}, {}, {}, {}];
    }
    setValue(component, key, value, overwrite) {
        if (overwrite)
            this[component][key] = value;
        else
            this[component][key] ??= value;
    }
    addValues(syntax) {
        for (let material in syntax) {
            let v = syntax[material];
            if (this.syntax[material].includes(v))
                continue;
            this.syntax[material].push(v);
        }
    }
    async merge(src, overwrite) {
        let src_bp = await require(paths.blueprint());
        for (let component in src_bp) {
            let componentObject = src_bp[component];
            if (component === 'syntax') {
                this.addValues(componentObject);
            }
            else {
                for (let key in componentObject) {
                    this.setValue(component, key, componentObject[key], overwrite);
                }
            }
        }
    }
}
exports.Blueprint = Blueprint;
