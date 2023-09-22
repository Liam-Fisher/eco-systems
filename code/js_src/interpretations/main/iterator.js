export default function* iterateSystems(...systems) {
    while (this.letterIndex < this.maxLetters) {
        if (this?.sequenceSchema) {
            for (let targetSystem of systems) {
                let letter = targetSystem.letters?.[this.letterIndex];
                let parameter = targetSystem.parameters?.[this.letterIndex];
                if (letter && parameter) {
                    let activeMethods = this?.sequenceSchema[targetSystem.id]?.[letter] ?? [];
                    for (let methodID of activeMethods) {
                        let result = this[methodID].call(this, targetSystem, ...parameter);
                        if (result) {
                            yield result;
                        }
                    }
                }
            }
        }
        this.letterIndex++;
    }
}
