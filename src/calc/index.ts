import { add, div, mod, mul, neg, Num, pow, simplify, sub } from "./numbers";
import { parseShortUnit, Unit } from "./units";

interface BinOpAST {
    readonly type: "binOp";
    readonly op: "+" | "-" | "*" | "/" | "%" | "**";
    readonly lhs: AST;
    readonly rhs: AST;
}

interface UnaryOpAST {
    readonly type: "unaryOp";
    readonly op: string;
    readonly arg: AST;
}

interface UnitOpAST {
    readonly type: "unitOp";
    readonly unit: Unit;
    readonly arg: AST;
}

interface NumAST {
    readonly type: "num";
    readonly num: Num;
}

interface InputAST {
    readonly type: "input";
}

type AST = BinOpAST | UnaryOpAST | UnitOpAST | NumAST | InputAST;

export class CalcModule {
    private logDiv: HTMLDivElement;
    private stdInput: HTMLTextAreaElement;
    private fpInput: HTMLTextAreaElement;

    constructor() {
        this.logDiv = document.getElementById("calc_log") as HTMLDivElement;
        this.stdInput = document.getElementById("calc_input_std") as HTMLTextAreaElement;
        this.fpInput = document.getElementById("calc_input_fp") as HTMLTextAreaElement;

        this.stdInput.addEventListener("input", () => {
            this.stdInput.parentElement!.dataset.copy = this.stdInput.value;
        });

        this.stdInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                const input = this.stdInput.value;

                const ast = this.parseStd(input);
                const output = this.runCalc(ast, []);

                console.log(output);

                this.stdInput.value = "";
                this.stdInput.parentElement!.dataset.copy = this.stdInput.value;

                event.preventDefault();
            }
        });

        this.fpInput.addEventListener("input", () => {
            this.fpInput.parentElement!.dataset.copy = this.fpInput.value;
        });

        this.fpInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                const input = this.fpInput.value;

                // this.parseFp(input);

                parseShortUnit(input);

                this.fpInput.value = "";
                this.fpInput.parentElement!.dataset.copy = this.fpInput.value;

                event.preventDefault();
            }
        });
    }

    private runCalc(ast: AST, inputs: Num[]): Num {
        switch (ast.type) {
            case "binOp": {
                const lhs = this.runCalc(ast.lhs, inputs);
                const rhs = this.runCalc(ast.rhs, inputs);

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
                const arg = this.runCalc(ast.arg, inputs);

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
                return this.runCalc(ast.arg, inputs);
            }
            case "num": {
                return ast.num;
            }
            case "input": {
                return inputs.shift()!;
            }
        }
    }

    private parseStd(input: string): AST {
        const toks = (input.match(/(?:(?:[0-9]+_+)*[0-9]+\.)?[0-9]+(?:_+[0-9]+)*|[a-zA-Z]+(?:_+[a-zA-Z]+)*|\*+|\s+|;[^\r\n]*|./g) ?? []).filter(t => t[0] !== ";" && !t.match(/^\s+$/));

        type Grouping = {
            toks: (string | Grouping)[],
            type: "()" | "[]" | "{}"
        };

        const groupingStack: Grouping[] = [];
        let groupingToks: Grouping["toks"] = [];

        for (const tok of toks) {
            switch (tok) {
                case "(":
                case "[":
                case "{": {
                    groupingStack.push({
                        toks: groupingToks,
                        type: ({ "(": "()", "[": "[]", "{": "{}" } as const)[tok]
                    });
                    groupingToks = [];
                    break;
                }
                case ")":
                case "]":
                case "}": {
                    const parent = groupingStack.pop();

                    if (parent === undefined || tok !== parent.type[1]) {
                        throw new SyntaxError();
                    }

                    groupingToks = parent.toks.concat([{
                        toks: groupingToks,
                        type: parent.type
                    }]);

                    break;
                }
                default: {
                    groupingToks.push(tok);
                    break;
                }
            }
        }

        if (groupingStack.length !== 0) {
            throw new SyntaxError();
        }

        console.log(groupingToks);

        function buildBinOpsParser(ops: ReadonlyArray<BinOpAST["op"]>, followingRoundFn: (toks: Grouping["toks"]) => AST): (toks: Grouping["toks"]) => AST {
            const origOps = ops;

            return function (toks: Grouping["toks"]): AST {
                console.log("binOps for " + origOps.join(" "), toks);

                let ops = origOps;

                let state: { op: (typeof ops)[number], lhs: AST } | null = null;
                let idx = 0;

                while (true) {
                    const idxs = ops.map((op) => toks.indexOf(op, idx));
                    const foundIdxs = idxs.filter(i => i != -1);

                    if (foundIdxs.length == 0) {
                        const rhs = followingRoundFn(toks.slice(idx));

                        return state === null ? rhs : {
                            type: "binOp",
                            op: state.op,
                            lhs: state.lhs,
                            rhs
                        };
                    } else {
                        const minIdx = Math.min(...foundIdxs);
                        const op = ops[idxs.indexOf(minIdx)];

                        ops = ops.filter((_, i) => idxs[i] != -1);

                        const rhs = followingRoundFn(toks.slice(idx, minIdx));

                        state = {
                            op,
                            lhs: state === null ? rhs : {
                                type: "binOp",
                                op: state.op,
                                lhs: state.lhs,
                                rhs
                            }
                        };

                        idx = minIdx + 1;
                    }
                }
            };
        }

        // Group 1: + and -
        let parseBinOps1: (toks: Grouping["toks"]) => AST;

        // Group 2: * and / and %
        let parseBinOps2 = buildBinOpsParser(["*", "/", "%"], parseBinOps3)

        parseBinOps1 = buildBinOpsParser(["+", "-"], parseBinOps2);

        // Group 3: **
        function parseBinOps3(toks: Grouping["toks"]): AST {
            console.log("binOps3", toks);

            let rhs: AST | null = null;
            let idx = toks.length;

            while (true) {
                const idxPow = toks.lastIndexOf("**", idx - 1);

                if (idxPow == -1) {
                    const lhs = parseUnaryOps(toks.slice(0, idx));

                    return rhs === null ? lhs : {
                        type: "binOp",
                        op: "**",
                        lhs, rhs
                    };
                } else {
                    const lhs = parseUnaryOps(toks.slice(idxPow + 1, idx));

                    rhs = rhs === null ? lhs : {
                        type: "binOp",
                        op: "**",
                        lhs, rhs
                    };

                    idx = idxPow;
                }
            }
        }

        // Group 4: unary functions
        function parseUnaryOps(toks: Grouping["toks"]): AST {
            console.log("unaryOps", toks);

            if (toks.length != 0 && typeof toks[0] == "string" && toks[0][0].match(/[a-zA-Z_]/)) {
                return {
                    type: "unaryOp",
                    op: toks[0],
                    arg: parseUnaryOps(toks.slice(1))
                };
            } else {
                return parseUnits(toks);
            }
        }

        // Group 5: units
        function parseUnits(toks: Grouping["toks"]): AST {
            console.log("units", toks);

            function parseUnitAbbr(abbr: string) {
            }

            if (toks.length != 0) {
                const lastTok = toks[toks.length - 1];

                if (typeof lastTok == "string" && lastTok[0].match(/[a-zA-Z]/)) {
                    return {
                        type: "unitOp",
                        // unit: parseUnitAbbr(lastTok),
                        unit: { type: "unitless" },
                        arg: parseSingleThing(toks.slice(0, -1))
                    };
                } else if (typeof lastTok == "object" && lastTok.type == "[]") {
                    return {
                        type: "unitOp",
                        // unit: parseFullUnit(lastTok.toks),
                        unit: { type: "unitless" },
                        arg: parseUnits(toks.slice(0, -1))
                    };
                }
            }

            return parseSingleThing(toks);
        }

        // Group 6: check for single literal or grouping
        function parseSingleThing(toks: Grouping["toks"]): AST {
            console.log("singleThing", toks);

            if (toks.length == 0) {
                return {
                    type: "input"
                };
            } else if (toks.length == 1 && typeof toks[0] == "string" && toks[0][0].match(/[0-9]/)) {
                const numStr = toks[0].replace(/_/g, "");

                if (!numStr.includes(".")) {
                    return {
                        type: "num",
                        num: {
                            type: "int",
                            int: BigInt(numStr)
                        }
                    };
                }

                return {
                    type: "num",
                    num: simplify({
                        type: "rational",
                        n: BigInt(numStr.replace(/\./, "")),
                        d: 10n ** BigInt((numStr.length - 1) - numStr.indexOf("."))
                    })
                };
            } else if (toks.length == 1 && typeof toks[0] == "object" && toks[0].type == "()") {
                return parseBinOps1(toks[0].toks);
            } else {
                throw new SyntaxError();
            }
        }

        return parseBinOps1(groupingToks);
    }

    private parseFp(input: string) {
        // swizzle operations: xyzw
    }
}