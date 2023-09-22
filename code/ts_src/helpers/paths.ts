import { cwd } from 'process';
import { join } from 'path';
import  {Experiment} from '../managers/experiment';
import  {MaxClassExts} from './constants';
import * as fs from 'fs/promises';
import { media_object_blueprint, object_blueprint } from '../definitions/classes/network';

// constants
export const dir = join(cwd(),'../');
console.log(`running in ${dir}`);


// formatting
export const stored = (filenameInStoredFormat: string) => filenameInStoredFormat.replaceAll('_','/');
export const max = (filepath: string) => filepath.replaceAll('\\', '/');

export const blueprint = (id: string) => join(dir, 'blueprints', `${id}.json`);
export const experiment = () => join(dir, 'results', Experiment.id);
export const blueprints = async () => await fs.readdir(join(dir, 'blueprints'));
export const experiments = async () => await fs.readdir(join(experiment(), '../'));
export const experimentFormats = async () => await fs.readdir(experiment());
export const experimentFormatDir = (format:string) => join(experiment(), format);
export const createResults = async () => {
    await fs.mkdir(join(experiment(), 'systems'), { recursive: true });
    await fs.mkdir(join(experiment(), 'media'), { recursive: true });
    await fs.mkdir(join(experiment(), 'filemaps'), { recursive: true });
    await fs.mkdir(join(experiment(), 'attributes'), { recursive: true });
    await fs.mkdir(join(experiment(), 'logs'), { recursive: true });
}
function timeStamp (){
    let arr = String(Date.now());
}
export const debugLog = (stage: string) => join(experiment(), 'logs', `${stage}_${Math.floor(Date.now()/1000).toString(36)}.txt`);
export const template = (file: string, ...categories: string[]) => `${join(dir, 'templates', ...categories.concat(stored(file)))}.json`;
export const mediaDir = () => join(experiment(),'media');
export const systemsDir = () => join(experiment(),'systems');
export const formatDir = (...categories: string[]) => join(dir, ...categories);
export const networkScript = () => join(experiment(), 'networkScript.txt');

export const script =  (filename: string, folder: string) => join(cwd(), 'js_src', 'interpretations', folder, `${filename}.js`);
//export const workerScript = (format: string, mode?: string) => script(`${(mode ?? 'streaming')}_${format}`, 'main');
export const workerScript = (mode: string) => script(mode, 'main');
export const formatBP = (filename: string, category: string) => formatIn('json', filename, 'blueprints', category);
export const patcherFiles = (ext: string, filename: string, schedule: number[][]) => schedule.map((a, i) => `${join(experiment(), filename)}_${i}.${ext}`);
export const maxObjFile = (ID: string, filename: string) => `"${join(experiment(), ID, filename).replaceAll('\\', '/')}"`;
export const subroutine = (filename: string, ...categories: string[]) => formatIn('js', filename, 'subroutines', ...categories);
export const formatIn = (ext: string, filename: string, ...categories: string[]) => `${join(formatDir(...categories), stored(filename))}.${ext}`;
export const media = (file: string, ext: string) => join(experiment(), 'media', `${file}.${ext}`).replaceAll('\\', '/');

export const patcher = (folder: string) => `"${join(dir, 'patchers', stored(folder), 'main')}.maxpat"`.replaceAll('\\', '/');
export const formatExt = (format: string) => (MaxClassExts?.[format] ?? 'json'); 
export const interpretationModule = (mode: string, method?: string) => method ? subroutine(method, 'interpretations', mode) : 'default';
export const formatScript = (format: string, mode: string) => join(cwd(), 'js_src', 'interpretations', 'formats', mode, `${format}.js`);


export const maxVarName = (obj: object_blueprint) => `${Experiment.id}_${obj.interpreterID}_${obj.fileIndex}`;
export const experimentFileName = (obj: object_blueprint) => `${Experiment.id}_${obj.interpreterID}_${obj.fileIndex}`;
export const globalFilePath = (format: string, obj: object_blueprint) => `${join(experiment(), `${maxVarName(obj)}.${formatExt(format)}`)}`;
export const interpretedFilePath = (format: string, id: string, index: number) => join(experiment(), format, `${id}_${index}.${formatExt(format)}`);
export const attributesFilePath = (format: string, id: string, index: number) => join(experiment(), "attributes", `${format}_${id}_${index}.json`);

export const systemFilePath = (id: number, generation: number, index: number, group: number) => join(experiment(), "systems", `i${id}m${index}f${group}g${generation}.json`);
// interpreter, message, file, generation
export const localFilePath = (folder: string, file: string, maxclass: string) => `${join(dir, 'patchers', stored(folder), file)}.${formatExt(maxclass)}`;

export const interpretationFormat = (format?: string) => format ? script(format, 'formats') : 'default';

