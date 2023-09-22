class CollectionStorage {
    accumIndex = 0;
    collData = new Map();
    numMap = new Map();
    strMap = new Map();
    constructor() { }
    *[Symbol.iterator]() {
        for (let entry of this.collData) {
            let ind = entry[0];
            if (typeof entry[0] === 'number' && this.numMap.has(entry[0])) {
                ind = `${entry[0]} ${this.numMap.get(entry[0])}`;
            }
            yield `${entry[0]}, ${entry[1].join(' ')};\n`;
        }
        ;
    }
    store(args, index) {
        if (typeof index === 'undefined') {
            while (this.collData.has(this.accumIndex)) {
                this.accumIndex++;
            }
            return this.collData.set(this.accumIndex, args);
        }
        if (typeof index === 'number') {
            if (this.numMap.has(index)) {
                let assocStr = this.numMap.get(index);
                this.strMap.delete(assocStr);
                this.numMap.delete(index);
                this.collData.delete(index);
            }
            return this.collData.set(index, args);
        }
        if (typeof index === 'string') {
            if (this.strMap.has(index)) {
                let assocNum = this.strMap.get(index);
                this.numMap.delete(assocNum);
                this.strMap.delete(index);
                this.collData.delete(assocNum);
            }
            return this.collData.set(index, args);
        }
        if (this.collData.has(index[1])) {
            this.collData.delete(index[1]);
        }
        this.numMap.set(index[0], index[1]);
        this.strMap.set(index[1], index[0]);
        this.collData.set(index[0], args);
    }
}
export {};
