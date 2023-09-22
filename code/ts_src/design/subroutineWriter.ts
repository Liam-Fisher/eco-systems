import { SystemClass } from "../definitions/classes/system";
import { props } from "../definitions/static/aliases";
import State from "../production/state";
import * as fsPromises from 'fs/promises';
import * as paths from "../helpers/paths";
import { dataArgs, defaultTestState, defaultTestSystem, systemArgs } from "./constants";

type SubroutineFolder = 'maps' | 'pre_production' | 'post_production' | 'pre_mapping' | 'post_mapping';
interface SubroutineTestOptions {
    forceWrite?: boolean
    testSystem?: Partial<SystemClass>
    testState?: Partial<State>
    noWrite?: boolean
};

const moduleHeader = `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n`;
const functionHeader = `exports.subroutine = function(system) {\n\t`;
function testSubroutine(subroutine, props, options) {
    let testFunction, testResult, activeTestState, activeTestSystem;
    activeTestSystem = options?.testSystem ?? defaultTestSystem;
    activeTestSystem.props = props;
    activeTestState = options?.testState ?? Object.create(defaultTestState);
    try { testFunction = Function("system", subroutine); }
    catch (e1) { return `compile -  ${e1.name}: ${e1.message}`; }
    try { testResult = testFunction.call(activeTestState, activeTestSystem); }
    catch (e2) { return `run -  ${e2.name}: ${e2.message}`; }
    return [testResult];
}
function testMapSubroutineResult(result) {
    console.log(`map returned successorParameters ${result}`);
    if (result === undefined) return [];
    if (!Array.isArray(result)) return `type ${typeof result} instead of an array or undefined`;
    let nonArrays = new Set([...result.filter(sP => !Array.isArray(sP)).map(sP => typeof sP)]);
    if (nonArrays.size) return `non-array elements at depth 1: ${[...nonArrays].join(' ')}`;
    let nonNumbers = new Set([...result.flat().map(sP => typeof sP).filter(eT => eT !== 'number')]);
    if (nonNumbers.size) return `has non-number elements at depth 2: ${[...nonNumbers].join(' ')}`;
    return result.map(sP => `[${sP.join(' ')}]`);
}

export async function createSubroutineFile(ID: string, folder: SubroutineFolder, data: string, props: props, options: SubroutineTestOptions) {
    let subroutineString = data.replaceAll(/[\$#@]\d+/g, (...regexpMatchArgs) => {
        let key = +regexpMatchArgs[0].slice(1) - 1;
        let ctx = regexpMatchArgs[0][0];
        if (ctx === '$') return `this.${dataArgs[key]}`;
        if (ctx === '#') return `system.${systemArgs[key]}`;
        return `system.props.${Object.keys(props)[key]}`;
    });
    console.log(`compiling subroutine ${subroutineString}`);
    let testResult = testSubroutine(subroutineString, props, options);
    console.log(`map returned ${testResult}`);
    if (!options?.forceWrite && typeof testResult === "string") {
        return `subroutine failed to ${testResult}`;
    }
    if (options?.noWrite) {
        return `passed`;
    };
    if (folder === "maps") {
        let testResultTestResult = testMapSubroutineResult(testResult[0]);
        if (options?.noWrite && typeof testResultTestResult !== "string") {
            console.log(`testResult ${testResultTestResult.join(' ')}`);
            return `result ${testResultTestResult.join(' ')}`;
        }
        if (!options?.forceWrite) {
            console.log(`map test failed, returned value has ${testResultTestResult}`);
            return `map test failed, returned value has ${testResultTestResult}`;
        }
    };
    let propsString = `exports.props = ${JSON.stringify(props)};`
    let filepath = paths.subroutine(ID, folder);
    await fsPromises.writeFile(filepath, `${moduleHeader}${functionHeader}${subroutineString}\n};\n${propsString}`);
    if (options?.forceWrite) {
        return `failed`;
    };
    return `written ${filepath}`;
}