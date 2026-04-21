import { Num } from "../numbers";

export interface UnitlessUnit {
    readonly type: "unitless";
}

export interface BaseUnit {
    readonly type: "base";
    readonly unitId: string;
    readonly pow: bigint;
    readonly scale: Num;
}

export type Unit = BaseUnit[];

// export interface ScaleUnit {
//     readonly type: "scale";
//     readonly arg: Unit;
//     readonly scale: Num;
// }

// export interface PowUnit {
//     readonly type: "pow";
//     readonly arg: Unit;
//     readonly pow: bigint;
// }

// export interface ProdUnit {
//     readonly type: "prod";
//     readonly lhs: Unit;
//     readonly rhs: Unit;
// }

// export interface QuotUnit {
//     readonly type: "quot";
//     readonly lhs: Unit;
//     readonly rhs: Unit;
// }

// export type Unit = UnitlessUnit | BaseUnit | ScaleUnit | PowUnit | ProdUnit | QuotUnit;