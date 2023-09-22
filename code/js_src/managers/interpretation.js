import * as worker from 'worker_threads';
import * as paths from '../helpers/paths';
import Production from './production';
import workerData from '../loaders/interpretation';
import { Messenger } from "../helpers/messaging";
import { Experiment } from './experiment';
export default class Interpretation {
    static threads = new Map();
    static interpreters = new Map();
    static schedule = new Map();
    static systems = new Map();
    static debugging;
    static reset(log) {
        this.threads.clear();
        this.interpreters.clear();
        this.schedule.clear();
        this.systems.clear();
        this.debugging = log;
    }
    static generate(age) {
        let scheduled = this.schedule.get(age);
        if (!scheduled)
            return;
        console.log(`applying interpretations...`);
        for (let ID in scheduled) {
            let systems = scheduled[ID];
            let w = this.interpreters.get(ID);
            let msg = systems.map(id => Production.systems.get(id));
            Production.log('schedule', `interpreter: ${ID} => systems: ${msg.map(s => `${s.id}: ${s.letters.length}`).join(', ')}`);
            w.postMessage(msg);
        }
    }
    static remove(threadID) {
        let ID = this.threads.get(threadID);
        this.interpreters.delete(ID);
        this.threads.delete(threadID);
        if (this.threads.size === 0) {
            Messenger.ee.emit('interpretation', 'complete');
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
        let interpreterIndex = 0;
        for await (let entry of this.schedule.values()) {
            for await (let interpretationID of Object.keys(entry)) {
                if (!this.interpreters.has(interpretationID)) {
                    Production.log('load', `interpreter: ${interpretationID}`);
                    let loaded = await this.addThread(interpretationID, interpreterIndex, Experiment.blueprint.interpreters[interpretationID]);
                    if (!loaded)
                        throw new Error(`worker load for interpretation ${interpretationID} timed out`);
                }
            }
        }
    }
    static async addThread(ID, index, BP) {
        let resolve;
        let promise = new Promise(r => resolve = r);
        let loaded = { promise, resolve };
        let interpreter = new worker.Worker(paths.workerScript(BP.mode), (await workerData(this.debugging, ID, index, BP, this.schedule))).on('message', (msg) => {
            if (msg === "ready")
                loaded.resolve(true);
            else
                console.log(`worker ${ID}: ${msg}`);
        }).on('exit', (workerID) => {
            console.log(`worker on thread ${workerID} exited`);
            this.remove(workerID);
        });
        this.threads.set(interpreter.threadId, ID);
        this.interpreters.set(ID, interpreter);
        return await loaded.promise;
    }
}
