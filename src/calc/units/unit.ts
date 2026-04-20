import { Num } from "../numbers";

export interface UnitlessUnit {
    readonly type: "unitless";
}

export interface BaseUnit {
    readonly type: "base";
    readonly unit: string;
    readonly scale: Num;
}

export interface ProdUnit {
    readonly type: "prod";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

export interface QuotUnit {
    readonly type: "quot";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

export interface PowUnit {
    readonly type: "pow";
    readonly arg: Unit;
    readonly pow: bigint;
}

export type Unit = UnitlessUnit | BaseUnit | ProdUnit | QuotUnit | PowUnit;