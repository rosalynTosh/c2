import { SystemSettings } from "..";
import { CalcError } from "../err";
import { neg, Num, pow, simplify } from "../numbers";
import { Grouping } from "../std_parsing";
import { disambiguateUnit } from "./disambiguate";
import { divUnits, mulUnits, powUnit } from "./ops";
import { Unit } from "./unit";
import { parseUnit } from "./unit_parsing";

export function parseMultiUnit(toks: Grouping["toks"], systemSettings: SystemSettings): Unit {
    // Group 1: * and /
    function parseBinOps1(toks: Grouping["toks"]): Unit {
        let state: { op: "*" | "/", lhs: Unit } | null = null;
        let idx = 0;

        while (true) {
            const idxs = ["*", "/"].map((op) => toks.indexOf(op, idx));
            const foundIdxs = idxs.filter(i => i != -1);

            if (foundIdxs.length == 0) {
                const rhs = parseBinOps2(toks.slice(idx));

                return state === null ? rhs : state.op == "*" ? mulUnits(state.lhs, rhs) : divUnits(state.lhs, rhs);
            } else {
                const minIdx = Math.min(...foundIdxs);
                const op = (["*", "/"] as const)[idxs.indexOf(minIdx)];

                const rhs = parseBinOps2(toks.slice(idx, minIdx));

                state = {
                    op,
                    lhs: state === null ? rhs : state.op == "*" ? mulUnits(state.lhs, rhs) : divUnits(state.lhs, rhs)
                };

                idx = minIdx + 1;
            }
        }
    }

    // Group 2: **
    function parseBinOps2(toks: Grouping["toks"]): Unit {
        let rhs: Unit | null = null;
        let idx = toks.length;

        function toInt(rhs: Unit): bigint {
            if (rhs.baseUnits.length != 0) throw new CalcError("unit_pow_rhs");

            const rhsInt = rhs.scale.type == "int" ? rhs.scale.int : rhs.scale.type == "rational" && rhs.scale.d == 1n ? rhs.scale.n : null;

            if (rhsInt === null) throw new CalcError("unit_pow_rhs");

            return rhsInt;
        }

        while (idx > 0) {
            const idxPow = toks.lastIndexOf("**", idx - 1);

            if (idxPow == -1) {
                const lhs = parseUnaryOps(toks.slice(0, idx));

                return rhs === null ? lhs : powUnit(lhs, toInt(rhs));
            } else {
                const lhs = parseUnaryOps(toks.slice(idxPow + 1, idx));

                rhs = rhs === null ? lhs : powUnit(lhs, toInt(rhs));

                idx = idxPow;
            }
        }

        const lhs = parseUnaryOps(toks.slice(0, idx));

        return rhs === null ? lhs : powUnit(lhs, toInt(rhs));
    }

    // Group 3: unary functions
    function parseUnaryOps(toks: Grouping["toks"]): Unit {
        if (toks.length != 0 && typeof toks[0] == "string" && toks[0] == "_") {
            const arg = parseUnaryOps(toks.slice(1));

            if (arg === null) throw new CalcError("unit_syntax");

            return {
                scale: neg(arg.scale),
                baseUnits: arg.baseUnits,
            };
        } else {
            return parseSingleThing(toks);
        }
    }

    // Group 4: check for single literal or grouping
    function parseSingleThing(toks: Grouping["toks"]): Unit {
        console.log("singleThing", toks);

        if (toks.length == 0) {
            return {
                scale: { type: "int", int: 1n },
                baseUnits: []
            };
        } else if (toks.length == 1 && typeof toks[0] == "string" && toks[0][0].match(/[0-9]/)) {
            const splitNum = toks[0].split(/(?<=[0-9])(?:\s*|_)(?=[^.0-9_])/);
            const numStr = splitNum[0].replace(/_/g, "");

            let num: Num;

            if (!numStr.includes(".")) {
                num = {
                    type: "int",
                    int: BigInt(numStr)
                };
            } else {
                num = simplify({
                    type: "rational",
                    n: BigInt(numStr.replace(/\./, "")),
                    d: 10n ** BigInt((numStr.length - 1) - numStr.indexOf("."))
                });
            }

            const numUnit: Unit = {
                scale: num,
                baseUnits: []
            };

            return 1 in splitNum ? mulUnits(numUnit, disambiguateUnit(parseUnit(splitNum[1]), systemSettings)) : numUnit;
        } else if (toks.length == 1 && typeof toks[0] == "object" && toks[0].type == "()") {
            return parseBinOps1(toks[0].toks);
        } else if (toks.length == 1 && typeof toks[0] == "string" && toks[0][0].match(/[a-zA-Z]/)) {
            return disambiguateUnit(parseUnit(toks[0]), systemSettings);
        } else {
            throw new CalcError("unit_syntax");
        }
    }

    return parseBinOps1(toks);
}