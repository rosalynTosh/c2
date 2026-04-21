import { AST, BinOpAST } from "./ast";
import { simplify } from "./numbers";
import { parseUnit } from "./units/unit_parsing";

export function parseStd(input: string): AST {
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

        if (toks.length != 0) {
            const lastTok = toks[toks.length - 1];

            if (typeof lastTok == "string" && lastTok[0].match(/[a-zA-Z]/)) {
                return {
                    type: "unitOp",
                    unit: parseUnit(lastTok)[0] ?? [],
                    arg: parseSingleThing(toks.slice(0, -1))
                };
            } else if (typeof lastTok == "object" && lastTok.type == "[]") {
                return {
                    type: "unitOp",
                    // unit: parseFullUnit(lastTok.toks),
                    unit: [],
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