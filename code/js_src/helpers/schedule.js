"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildSchedule(generations, s) {
    let unmergedSchedule = new Map();
    let scheduleEntries = Object.entries(s);
    let schedulePatterns = scheduleEntries.map(k1 => `${k1[0].split('|').map(k2 => `(?:^${k2}$)`).join('|')}`);
    let scheduleRegex = new RegExp('(' + schedulePatterns.join(')|(') + ')', 'g');
    for (let i = 1; i <= generations; i++) {
        String(i).replaceAll(scheduleRegex, (...args) => {
            let entryIndex = args.slice(1, -2).findIndex(el => el);
            let scheduleEntry = scheduleEntries[entryIndex][1];
            unmergedSchedule.set(i, this.reverseEntry(scheduleEntry));
            return '';
        });
    }
    ;
    return unmergedSchedule;
}
