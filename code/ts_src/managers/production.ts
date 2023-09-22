import { Schema } from "../production/schema";
import { System } from "../production/system";
import * as load from "../loaders/production";
import * as paths from "../helpers/paths";
import {   schedule, ScheduleEntry } from "../definitions/classes/experiment";
import Alphabet from "../helpers/alphabet";
import { Experiment } from "./experiment";
import { produce } from "../production/generators/default";
import { props } from "../definitions/static/aliases";
import State from "../production/state";
import ProductionDebugger from "../production/debugging";
type productionStage =  `${'pre' | 'per' | 'post'}_${'production' | 'mapping'}`|'start'|'end';
/*

                let parameters: string[] = [];
                console.log(`parameters ${data.join(' ')}`);
                for(let param of data) {
                    console.log(`param ${param}`);
                    if(Array.isArray(param)) {
                        parameters.push(param.map(p => p.toExponential(2)).join(' '));
                    }
                }
            this.debugger.log([`[ ${parameters.join('] [')} ]\n`], 'parameters');
            
*/
export default class Production {
    static generators: Map<string, Generator<string, string, unknown>> = new Map();
    static systems: Map<string, System | null> = new Map();
    static schemata: Map<string, Schema | null> = new Map();
    static schedule: Map<number, Record<string, string[]>>  = new Map();  // generation -> schemaID: systemIDs 
    static debugger: ProductionDebugger|null
    static maxTerminalAge: number;
    static reset(log?: boolean|(productionStage[])) {
        this.generators.clear();
        this.schedule.clear();
        this.schemata.clear();
        this.systems.clear();
        this.debugger = (log) ? (new ProductionDebugger(paths.debugLog('production'), log )) : null;
    }
    static log(stage: productionStage|'load'|'schedule'|'subroutine'|'parameters', data: [System,Schema?]|string|number[][]){
        if(this.debugger === null) return;
            if((stage === 'parameters') && Array.isArray(data)) {
                this.debugger.log([this.debugger.params(data as number[][])], 'parameters');
            }
            else if(typeof data === 'string'){
                this.debugger.log([data], stage);
            }
            else {
            this.debugger.logData(stage as productionStage, data[0] as System, data[1] as Schema);
        }
    }
    static generate(age: number) {
        let scheduled = this.schedule.get(age);
        console.log(`applying productions...`);
        if(!scheduled) return; 
        for (let schemaID in scheduled) {
            for(let systemID of scheduled[schemaID])  {
                console.log(`schema ${schemaID}`);
                this.systems.get(systemID).schema = schemaID;
                if (!this.generators.has(systemID)) continue;
                this.log('schedule', `schema: ${schemaID} -> system ${systemID}`);
                let result = this.generators.get(systemID).next().value;
                if (!result) throw new Error(`system generator ${systemID} failed to return a value, or is already complete`);
                if (result !== 'complete') continue;
                this.log('schedule', `system ${systemID} completed`);
                this.generators.delete(systemID);
            }
        }
    }
    static async create(tt?: schedule) {
        if(!tt) return;
        this.buildSchedule(tt);
        await this.createScheduledComponents();
    }
    static buildSchedule(entries: ScheduleEntry[]) {
        this.schedule.clear();
        for(let e of entries){
            let methods = e.methods;
            for(let t of e.times) {
                let entriesAtTimepoint = this.schedule.get(t) ?? {};
                for(let m in methods){
                    let newTargets = methods[m];
                    let activeTargets = entriesAtTimepoint?.[m] ?? [];
                    for(let tgt of newTargets){
                        if(!activeTargets.includes(tgt)) {
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
        let schemaProps: props;
        for await (let entry of this.schedule.values()) {
            for await (let [schemaID, systemIDs] of Object.entries(entry)) {
                for await (let systemID of systemIDs) {
                    if(!this.systems.has(systemID)) {
                        await this.addSystem(systemID);
                    }
                }
                if (!this.schemata.has(schemaID)) {
                    schemaProps = await this.addSchema(schemaID, ...systemIDs);
                }
            }
        }
    }
    static async addSystem(systemID: string) {
        let systemBP = Experiment.blueprint.systems[systemID];
        let axiom = Experiment.blueprint.syntax.axioms[systemBP.axiom];
        let letters = Alphabet.lookup(...(Experiment.blueprint.syntax.words[axiom[0]]));
        let parameters = axiom.slice(1) as number[][];
        if (letters.length !== parameters.length) throw new Error(`system ${systemID} has unequal parameter and letter lengths`);
        let system = new System(systemID, letters, parameters, systemBP);
        this.log('load', `system: ${systemID}`);
        system.terminalAge ??= this.maxTerminalAge;
        this.systems.set(systemID, system);
        this.generators.set(system.id, produce(system));
    }
    static async addSchema(schemaID: string, ...systemIDs: string[]) {
        let schema = new Schema(schemaID, {});
        this.log('load', `schema: ${schemaID}`);
        let schemaBP = Experiment.blueprint.schemata[schemaID];
        let ruleInfo = schemaBP.rules.map((rule) => load.buildRule(rule, Experiment.blueprint.syntax));
        await load.rules(schema,systemIDs, ...ruleInfo);
        await load.hooks(schema,systemIDs, schemaBP.hooks);
        Production.schemata.set(schemaID, schema);
        return schema.props;
    }
}


/*

    static reverseEntry(blueprintEntry: Record<string, string[]>) {
        let reversedEntry: Record<string, string[]> = {};
        for (let schemaID in blueprintEntry) {
            let tgtSystems = blueprintEntry[schemaID];
            for (let systemID of tgtSystems) {
                reversedEntry[systemID] ??= [];
                if (reversedEntry[systemID].includes(schemaID)) continue;
                reversedEntry[systemID].push(schemaID);
            }
        }
        return reversedEntry;
    }
    static mergeSchema(...schemaIDs: string[]) {
        if (schemaIDs.length === 1) return schemaIDs[0];
        let mergeID = schemaIDs.sort().join('_');
        if (!this.schemata.has(mergeID)) {
            let regexSources: string[] = [];
            let mergedSchema = new Schema(mergeID, {});
            for (let schemaID of schemaIDs) {
                let componentSchema = Production.schemata.get(schemaID);
                for (let key in componentSchema.props) {
                    mergedSchema.props[key] ??= componentSchema.props[key];
                }
                for (let stage in componentSchema.hooks) {
                    if (!(stage in mergedSchema.hooks)) mergedSchema.hooks[stage] = componentSchema.hooks[stage];
                    else mergedSchema.hooks[stage].push(...componentSchema.hooks[stage]);
                }
                let regexSource = componentSchema.regex.source;
                if (regexSources.includes(regexSource)) continue;
                regexSources.push(regexSource);
                mergedSchema.successors.push(...componentSchema.successors);
            }
            mergedSchema.regex = new RegExp(regexSources.join('|'), 'g');
            Production.schemata.set(mergeID, mergedSchema);
        }
        return mergeID;
    }
    */