import * as paths from '../helpers/paths'
import { InteractionFunction, InteractionGenerator, InteractionModule, interaction_blueprint } from "../definitions/classes/interaction";
import Production from "./production";
import { props } from "../definitions/static/aliases";

import { cloneRecurse } from '../helpers/loading';
import { Experiment } from './experiment';
import { schedule, ScheduleEntry } from '../definitions/classes/experiment';

export default class Interaction {
    static systems: Map<string, string[]> = new Map();
    static interactions: Map<string, InteractionFunction> = new Map();
    static generators: Map<string, InteractionGenerator> = new Map();
    static schedule: Map<number, Record<string, string[]>> = new Map();
    static active: string[];
    static max: number;
    static count: number;
    static reset() {
        this.max = Experiment.blueprint.options?.interactionStackSize ?? 12;
        this.active = [];
        this.systems.clear();
        this.interactions.clear();
        this.generators.clear();
        this.schedule.clear();
    }
    static async create(tt?: schedule) {
        if(!tt) return;;
            this.buildSchedule(tt)
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
        for await (let [generation, entry] of this.schedule) {
            for await (let [interactionID, systemIDs] of Object.entries(entry)) {
                if (!this.interactions.has(interactionID)) {
                    this.systems.set(interactionID, systemIDs);
                    await this.addMethod([interactionID], ...systemIDs);
                }
            }
        }
    }
    static async addMethod(interactionIDs: string[], ...systemIDs: string[]) {
        let ID = interactionIDs.pop();
        if (!ID || this.interactions.has(ID)) return;
        let interactionModule = await require(paths.subroutine(ID, 'interactions')) as InteractionModule;
        Production.log('load', `interaction: ${ID}`);
        this.interactions.set(ID, interactionModule.generator);
        this.addUndefined((interactionModule.systemProps ?? {}), ...systemIDs);
        let newIDs = new Set([...([interactionModule.dependents, interactionIDs, interactionModule.dependencies].flat())]);
        this.addMethod([...newIDs], ...systemIDs);
    }
    static addUndefined(systemProps: props, ...systemIDs: string[]) {
        for (let systemID of systemIDs) {
            cloneRecurse(Production.systems.get(systemID), systemProps);
        }
    }
    static buildGenerator(interactionID: string, ...systemIDs: string[]) {
        let activeArgs = this.systems.get(interactionID);
        Production.log('schedule', `interaction: ${interactionID} => systems: ${systemIDs.join(', ')}`);
        let difference = activeArgs.map((a, i) => systemIDs[i] !== a).filter(b => b)
        if(difference.length&&this.generators.has(interactionID)) return;
        let newArgs = systemIDs.map(s => Production.systems.get(s));
        if (newArgs.length && this.interactions.has(interactionID)) {
            this.generators.set(interactionID, this.interactions.get(interactionID)(...newArgs));
        }
    }
    static generate(age: number) {
        let scheduled = this.schedule.get(age);
        if(!scheduled) return; 
        this.count = 0;
        Object.entries(scheduled).forEach(([i,s])=>this.buildGenerator(i,...s));
        this.interact(Object.keys(scheduled));
    }
    static interact(interactionIDs: string[]) {
        if (!interactionIDs.length || this.max === this.count++) return;
        let ID = interactionIDs.pop();
        if (!this.generators.has(ID)) return;
        let generated = this.generators.get(ID).next();
        if (generated.done) this.generators.delete(ID);
        if (!generated.value || !generated.value.length) return;
        let newgenerators = generated.value;
        newgenerators.forEach(i => this.buildGenerator(i));
        this.interact([interactionIDs, newgenerators].flat());
    }
}