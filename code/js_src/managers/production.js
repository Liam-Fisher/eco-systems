import { Schema } from "../production/schema";
import { System } from "../production/system";
import * as load from "../loaders/production";
import * as paths from "../helpers/paths";
import Alphabet from "../helpers/alphabet";
import { Experiment } from "./experiment";
import { produce } from "../production/generators/default";
import ProductionDebugger from "../production/debugging";
export default class Production {
    static generators = new Map();
    static systems = new Map();
    static schemata = new Map();
    static schedule = new Map();
    static debugger;
    static maxTerminalAge;
    static reset(log) {
        this.generators.clear();
        this.schedule.clear();
        this.schemata.clear();
        this.systems.clear();
        this.debugger = (log) ? (new ProductionDebugger(paths.debugLog('production'), log)) : null;
    }
    static log(stage, data) {
        if (this.debugger === null)
            return;
        if ((stage === 'parameters') && Array.isArray(data)) {
            this.debugger.log([this.debugger.params(data)], 'parameters');
        }
        else if (typeof data === 'string') {
            this.debugger.log([data], stage);
        }
        else {
            this.debugger.logData(stage, data[0], data[1]);
        }
    }
    static generate(age) {
        let scheduled = this.schedule.get(age);
        console.log(`applying productions...`);
        if (!scheduled)
            return;
        for (let schemaID in scheduled) {
            for (let systemID of scheduled[schemaID]) {
                console.log(`schema ${schemaID}`);
                this.systems.get(systemID).schema = schemaID;
                if (!this.generators.has(systemID))
                    continue;
                this.log('schedule', `schema: ${schemaID} -> system ${systemID}`);
                let result = this.generators.get(systemID).next().value;
                if (!result)
                    throw new Error(`system generator ${systemID} failed to return a value, or is already complete`);
                if (result !== 'complete')
                    continue;
                this.log('schedule', `system ${systemID} completed`);
                this.generators.delete(systemID);
            }
        }
    }
    static async create(tt) {
        if (!tt)
            return;
        this.buildSchedule(tt);
        await this.createScheduledComponents();
    }
    static buildSchedule(entries) {
        this.schedule.clear();
        for (let e of entries) {
            let methods = e.methods;
            for (let t of e.times) {
                let entriesAtTimepoint = this.schedule.get(t) ?? {};
                for (let m in methods) {
                    let newTargets = methods[m];
                    let activeTargets = entriesAtTimepoint?.[m] ?? [];
                    for (let tgt of newTargets) {
                        if (!activeTargets.includes(tgt)) {
                            activeTargets.push(tgt);
                        }
                    }
                    entriesAtTimepoint[m] = activeTargets;
                }
                this.schedule.set(t, entriesAtTimepoint);
            }
        }
    }
    static async createScheduledComponents() {
        let schemaProps;
        for await (let entry of this.schedule.values()) {
            for await (let [schemaID, systemIDs] of Object.entries(entry)) {
                for await (let systemID of systemIDs) {
                    if (!this.systems.has(systemID)) {
                        await this.addSystem(systemID);
                    }
                }
                if (!this.schemata.has(schemaID)) {
                    schemaProps = await this.addSchema(schemaID, ...systemIDs);
                }
            }
        }
    }
    static async addSystem(systemID) {
        let systemBP = Experiment.blueprint.systems[systemID];
        let axiom = Experiment.blueprint.syntax.axioms[systemBP.axiom];
        let letters = Alphabet.lookup(...(Experiment.blueprint.syntax.words[axiom[0]]));
        let parameters = axiom.slice(1);
        if (letters.length !== parameters.length)
            throw new Error(`system ${systemID} has unequal parameter and letter lengths`);
        let system = new System(systemID, letters, parameters, systemBP);
        this.log('load', `system: ${systemID}`);
        system.terminalAge ??= this.maxTerminalAge;
        this.systems.set(systemID, system);
        this.generators.set(system.id, produce(system));
    }
    static async addSchema(schemaID, ...systemIDs) {
        let schema = new Schema(schemaID, {});
        this.log('load', `schema: ${schemaID}`);
        let schemaBP = Experiment.blueprint.schemata[schemaID];
        let ruleInfo = schemaBP.rules.map((rule) => load.buildRule(rule, Experiment.blueprint.syntax));
        await load.rules(schema, systemIDs, ...ruleInfo);
        await load.hooks(schema, systemIDs, schemaBP.hooks);
        Production.schemata.set(schemaID, schema);
        return schema.props;
    }
}
