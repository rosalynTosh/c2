import { Num } from "./numbers";
import { Unit } from "./units/unit";

export interface BinOpAST {
    readonly type: "binOp";
    readonly op: "+" | "-" | "*" | "/" | "%" | "**";
    readonly lhs: AST;
    readonly rhs: AST;
}

export interface UnaryOpAST {
    readonly type: "unaryOp";
    readonly op: string;
    readonly arg: AST;
}

export interface UnitOpAST {
    readonly type: "unitOp";
    readonly unit: Unit;
    readonly arg: AST;
}

export interface NumAST {
    readonly type: "num";
    readonly num: Num;
}

export interface InputAST {
    readonly type: "input";
}

export type AST = BinOpAST | UnaryOpAST | UnitOpAST | NumAST | InputAST;