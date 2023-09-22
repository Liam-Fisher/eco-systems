import { System } from "../../production/system";
import { props } from "../static/aliases";
export type InteractionGenerator =  Generator<string[], void, unknown>; // yields other interactions to call
export type InteractionFunction = (...tgts: System[]) => InteractionGenerator
export interface interaction_blueprint {
    schedule: number[]
    systems: string[]
}
export interface InteractionModule {
    systemProps?: props
    generator: InteractionFunction
    dependencies: string[]
    dependents: string[]
}  