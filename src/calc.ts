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

interface UnitlessUnit {
    readonly type: "unitless";
}

interface BaseUnit {
    readonly type: "base";
    readonly unit: string;
    readonly scale: Num;
}

interface ProdUnit {
    readonly type: "prod";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

interface QuotUnit {
    readonly type: "quot";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

interface PowUnit {
    readonly type: "pow";
    readonly arg: Unit;
    readonly pow: bigint;
}

type Unit = UnitlessUnit | BaseUnit | ProdUnit | QuotUnit | PowUnit;

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

const UNARY_OPS = [
    "sqrt"
] as const;

const UNITS = [
    "pm",
    "nm",
    "\xb5m",
    "mm",
    "cm",
    "m",
    "km",

    "mil",
    "in",
    "ft",
    "yd",
    "mi",

    "\xb0C",
    "\xb0F",
    "K",

    "ha",
    "ac",

    "pl",
    "nl",
    "ml",
    "cl",
    "dl",
    "l",

    "oz",
    "cup",
    "pi",
    "qt",
    "gal",

    "s",
    "min",
    "h",
    "hr",

    ""
] as const;

function buildUnitTable(): Map<string, Unit> {
    const SI_PREFIXES_LONG = {
        "quecto": { type: "rational", n: 1n, d: 10n ** 30n },
        "ronto": { type: "rational", n: 1n, d: 10n ** 27n },
        "yocto": { type: "rational", n: 1n, d: 10n ** 24n },
        "zepto": { type: "rational", n: 1n, d: 10n ** 21n },
        "atto": { type: "rational", n: 1n, d: 10n ** 18n },
        "femto": { type: "rational", n: 1n, d: 10n ** 15n },
        "pico": { type: "rational", n: 1n, d: 10n ** 12n },
        "nano": { type: "rational", n: 1n, d: 1_000_000_000n },
        "micro": { type: "rational", n: 1n, d: 1_000_000n },
        "milli": { type: "rational", n: 1n, d: 1000n },
        "centi": { type: "rational", n: 1n, d: 100n },
        "deci": { type: "rational", n: 1n, d: 10n },
        "deca": { type: "int", int: 10n },
        "hecto": { type: "int", int: 100n },
        "kilo": { type: "int", int: 1000n },
        "mega": { type: "int", int: 1_000_000n },
        "giga": { type: "int", int: 1_000_000_000n },
        "tera": { type: "int", int: 10n ** 12n },
        "peta": { type: "int", int: 10n ** 15n },
        "exa": { type: "int", int: 10n ** 18n },
        "zetta": { type: "int", int: 10n ** 21n },
        "yotta": { type: "int", int: 10n ** 24n },
        "ronna": { type: "int", int: 10n ** 27n },
        "quetta": { type: "int", int: 10n ** 30n },
    } as const satisfies { [prefix: string]: IntNum | RationalNum };

    const SI_PREFIXES_SHORT = {
        "q": { type: "rational", n: 1n, d: 10n ** 30n },
        "r": { type: "rational", n: 1n, d: 10n ** 27n },
        "y": { type: "rational", n: 1n, d: 10n ** 24n },
        "z": { type: "rational", n: 1n, d: 10n ** 21n },
        "a": { type: "rational", n: 1n, d: 10n ** 18n },
        "f": { type: "rational", n: 1n, d: 10n ** 15n },
        "p": { type: "rational", n: 1n, d: 10n ** 12n },
        "n": { type: "rational", n: 1n, d: 1_000_000_000n },
        "\xb5": { type: "rational", n: 1n, d: 1_000_000n },
        "mc": { type: "rational", n: 1n, d: 1_000_000n },
        "m": { type: "rational", n: 1n, d: 1000n },
        "c": { type: "rational", n: 1n, d: 100n },
        "d": { type: "rational", n: 1n, d: 10n },
        "da": { type: "int", int: 10n },
        "h": { type: "int", int: 100n },
        "k": { type: "int", int: 1000n },
        "M": { type: "int", int: 1_000_000n },
        "G": { type: "int", int: 1_000_000_000n },
        "T": { type: "int", int: 10n ** 12n },
        "P": { type: "int", int: 10n ** 15n },
        "E": { type: "int", int: 10n ** 18n },
        "Z": { type: "int", int: 10n ** 21n },
        "Y": { type: "int", int: 10n ** 24n },
        "R": { type: "int", int: 10n ** 27n },
        "Q": { type: "int", int: 10n ** 30n },
    } as const satisfies { [prefix: string]: IntNum | RationalNum };

    // binary prefixes

    const UNITS_LONG = [
        // length
        "angstrom",
        "micron",
        "meter",
        "mil",
        "inch",
        "foot",
        "yard",
        "furlong",
        "mile",
        "fathom",
        "league",
        "nautical_mile",
        "link",
        "chain",
        "rod",
        "parsec",
        "astronomical_unit",
        "planck_length",
        "pixel",
        "point",

        // area
        "hectare",
        "acre",
        "barn",
        "shed",

        // volume
        "liter",
        "us_gallon",
        "us_quart",
        "us_pint",
        "us_cup",
        "us_fluid_ounce",
        "us_tablespoon",
        "us_teaspoon",
        "imperial_gallon",
        "imperial_quart",
        "imperial_pint",
        "imperial_cup",
        "imperial_fluid_ounce",
        "imperial_tablespoon",
        "imperial_teaspoon",
        "barrel",
        "board_foot",
        "cord",
        "bushel",

        // plane angle
        "radian",
        "revolution",
        "degree_of_arc",
        "arcminute",
        "arcsecond",
        "grad",

        // solid angle
        "steradian",
        "spat",

        // mass
        "gram",
        "pound_mass",
        "ounce_mass",
        "metric_ton",
        "short_ton_mass",
        "long_ton_mass",
        "atomic_mass_unit",
        "grain",
        "troy_ounce",
        "troy_pound",
        "pound_avoirdupois",
        "ounce_avoirdupois",
        "stone",
        "carat",
        "slug",

        // time
        "second",
        "minute",
        "hour",
        "day",
        "week",
        "fortnight",
        "month",
        "year",
        "decade",
        "century",
        "millennium",
        "planck_time",

        // frequency
        "hertz",

        // speed or velocity
        "knot",
        "speed_of_light",

        // acceleration
        "standard_gravity",

        // weight/force
        "newton",
        "dyne",
        "pound",
        "poundal",
        "ounce",
        "short_ton",
        "long_ton",

        // pressure
        "atmosphere",
        "bar",
        "barye",
        "pascal",
        "torr",

        // energy
        "british_thermal_unit",
        "calorie",
        "joule",
        "electronvolt",
        "therm",

        // power
        "watt",
        "horsepower",

        // electricity/magnetism
        "coulomb",
        "ampere",
        "volt",
        "ohm",
        "siemens",
        "farad",
        "weber",
        "gauss",
        "tesla",
        "henry",

        // temperature
        "degree_celsius",
        "degree_fahrenheit",
        "degree_rankine",
        "kelvin",

        // information
        "natural_unit_of_information",
        "bit",
        "nibble",
        "byte",

        // luminous intensity
        "candela",

        // luminous flux
        "lumen",

        // illuminance
        "lux",
        "footcandle",

        // radiation and doses
        "becquerel",
        "curie",
        "rutherford",
        "roentgen",
        "gray",
        "rad",
        "rontgen_equivalent_man",
        "sievert",

        // amount of substance
        "mole",
    ];

    const UNITS_LONG_PLURALS = {} as const satisfies { [alias: string]: string };
    const UNITS_LONG_ALIASES = {
        "thou": "mil",
        "metre": "meter",
        "litre": "liter",
        "shannon": "bit"
    } as const satisfies { [alias: string]: string };
    const UNITS_LONG_ALIAS_PLURALS = {} as const satisfies { [alias: string]: string };

    const UNITS_LONG_SPECIAL = {
        "fermi": {},
        "angstrom": {},
        "\xe5ngstrom": {},
        "angstr\xf6m": {},
        "myriameter": {},
        "xu": {},
        "pi\xe8ze",
    } as const satisfies { [name: string]: Unit };

    // square/sq
    // cubic
    // light
    // displacement
    // MOA
    // of mercurcy (length to pressure)
    // of water (length to pressure)
    // interconversion between units of mass and weight/force
    // fucked up oilfield units
}

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
                        unit: parseUnitAbbr(lastTok),
                        arg: parseSingleThing(toks.slice(0, -1))
                    };
                } else if (typeof lastTok == "object" && lastTok.type == "[]") {
                    return {
                        type: "unitOp",
                        unit: parseFullUnit(lastTok.toks),
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