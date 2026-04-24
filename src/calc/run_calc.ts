import { AST } from "./ast";
import { CalcError } from "./err";
import { add, div, mod, mul, neg, Num, pow, sub } from "./numbers";
import { convert, divUnits, mulUnits, powUnit } from "./units/ops";
import { Unit } from "./units/unit";

interface InternalValue {
    num: Num;
    unit: Unit | null;
}

export interface Value {
    num: Num;
    unit: Unit;
}

function runCalcInternal(ast: AST, inputs: Value[]): InternalValue {
    switch (ast.type) {
        case "binOp": {
            const lhs = runCalcInternal(ast.lhs, inputs);
            const rhs = runCalcInternal(ast.rhs, inputs);

            switch (ast.op) {
                case "+": {
                    return {
                        num: add(lhs.num, convert(rhs.num, rhs.unit, lhs.unit)),
                        unit: lhs.unit ?? rhs.unit
                    };
                }
                case "-": {
                    return {
                        num: sub(lhs.num, convert(rhs.num, rhs.unit, lhs.unit)),
                        unit: lhs.unit ?? rhs.unit
                    };
                }
                case "*": {
                    return {
                        num: mul(lhs.num, rhs.num),
                        unit: mulUnits(lhs.unit, rhs.unit)
                    };
                }
                case "/": {
                    return {
                        num: div(lhs.num, rhs.num),
                        unit: divUnits(lhs.unit, rhs.unit)
                    };
                }
                case "%": {
                    return {
                        num: mod(convert(lhs.num, lhs.unit, rhs.unit), rhs.num),
                        unit: rhs.unit ?? lhs.unit
                    };
                }
                case "**": {
                    if (rhs.unit !== null && rhs.unit.baseUnits.length != 0) {
                        throw new CalcError("pow_rhs");
                    }

                    const powArgNum = rhs.unit === null ? rhs.num : mul(rhs.unit.scale, rhs.num);
                    const rhsInt = powArgNum.type == "int" ? powArgNum.int : powArgNum.type == "rational" && powArgNum.d == 1n ? powArgNum.n : null;

                    if (rhsInt === null) {
                        throw new CalcError("pow_rhs");
                    }

                    return {
                        num: pow(lhs.num, { type: "int", int: rhsInt }),
                        unit: powUnit(lhs.unit, rhsInt)
                    };
                }
            }
        }
        case "unaryOp": {
            const arg = runCalcInternal(ast.arg, inputs);

            switch (ast.op) {
                case "_": {
                    return {
                        num: neg(arg.num),
                        unit: arg.unit
                    };
                }
                default: {
                    throw new CalcError("unk_fn");
                }
            }
        }
        case "unitOp": {
            const arg = runCalcInternal(ast.arg, inputs);

            if (arg.unit !== null) {
                return {
                    num: convert(arg.num, arg.unit, ast.unit),
                    unit: ast.unit
                };
            } else {
                return {
                    num: arg.num,
                    unit: ast.unit
                };
            }
        }
        case "num": {
            return {
                num: ast.num,
                unit: null
            };
        }
        case "input": {
            return inputs.shift()!;
        }
    }
}

export function runCalc(ast: AST, inputs: Value[]): Value {
    const output = runCalcInternal(ast, inputs);

    return {
        num: output.num,
        unit: output.unit ?? {
            scale: { type: "int", int: 1n },
            baseUnits: [],
        },
    };
}