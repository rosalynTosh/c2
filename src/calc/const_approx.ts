import { CalcError } from "./err";
import { RationalNum, simplify } from "./numbers";

export function isqrt(num: bigint) {
    if (num < 0n) {
        throw new CalcError("domain");
    }

    if (num < 2n) {
        return num;
    }

    if (num == 4n) return 2n;

    function iter(n: bigint, x0: bigint) {
        const x1 = ((n / x0) + x0) >> 1n;

        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0;
        }

        return iter(n, x1);
    }

    return iter(num, 1n);
}

export function floatToRational(z: number): RationalNum {
    if (Number.isNaN(z)) return { type: "rational", n: 0n, d: 0n };
    if (z == -Infinity) return { type: "rational", n: -1n, d: 0n };
    if (z == Infinity) return { type: "rational", n: 1n, d: 0n };

    const f64array = new Float64Array([z]);
    const dv = new DataView(f64array.buffer);
    const u64 = dv.getBigUint64(0, true);

    const sign = (u64 & 0x8000_0000_0000_0000n) == 0n ? 1n : -1n;
    const n = 0x0010_0000_0000_0000n | (u64 & 0x000f_ffff_ffff_ffffn);
    const xp = (u64 & 0x7ff0_0000_0000_0000n) >> 52n;

    console.log(u64, sign, n, xp);

    if (xp == 0n) {
        return simplify({
            type: "rational",
            n: u64 & 0x000f_ffff_ffff_ffffn,
            d: 2n ** 1074n
        });
    } else {
        return simplify({
            type: "rational",
            n,
            d: 2n ** (1023n - xp + 52n)
        });
    }
}

export function findQuickApprox(numN: bigint, numD: bigint, d: bigint): { n: bigint, d: bigint } {
    const signed1 = numN < 0n ? -1n : 1n;

    const n0 = (numN * d) / numD;
    const n1 = n0 + signed1;

    const offset0 = n0 * numD - numN * d;
    const offset1 = n1 * numD - numN * d;

    const dist0 = offset0 < 0n ? -offset0 : offset0;
    const dist1 = offset1 < 0n ? -offset1 : offset1;

    return { n: dist0 <= dist1 ? n0 : n1, d };
}

export function findApprox(numN: bigint, numD: bigint, maxD: bigint): { n: bigint, d: bigint } {
    const signed1 = numN < 0n ? -1n : 1n;
    
    let minDistN: bigint = 1n;
    let minDistD: bigint = 0n;

    let approxN: bigint = 0n;
    let approxD: bigint = 0n;

    for (let d = 1n; d <= maxD; d++) {
        const n0 = (numN * d) / numD;
        const n1 = n0 + signed1;

        const offset0 = n0 * numD - numN * d;
        const offset1 = n1 * numD - numN * d;
    
        const dist0 = offset0 < 0n ? -offset0 : offset0;
        const dist1 = offset1 < 0n ? -offset1 : offset1;

        const minDist = dist0 <= dist1 ? dist0 : dist1;

        if (minDist == 0n) {
            return { n: dist0 <= dist1 ? n0 : n1, d };
        }

        if (minDist * minDistD < minDistN * numD * d) {
            minDistN = minDist;
            minDistD = numD * d;

            approxN = dist0 <= dist1 ? n0 : n1;
            approxD = d;

            console.log(minDistD / minDistN, approxN, approxD);
        }
    }

    return { n: approxN, d: approxD };
}