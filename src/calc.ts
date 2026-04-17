type AST = {
    type: "binOp",
    op: "+" | "-" | "*" | "/" | "**",
    lhs: AST,
    rhs: AST
} | {
    type: "unaryOp",
    op: string,
    arg: AST
} | {
    type: "num",
    num: number
} | {
    type: "input"
};

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

                this.parseStd(input);

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

                this.parseFp(input);

                this.fpInput.value = "";
                this.fpInput.parentElement!.dataset.copy = this.fpInput.value;

                event.preventDefault();
            }
        });
    }

    private runCalc(ast: unknown) {}

    private parseStd(input: string) {
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

        // Group 1: + and -
        function parseBinOps1(toks: Grouping["toks"]): AST {
            let state: { op: "+" | "-", lhs: AST } | null = null;
            let idx = 0;

            while (true) {
                const idxPlus = toks.indexOf("+", idx);
                const idxMinus = toks.indexOf("-", idx);

                if (idxPlus == -1 && idxMinus == -1) {
                    const rhs = parseBinOps2(toks.slice(idx));

                    return state === null ? rhs : {
                        type: "binOp",
                        op: state.op,
                        lhs: state.lhs,
                        rhs
                    };
                } else if (idxPlus == -1) {
                    const rhs = parseBinOps2(toks.slice(idx, idxMinus));

                    state = {
                        op: "-",
                        lhs: state === null ? rhs : {
                            type: "binOp",
                            op: state.op,
                            lhs: state.lhs,
                            rhs
                        }
                    };

                    idx = idxMinus + 1;

                    while (true) {
                        const idxMinus = toks.indexOf("-", idx);

                        if (idxMinus == -1) {
                            const rhs = parseBinOps2(toks.slice(idx));

                            return {
                                type: "binOp",
                                op: state.op,
                                lhs: state.lhs,
                                rhs
                            };
                        } else {
                            const rhs = parseBinOps2(toks.slice(idx, idxMinus));

                            state = {
                                op: "-",
                                lhs: {
                                    type: "binOp",
                                    op: state.op,
                                    lhs: state.lhs,
                                    rhs
                                }
                            };

                            idx = idxMinus + 1;
                        }
                    }
                } else if (idxMinus == -1) {
                    const rhs = parseBinOps2(toks.slice(idx, idxPlus));

                    state = {
                        op: "+",
                        lhs: state === null ? rhs : {
                            type: "binOp",
                            op: state.op,
                            lhs: state.lhs,
                            rhs
                        }
                    };

                    idx = idxPlus + 1;

                    while (true) {
                        const idxPlus = toks.indexOf("+", idx);

                        if (idxPlus == -1) {
                            const rhs = parseBinOps2(toks.slice(idx));

                            return {
                                type: "binOp",
                                op: state.op,
                                lhs: state.lhs,
                                rhs
                            };
                        } else {
                            const rhs = parseBinOps2(toks.slice(idx, idxPlus));

                            state = {
                                op: "+",
                                lhs: {
                                    type: "binOp",
                                    op: state.op,
                                    lhs: state.lhs,
                                    rhs
                                }
                            };

                            idx = idxPlus + 1;
                        }
                    }
                } else {
                    const minIdx = Math.min(idxPlus, idxMinus);

                    const rhs = parseBinOps2(toks.slice(idx, minIdx));

                    state = {
                        op: minIdx == idxPlus ? "+" : "-",
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
        }

        // Group 2: * and /
        function parseBinOps2(toks: Grouping["toks"]): AST {
            let state: { op: "*" | "/", lhs: AST } | null = null;
            let idx = 0;

            while (true) {
                const idxTimes = toks.indexOf("*", idx);
                const idxDiv = toks.indexOf("/", idx);

                if (idxTimes == -1 && idxDiv == -1) {
                    const rhs = parseBinOps3(toks.slice(idx));

                    return state === null ? rhs : {
                        type: "binOp",
                        op: state.op,
                        lhs: state.lhs,
                        rhs
                    };
                } else if (idxTimes == -1) {
                    const rhs = parseBinOps3(toks.slice(idx, idxDiv));

                    state = {
                        op: "/",
                        lhs: state === null ? rhs : {
                            type: "binOp",
                            op: state.op,
                            lhs: state.lhs,
                            rhs
                        }
                    };

                    idx = idxDiv + 1;

                    while (true) {
                        const idxDiv = toks.indexOf("/", idx);

                        if (idxDiv == -1) {
                            const rhs = parseBinOps3(toks.slice(idx));

                            return {
                                type: "binOp",
                                op: state.op,
                                lhs: state.lhs,
                                rhs
                            };
                        } else {
                            const rhs = parseBinOps3(toks.slice(idx, idxDiv));

                            state = {
                                op: "/",
                                lhs: {
                                    type: "binOp",
                                    op: state.op,
                                    lhs: state.lhs,
                                    rhs
                                }
                            };

                            idx = idxDiv + 1;
                        }
                    }
                } else if (idxDiv == -1) {
                    const rhs = parseBinOps3(toks.slice(idx, idxTimes));

                    state = {
                        op: "*",
                        lhs: state === null ? rhs : {
                            type: "binOp",
                            op: state.op,
                            lhs: state.lhs,
                            rhs
                        }
                    };

                    idx = idxTimes + 1;

                    while (true) {
                        const idxTimes = toks.indexOf("*", idx);

                        if (idxTimes == -1) {
                            const rhs = parseBinOps3(toks.slice(idx));

                            return {
                                type: "binOp",
                                op: state.op,
                                lhs: state.lhs,
                                rhs
                            };
                        } else {
                            const rhs = parseBinOps3(toks.slice(idx, idxTimes));

                            state = {
                                op: "*",
                                lhs: {
                                    type: "binOp",
                                    op: state.op,
                                    lhs: state.lhs,
                                    rhs
                                }
                            };

                            idx = idxTimes + 1;
                        }
                    }
                } else {
                    const minIdx = Math.min(idxTimes, idxDiv);

                    const rhs = parseBinOps3(toks.slice(idx, minIdx));

                    state = {
                        op: minIdx == idxTimes ? "*" : "/",
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
        }

        // Group 3: **
        function parseBinOps3(toks: Grouping["toks"]): AST {
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
            if (toks.length != 0 && typeof toks[0] == "string" && toks[0][0].match(/[a-zA-Z_]/)) {
                return {
                    type: "unaryOp",
                    op: toks[0],
                    arg: parseUnaryOps(toks.slice(1))
                };
            } else {
                return parseSingleThing(toks);
            }
        }

        // Group 5: check for single literal or grouping
        function parseSingleThing(toks: Grouping["toks"]): AST {
            if (toks.length == 0) return {
                type: "input"
            };

            if (toks.length > 1) {
                throw new SyntaxError();
            }

            if (typeof toks[0] == "string") {
                if (!toks[0][0].match(/[0-9]/)) {
                    throw new SyntaxError();
                }

                return {
                    type: "num",
                    num: Number(toks[0])
                };
            } else {
                return parseBinOps1(toks[0].toks);
            }
        }

        const ast = parseBinOps1(groupingToks);

        console.log(ast);
    }

    private parseFp(input: string) {

    }
}