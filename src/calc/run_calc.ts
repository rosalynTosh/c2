import { AST } from "./ast";
import { add, div, mod, mul, neg, Num, pow, sub } from "./numbers";

export function runCalc(ast: AST, inputs: Num[]): Num {
    switch (ast.type) {
        case "binOp": {
            const lhs = runCalc(ast.lhs, inputs);
            const rhs = runCalc(ast.rhs, inputs);

            switch (ast.op) {
                case "+": {
                    return add(lhs, rhs);
                }
                case "-": {
                    return sub(lhs, rhs);
                }
                case "*": {
                    return mul(lhs, rhs);
                }
                case "/": {
                    return div(lhs, rhs);
                }
                case "%": {
                    return mod(lhs, rhs);
                }
                case "**": {
                    return pow(lhs, rhs);
                }
            }
        }
        case "unaryOp": {
            const arg = runCalc(ast.arg, inputs);

            switch (ast.op) {
                case "_": {
                    return neg(arg);
                }
                default: {
                    throw new ReferenceError();
                }
            }
        }
        case "unitOp": {
            return runCalc(ast.arg, inputs);
        }
        case "num": {
            return ast.num;
        }
        case "input": {
            return inputs.shift()!;
        }
    }
}