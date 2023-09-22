export class Schema {
    id;
    props;
    regex;
    hooks;
    successors;
    constructor(ID, props) {
        [this.id, this.successors, this.props, this.hooks] = [ID, [], props, {}];
    }
}
