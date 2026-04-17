// Future todo: standardize +/-Inf and +/-0 for int/rational, prevent NaN with floats

interface IntNum {
    readonly type: "int";
    readonly int: bigint;
}

interface RationalNum {
    readonly type: "rational";
    readonly n: bigint;
    readonly d: bigint;
}

interface FloatNum {
    readonly type: "float";
    readonly num: number;
}

type Num = IntNum | RationalNum | FloatNum;

interface BinOpAST {
    readonly type: "binOp";
    readonly op: "+" | "-" | "*" | "/" | "%" | "**";
    readonly lhs: AST;
    readonly rhs: AST;
}

type AST = BinOpAST | {
    type: "unaryOp",
    op: string,
    arg: AST
} | {
    type: "num",
    num: Num
} | {
    type: "input"
};

function simplify(num: RationalNum): RationalNum {
    let num_n = num.n < 0n ? -num.n : num.n;
    let num_d = num.d;

    let gcd: bigint;

    if (num_n == 0n) {
        gcd = num_d;
    } else if (num_d == 0n) {
        gcd = num_n;
    } else if (num_n == num_d) {
        gcd = num_n;
    } else {
        let i_0;
        let i_1;

        for (i_0 = 0n; num_n % 2n == 0n; i_0++) {
            num_n /= 2n;
        }

        for (i_1 = 0n; num_d % 2n == 0n; i_1++) {
            num_d /= 2n;
        }

        const k = i_0 < i_1 ? i_0 : i_1;

        let n;

        while (num_n != num_d) {
            if (num_d > num_n) {
                n = num_n;

                num_n = num_d;
                num_d = n;
            }

            num_n -= num_d;

            do {
                num_n /= 2n;
            } while (!(num_n % 2n));
        }

        gcd = num_n * (2n ** k);
    }

    return {
        type: "rational",
        n: num.n / gcd,
        d: num.d / gcd
    };
}

function add(lhs: Num, rhs: Num): Num {
    switch (lhs.type) {
        case "int": {
            switch (rhs.type) {
                case "int": {
                    return { type: "int", int: lhs.int + rhs.int };
                }
                case "rational": {
                    return { type: "rational", n: lhs.int * rhs.d + rhs.n, d: rhs.d };
                }
                case "float": {
                    return { type: "float", num: Number(lhs.int) + rhs.num };
                }
            }
        }
        case "rational": {
            switch (rhs.type) {
                case "int": {
                    return { type: "rational", n: lhs.n + rhs.int * lhs.d, d: lhs.d };
                }
                case "rational": {
                    return simplify({ type: "rational", n: lhs.n * rhs.d + rhs.n * lhs.d, d: lhs.d * rhs.d });
                }
                case "float": {
                    return { type: "float", num: Number(lhs.n) / Number(lhs.d) + rhs.num };
                }
            }
        }
        case "float": {
            switch (rhs.type) {
                case "int": {
                    return { type: "float", num: lhs.num + Number(rhs.int) };
                }
                case "rational": {
                    return { type: "float", num: lhs.num + Number(rhs.n) / Number(rhs.d) };
                }
                case "float": {
                    return { type: "float", num: lhs.num + rhs.num };
                }
            }
        }
    }
}

function neg(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return { type: "int", int: -arg.int };
        }
        case "rational": {
            return { type: "rational", n: -arg.n, d: arg.d };
        }
        case "float": {
            return { type: "float", num: -arg.num };
        }
    }
}

function sub(lhs: Num, rhs: Num): Num {
    return add(lhs, neg(rhs));
}

function mul(lhs: Num, rhs: Num): Num {
    switch (lhs.type) {
        case "int": {
            switch (rhs.type) {
                case "int": {
                    return { type: "int", int: lhs.int * rhs.int };
                }
                case "rational": {
                    return simplify({ type: "rational", n: lhs.int * rhs.n, d: rhs.d });
                }
                case "float": {
                    return { type: "float", num: Number(lhs.int) * rhs.num };
                }
            }
        }
        case "rational": {
            switch (rhs.type) {
                case "int": {
                    return simplify({ type: "rational", n: lhs.n * rhs.int, d: lhs.d });
                }
                case "rational": {
                    return simplify({ type: "rational", n: lhs.n * rhs.n, d: lhs.d * rhs.d });
                }
                case "float": {
                    return { type: "float", num: Number(lhs.n) / Number(lhs.d) * rhs.num };
                }
            }
        }
        case "float": {
            switch (rhs.type) {
                case "int": {
                    return { type: "float", num: lhs.num * Number(rhs.int) };
                }
                case "rational": {
                    return { type: "float", num: lhs.num * Number(rhs.n) / Number(rhs.d) };
                }
                case "float": {
                    return { type: "float", num: lhs.num * rhs.num };
                }
            }
        }
    }
}

function div(lhs: Num, rhs: Num): Num {
    switch (lhs.type) {
        case "int": {
            switch (rhs.type) {
                case "int": {
                    return simplify({ type: "rational", n: lhs.int, d: rhs.int });
                }
                case "rational": {
                    return simplify({ type: "rational", n: lhs.int * rhs.d, d: rhs.n });
                }
                case "float": {
                    return { type: "float", num: Number(lhs.int) / rhs.num };
                }
            }
        }
        case "rational": {
            switch (rhs.type) {
                case "int": {
                    return simplify({ type: "rational", n: lhs.n, d: lhs.d * rhs.int });
                }
                case "rational": {
                    return simplify({ type: "rational", n: lhs.n * rhs.d, d: lhs.d * rhs.n });
                }
                case "float": {
                    return { type: "float", num: Number(lhs.n) / Number(lhs.d) / rhs.num };
                }
            }
        }
        case "float": {
            switch (rhs.type) {
                case "int": {
                    return { type: "float", num: lhs.num / Number(rhs.int) };
                }
                case "rational": {
                    return { type: "float", num: lhs.num / Number(rhs.n) * Number(rhs.d) };
                }
                case "float": {
                    return { type: "float", num: lhs.num / rhs.num };
                }
            }
        }
    }
}

function floor(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return arg;
        }
        case "rational": {
            return arg.d == 0n ? arg : { type: "rational", n: arg.n / arg.d + (arg.n >= 0n || arg.n % arg.d == 0n ? 0n : -1n), d: 1n };
        }
        case "float": {
            return { type: "float", num: Math.floor(arg.num) };
        }
    }
}

function mod(lhs: Num, rhs: Num): Num {
    return sub(lhs, mul(floor(div(lhs, rhs)), rhs));
}

function pow(lhs: Num, rhs: Num): Num {
    switch (lhs.type) {
        case "int": {
            switch (rhs.type) {
                case "int": {
                    return rhs.int >= 0n ? { type: "rational", n: lhs.int ** rhs.int, d: 1n } : { type: "rational", n: 1n, d: lhs.int ** -rhs.int };
                }
                case "rational": {
                    return { type: "float", num: Number(lhs.int) ** (Number(rhs.n) / Number(rhs.d)) };
                }
                case "float": {
                    return { type: "float", num: Number(lhs.int) ** rhs.num };
                }
            }
        }
        case "rational": {
            switch (rhs.type) {
                case "int": {
                    return rhs.int >= 0n ? { type: "rational", n: lhs.n ** rhs.int, d: lhs.d ** rhs.int } : { type: "rational", n: lhs.d ** -rhs.int, d: lhs.n ** -rhs.int };
                }
                case "rational": {
                    return { type: "float", num: (Number(lhs.n) / Number(lhs.d)) ** (Number(rhs.n) / Number(rhs.d)) };
                }
                case "float": {
                    return { type: "float", num: (Number(lhs.n) / Number(lhs.d)) ** rhs.num };
                }
            }
        }
        case "float": {
            switch (rhs.type) {
                case "int": {
                    return { type: "float", num: lhs.num ** Number(rhs.int) };
                }
                case "rational": {
                    return { type: "float", num: lhs.num ** (Number(rhs.n) / Number(rhs.d)) };
                }
                case "float": {
                    return { type: "float", num: lhs.num ** rhs.num };
                }
            }
        }
    }
}

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

                this.parseFp(input);

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

            return function(toks: Grouping["toks"]): AST {
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
                return parseSingleThing(toks);
            }
        }

        // Group 5: check for single literal or grouping
        function parseSingleThing(toks: Grouping["toks"]): AST {
            console.log("singleThing", toks);

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
            } else {
                return parseBinOps1(toks[0].toks);
            }
        }

        return parseBinOps1(groupingToks);
    }

    private parseFp(input: string) {
        // swizzle operations: xyzw
    }
}