import { add, div, mul, Num, simplify } from "./numbers";

function int(int: bigint): Num {
    return { type: "int", int };
}

function rational(n: bigint, d: bigint): Num {
    return simplify({ type: "rational", n, d });
}

// all non-physical constants accurate to within 1 in 1 quadrillion

export const PI: Num = rational(245_850_922n, 78_256_779n);
export const TAU: Num = mul(PI, int(2n));

// console.log(findApprox(isqrt(314159265358979323846264338327950288419716939937510n * 2n), 10n ** 25n, 100000000n));

export const SQRT_TAU: Num = rational(89_153_496n, 35_567_099n);

export const LN_2: Num = rational(35_565_709n, 51_310_472n);
export const LN_3: Num = rational(30_312_094n, 27_591_257n);
export const LN_5: Num = rational(16_125_974n, 10_019_631n);
export const LN_7: Num = rational(49_840_548n, 25_612_975n);
export const LN_11: Num = rational(103_411_785n, 43_126_064n);
export const LN_13: Num = rational(105_887_745n, 41_282_587n);
export const LN_17: Num = rational(90_159_331n, 31_822_288n);

// physical constants

export const N_A: Num = int(602_214_076_000_000_000_000_000n); // 1/mol

export const PLANCK_CONSTANT: Num = rational(662_607_015n, 10n ** 42n); // J*s
export const REDUCED_PLANCK_CONSTANT: Num = div(PLANCK_CONSTANT, TAU); // J*s

export const GRAVITATIONAL_CONSTANT: Num = rational(667_430n, 100_000n * 10n ** 11n); // m**3 * kg**-1 * s**-2

export const SPEED_OF_LIGHT: Num = int(299_792_458n); // m/s

export const BOLTZMANN_CONSTANT: Num = rational(1_380_649n, 1_000_000n * 10n ** 23n); // J/K

export const ELEMENTARY_CHARGE: Num = rational(1_602_176_634n, 1_000_000_000n * 10n ** 19n); // C

// table

export const CONSTS: { [id: string]: Num } = {
    PI,
    TAU,
    SQRT_TAU,
    LN_2,
    LN_3,
    LN_5,
    LN_7,
    LN_11,
    LN_13,
    LN_17,
    N_A,
    PLANCK_CONSTANT,
    REDUCED_PLANCK_CONSTANT,
    GRAVITATIONAL_CONSTANT,
    SPEED_OF_LIGHT,
    BOLTZMANN_CONSTANT,
    ELEMENTARY_CHARGE,
};