import { schedule,experiment_blueprint } from "../../definitions/classes/experiment";
import { Messenger } from "../../helpers/messaging";


const validTimeCodes = [42,48,49,50,51,52,53,54,55,56,57,91,93,124];
export default class TimetableUI {
    static schemata: Map<number, Record<string, string[]>>
    static interaction: Map<number, Record<string, string[]>>
    static interpretation: Map<number, Record<string, string[]>>
    static reset() {
        this.schemata.clear();
        this.interaction.clear();
        this.interpretation.clear();
    }
    static buildSchedule(tgt: string, generations: number, s: schedule) {
        let scheduleEntries = Object.entries(s);
        let schedulePatterns = scheduleEntries.map(k1 => `${k1[0].split('|').map(k2 => `(?:^${k2}$)`).join('|')}`);
        let scheduleRegex = new RegExp('(' + schedulePatterns.join(')|(') + ')', 'g');
        for (let i = 1; i <= generations; i++) {
            String(i).replaceAll(scheduleRegex, (...args) => {
                let entryIndex = args.slice(1, -2).findIndex(el => el);
                this[tgt].set(i, scheduleEntries[entryIndex][1]);
                return '';
            });
        };
    }
    static addEvent(component: keyof experiment_blueprint["timetable"], timeExpression: string, componentID: string, ...systemIDs: string[]) {
        this[component][timeExpression] ??= {};
        this[component][timeExpression][componentID] ??= [];
        systemIDs.forEach((id) => {
            if(!this[component][timeExpression][componentID].includes(id)) {
                this[component][timeExpression][componentID].push(id);
            }
        });
    }
    static parseExpression(expr: string) {
        return (Array.from(expr).filter(el => !validTimeCodes.includes(el.codePointAt(0))).length === 0);
    }
}