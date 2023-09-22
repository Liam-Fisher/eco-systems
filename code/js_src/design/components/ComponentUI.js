export default class ComponentUI {
    static systems;
    static schemata;
    static interpreters;
    static reset(src) {
        this.systems = src.systems;
        this.schemata = src.schemata;
        this.interpreters = src.interpreters;
    }
}
