import { SystemSettings } from ".";
import { AST, BinOpAST, NumAST } from "./ast";
import { CONSTS } from "./consts";
import { CalcError } from "./err";
import { add, Num, simplify } from "./numbers";
import { disambiguateUnit } from "./units/disambiguate";
import { parseMultiUnit } from "./units/multi_unit_parsing";
import { Unit } from "./units/unit";
import { parseUnit } from "./units/unit_parsing";
import { UNIT_PROPS } from "./units/unit_props";

export type Grouping = {
    toks: (string | Grouping)[],
    type: "()" | "[]" | "{}"
};

export function parseStd(input: string, systemSettings: SystemSettings): AST {
    const toks = (input.normalize("NFC").match(/(?:(?:[0-9]+_+)*[0-9]+\.)?[0-9]+(?:_+[0-9]+)*(?:(?:\s*|_)[a-zA-Z\xb0åÄµöÖΩ]+(?:_+[a-zA-Z\xb0åÄµöÖΩ]+)*)?|[a-zA-Z\xb0åÄµöÖΩ.][a-zA-Z\xb0åÄµöÖΩ0-9]*(?:_+[a-zA-Z\xb0åÄµöÖΩ0-9]+)*|\*+|\s+|;[^\r\n]*|./g) ?? []).filter(t => t[0] !== ";" && !t.match(/^\s+$/));

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
                    throw new CalcError("unbalanced");
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
        throw new CalcError("unbalanced");
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
    let parseBinOps2 = buildBinOpsParser(["*", "/", "%"], parseBinOps3);

    parseBinOps1 = buildBinOpsParser(["+", "-"], parseBinOps2);

    // Group 3: **
    function parseBinOps3(toks: Grouping["toks"]): AST {
        console.log("binOps3", toks);

        let rhs: AST | null = null;
        let idx = toks.length;

        while (idx > 0) {
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

        const lhs = parseUnaryOps(toks.slice(0, idx));

        return rhs === null ? lhs : {
            type: "binOp",
            op: "**",
            lhs, rhs
        };
    }

    // Group 4: unary functions
    function parseUnaryOps(toks: Grouping["toks"]): AST {
        console.log("unaryOps", toks);

        if (toks.length != 0 && typeof toks[0] == "string" && toks[0][0].match(/[a-z_]/)) {
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

        if (toks.length != 0) {
            const lastTok = toks[toks.length - 1];

            if (typeof lastTok == "object" && lastTok.type == "[]") {
                return {
                    type: "unitOp",
                    unit: parseMultiUnit(lastTok.toks, systemSettings),
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
            const splitNum = toks[0].split(/(?<=[0-9])(?:\s*|_)(?=[^.0-9_])/);
            const numStr = splitNum[0].replace(/_/g, "");

            let num: NumAST;

            if (!numStr.includes(".")) {
                num = {
                    type: "num",
                    num: {
                        type: "int",
                        int: BigInt(numStr)
                    }
                };
            } else {
                num = {
                    type: "num",
                    num: simplify({
                        type: "rational",
                        n: BigInt(numStr.replace(/\./, "")),
                        d: 10n ** BigInt((numStr.length - 1) - numStr.indexOf("."))
                    })
                };
            }

            return 1 in splitNum ? {
                type: "unitOp",
                unit: disambiguateUnit(parseUnit(splitNum[1]), systemSettings),
                arg: num
            } : num;
        } else if (toks.length == 1 && typeof toks[0] == "object" && toks[0].type == "()") {
            return parseBinOps1(toks[0].toks);
        } else if (toks.length == 1 && typeof toks[0] == "string" && toks[0][0].match(/[A-Z]/) !== null) {
            if (toks[0].match(/^LN_[1-9]\d*$/)) {
                function factor(num: bigint): bigint[] | null {
                    if (num == 1n) return [];

                    for (const fac of [2n, 3n, 5n, 7n, 11n, 13n, 17n]) {
                        if (num % fac == 0n) {
                            const cont = factor(num / fac);

                            if (cont === null) return null;

                            return [fac, ...cont];
                        }
                    }

                    return null;
                }

                const facs = factor(BigInt(toks[0].slice(3)));

                if (facs !== null) {
                    return {
                        type: "num",
                        num: facs.reduce((n, f): Num => add(n, CONSTS["LN_" + f]!), { type: "int", int: 0n })
                    };
                }
            }

            const num = CONSTS[toks[0]];

            if (num === undefined) {
                throw new CalcError("unk_const");
            }

            return {
                type: "num",
                num
            };
        } else if (toks.length == 1 && typeof toks[0] == "string" && toks[0].match(/^\.(?:0|[1-9][0-9]*)$/) !== null) {
            return {
                type: "logInput",
                logId: Number(toks[0].slice(1))
            };
        } else {
            throw new CalcError("syntax");
        }
    }

    return parseBinOps1(groupingToks);
}