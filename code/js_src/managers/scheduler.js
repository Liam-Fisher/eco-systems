const validCodes = [42, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 91, 93, 124];
export default class Scheduler {
    static schemata;
    static interaction;
    static interpretation;
    static buildSchedule(tgt, generations, s) {
        let scheduleEntries = Object.entries(s);
        let schedulePatterns = scheduleEntries.map(k1 => `${k1[0].split('|').map(k2 => `(?:^${k2}$)`).join('|')}`);
        let scheduleRegex = new RegExp('(' + schedulePatterns.join(')|(') + ')', 'g');
        for (let i = 0; i < generations; i++) {
            String(i).replaceAll(scheduleRegex, (...args) => {
                let entryIndex = args.slice(1, -2).findIndex(el => el);
                this[tgt].set(i, scheduleEntries[entryIndex][1]);
                return '';
            });
        }
        ;
    }
    static addEvent(component, timeExpression, componentID, ...systemIDs) {
        let validExpression = this.parseExpression(timeExpression);
        if (!validExpression) {
            return;
        }
        this[component][timeExpression] ??= {};
        this[component][timeExpression][componentID] ??= [];
        systemIDs.forEach((id) => {
            if (!this[component][timeExpression][componentID].includes(id)) {
                this[component][timeExpression][componentID].push(id);
            }
        });
    }
    static parseExpression(expr) {
        return (Array.from(expr).filter(el => !validCodes.includes(el.codePointAt(0))).length === 0);
    }
}
