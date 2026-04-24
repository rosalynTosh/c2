// Future todo: standardize +/-Inf and +/-0 for int/rational, prevent NaN with floats

import { floatToRational } from "./const_approx";
import { CalcError } from "./err";

export interface IntNum {
    readonly type: "int";
    readonly int: bigint;
}

export interface RationalNum {
    readonly type: "rational";
    readonly n: bigint;
    readonly d: bigint;
}

export interface FloatNum {
    readonly type: "float";
    readonly num: number;
}

export type Num = IntNum | RationalNum | FloatNum;

export function simplify(num: RationalNum): RationalNum {
    let num_n = num.n < 0n ? -num.n : num.n;
    let num_d = num.d;

    if (num_d == 0n) return num_n == 0n ? num : {
        type: "rational",
        n: num.n / num_n,
        d: 0n
    };

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

export function add(lhs: Num, rhs: Num): Num {
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

export function neg(arg: Num): Num {
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

export function sub(lhs: Num, rhs: Num): Num {
    return add(lhs, neg(rhs));
}

export function mul(lhs: Num, rhs: Num): Num {
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

export function div(lhs: Num, rhs: Num): Num {
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

export function floor(arg: Num): Num {
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

export function mod(lhs: Num, rhs: Num): Num {
    return sub(lhs, mul(floor(div(lhs, rhs)), rhs));
}

export function pow(lhs: Num, rhs: Num): Num {
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

export function abs(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return { type: "int", int: arg.int < 0n ? -arg.int : arg.int };
        }
        case "rational": {
            return { type: "rational", n: arg.n < 0n ? -arg.n : arg.n, d: arg.d };
        }
        case "float": {
            return { type: "float", num: Math.abs(arg.num) };
        }
    }
}

export function ceil(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return arg;
        }
        case "rational": {
            return arg.d == 0n ? arg : { type: "rational", n: arg.n / arg.d + (arg.n <= 0n || arg.n % arg.d == 0n ? 0n : -1n), d: 1n };
        }
        case "float": {
            return { type: "float", num: Math.ceil(arg.num) };
        }
    }
}

export function trunc(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return arg;
        }
        case "rational": {
            return arg.d == 0n ? arg : { type: "rational", n: arg.n / arg.d, d: 1n };
        }
        case "float": {
            return { type: "float", num: Math.trunc(arg.num) };
        }
    }
}

export function round(arg: Num): Num {
    switch (arg.type) {
        case "int": {
            return arg;
        }
        case "rational": {
            return floor(add(arg, { type: "rational", n: 1n, d: 2n }));
        }
        case "float": {
            return { type: "float", num: Math.round(arg.num) };
        }
    }
}

export function castInt(arg: Num): IntNum {
    switch (arg.type) {
        case "int": {
            return arg;
        }
        case "rational": {
            if (arg.d != 1n) {
                throw new CalcError("domain");
            }

            return { type: "int", int: arg.n };
        }
        case "float": {
            if (!Number.isInteger(arg.num)) {
                throw new CalcError("domain");
            }

            return { type: "int", int: BigInt(arg.num) };
        }
    }
}

export function castRational(arg: Num): RationalNum {
    switch (arg.type) {
        case "int": {
            return { type: "rational", n: arg.int, d: 1n };
        }
        case "rational": {
            return arg;
        }
        case "float": {
            return floatToRational(arg.num);
        }
    }
}

export function castFloat(arg: Num): FloatNum {
    switch (arg.type) {
        case "int": {
            return { type: "float", num: Number(arg.int) };
        }
        case "rational": {
            return { type: "float", num: Number(arg.n) / Number(arg.d) };
        }
        case "float": {
            return arg;
        }
    }
}