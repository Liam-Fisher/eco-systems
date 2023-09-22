import * as paths from '../helpers/paths';
import * as fs from 'fs/promises';
import Alphabet from '../helpers/alphabet';
import { Messenger } from '../helpers/messaging';
import Production from './production';
import { Control } from './control';
import Interpretation from './interpretation';
import Interaction from './interaction';
const blueprintRegExp = /(.+)_(\d+)$/g;
export class Experiment {
    static id;
    static blueprint;
    static async run(ID, generations) {
        await this.load(ID);
        await this.build();
        Control.iter(generations);
    }
    static async store(replace) {
        Messenger.ee.emit('update', `writing active experiment blueprint "${this.id}" to disk`);
        if (await this.isBuilt(this.id)) {
            if (replace) {
                await this.remove(this.id);
            }
            else {
                Messenger.ee.emit('update', `creating new version of experiment blueprint "${this.id}"`);
                await this.rename();
            }
        }
        await paths.createResults();
        await fs.writeFile(paths.blueprint(this.id), JSON.stringify(this.blueprint, null, '\n\t'));
        Messenger.ee.emit('update', `active experiment blueprint "${this.id}" written to disk`);
    }
    static async isBuilt(ID) {
        this.id = ID;
        let existingBlueprints = await paths.blueprints();
        existingBlueprints.forEach(e => console.log(e));
        let existingResults = await paths.experiments();
        return existingBlueprints.includes(this.id + ".json") && existingResults.includes(this.id);
    }
    static async remove(ID) {
        this.id = ID;
        await fs.rm(paths.blueprint(ID), { recursive: true, force: true, maxRetries: 1 });
        await fs.rm(paths.experiment(), { recursive: true, force: true, maxRetries: 1 });
        Messenger.ee.emit('update', `removed active experiment ${this.id}`);
    }
    static async build() {
        Messenger.ee.emit('update', `building experiment ${this.id}`);
        let tt = this.blueprint.timetable;
        Alphabet.define(this.blueprint.syntax.letters);
        Control.reset(this.blueprint.options, tt.generations);
        Production.reset(this.blueprint.settings?.productionLog);
        await Production.create(tt.schemata);
        Interaction.reset();
        await Interaction.create(tt.interactions);
        Interpretation.reset(this.blueprint.settings?.interpretationLog);
        await this.addFormatFolders();
        await Interpretation.create(tt.interpretations);
        Messenger.ee.emit('update', `experiment ${this.id} built`);
    }
    static async load(ID) {
        Messenger.ee.emit('update', `loading experiment blueprint ${ID}`);
        if (!(await this.isBuilt(ID))) {
            await paths.createResults();
        }
        this.blueprint = await require(paths.blueprint(ID));
        Messenger.ee.emit('update', 'loaded experiment blueprint');
    }
    static async rename() {
        let maxIndex = 0;
        let existingBlueprints = await paths.blueprints();
        for (let blueprint of existingBlueprints) {
            let match = [...blueprint.matchAll(blueprintRegExp)].flat();
            if (match[1] === this.id)
                maxIndex = Math.max(maxIndex, +match[2]);
        }
        this.id = `${this.id}_${maxIndex + 1}`;
    }
    static async addFormatFolders() {
        let activeFormats = await paths.experimentFormats();
        console.log(`activeFormats: ${activeFormats.join(' ')}`);
        for await (let interpreterBP of Object.values(this.blueprint.interpreters)) {
            if (!activeFormats.includes(interpreterBP.format)) {
                await fs.mkdir(paths.experimentFormatDir(interpreterBP.format), { recursive: true });
                activeFormats.push(interpreterBP.format);
            }
        }
    }
}
