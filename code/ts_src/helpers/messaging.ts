import {EventEmitter} from 'events';
type UpdateMessage = {
    msg: string,
    runtime: string,
    start: string,
    current: string,
    count: number
}
export class Messenger {
    static startTime: number = Date.now();
    static ee: EventEmitter = new EventEmitter();
    static messages: UpdateMessage[];
    static reset()  {
        Messenger.messages = [];
        Messenger.startTime = Date.now();
        Messenger.ee.removeAllListeners();
    }
    static update(msg: string, tgt?: string) {
        this.messages.unshift({
            "msg": msg,
            "runtime": this.runtime,
            "start": (new Date(Date.now())).toUTCString(),
            "current": (new Date(Date.now())).toUTCString(),
            "count": this.messages.length
        });
        return this.messages[0];
    }
    static emit(event: string, ...args: (string|number)[]) {
        this.emit(event, ...args);
    }
    static stored(i: number) {
        let msgOut = this.messages?.[i] ?? { "error": `cannot get msg ${i}, only ${this.messages.length} messages have been stored`};
        return ['view', msgOut];
    }
    static get runtime() {
        let ms = Date.now()-Messenger.startTime;
        let s = Math.floor(ms/1000);
        let m = Math.floor(s/60);
        let h = Math.floor(m/60);
        return `${h}h${m%60}m${s%60}s${ms%1000}ms`;
    }
}