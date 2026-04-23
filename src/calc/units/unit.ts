import { Num } from "../numbers";

export interface BaseUnit {
    readonly unitId: string;
    readonly pow: bigint;
}

export type Unit = {
    readonly scale: Num;
    readonly baseUnits: BaseUnit[];
};