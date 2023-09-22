
import Alphabet from "../helpers/alphabet";
import {  SchemaClass, Successor } from "../definitions/classes/schema";
import {  props } from "../definitions/static/aliases";


export class Schema implements SchemaClass {
    // Info
    id: string
    props:props
    // Rules
    regex: RegExp
    hooks: SchemaClass["hooks"]
    successors: Successor[]
    constructor(ID: string, props: props) {
        [this.id, this.successors, this.props, this.hooks] = [ID, [], props, {}];
    }
}
