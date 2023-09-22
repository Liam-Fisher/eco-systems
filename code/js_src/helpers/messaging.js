import { EventEmitter } from 'events';
export class Messenger {
    static startTime = Date.now();
    static ee = new EventEmitter();
    static messages;
    static reset() {
        Messenger.messages = [];
        Messenger.startTime = Date.now();
        Messenger.ee.removeAllListeners();
    }
    static update(msg, tgt) {
        this.messages.unshift({
            "msg": msg,
            "runtime": this.runtime,
            "start": (new Date(Date.now())).toUTCString(),
            "current": (new Date(Date.now())).toUTCString(),
            "count": this.messages.length
        });
        return this.messages[0];
    }
    static emit(event, ...args) {
        this.emit(event, ...args);
    }
    static stored(i) {
        let msgOut = this.messages?.[i] ?? { "error": `cannot get msg ${i}, only ${this.messages.length} messages have been stored` };
        return ['view', msgOut];
    }
    static get runtime() {
        let ms = Date.now() - Messenger.startTime;
        let s = Math.floor(ms / 1000);
        let m = Math.floor(s / 60);
        let h = Math.floor(m / 60);
        return `${h}h${m % 60}m${s % 60}s${ms % 1000}ms`;
    }
}
