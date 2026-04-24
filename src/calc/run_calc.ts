import { AST } from "./ast";
import { CalcError } from "./err";
import { add, div, floor, mod, mul, neg, Num, pow, sub } from "./numbers";
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

function runCalcInternal(ast: AST, inputs: Value[], logInputs: (Value | null)[]): InternalValue {
    switch (ast.type) {
        case "binOp": {
            const lhs = runCalcInternal(ast.lhs, inputs, logInputs);
            const rhs = runCalcInternal(ast.rhs, inputs, logInputs);

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

                    if (lhs.unit !== null && lhs.unit.baseUnits.length != 0) {
                        const rhsInt = powArgNum.type == "int" ? powArgNum.int : powArgNum.type == "rational" && powArgNum.d == 1n ? powArgNum.n : null;

                        if (rhsInt === null) {
                            throw new CalcError("pow_rhs");
                        }

                        return {
                            num: pow(lhs.num, { type: "int", int: rhsInt }),
                            unit: powUnit(lhs.unit, rhsInt)
                        };
                    } else {
                        return {
                            num: pow(lhs.num, powArgNum),
                            unit: lhs.unit === null ? null : {
                                scale: pow(lhs.unit.scale, powArgNum),
                                baseUnits: []
                            }
                        };
                    }
                }
            }
        }
        case "unaryOp": {
            const arg = runCalcInternal(ast.arg, inputs, logInputs);

            switch (ast.op) {
                case "_": {
                    return {
                        num: neg(arg.num),
                        unit: arg.unit
                    };
                }
                case "floor": {
                    return {
                        num: floor(arg.num),
                        unit: arg.unit
                    };
                }
                default: {
                    throw new CalcError("unk_fn");
                }
            }
        }
        case "unitOp": {
            const arg = runCalcInternal(ast.arg, inputs, logInputs);

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
            const input = inputs.shift();

            if (input === undefined) {
                throw new CalcError("no_inputs");
            }

            return input;
        }
        case "logInput": {
            const input = logInputs[ast.logId];

            if (input === undefined) {
                throw new CalcError("missing_input");
            }

            if (input === null) {
                throw new CalcError("cascade");
            }

            return input;
        }
    }
}

export function runCalc(ast: AST, inputs: Value[], logInputs: (Value | null)[]): Value {
    const output = runCalcInternal(ast, inputs, logInputs);

    return {
        num: output.num,
        unit: output.unit ?? {
            scale: { type: "int", int: 1n },
            baseUnits: [],
        },
    };
}