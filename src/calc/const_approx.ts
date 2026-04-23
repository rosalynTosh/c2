export function isqrt(num: bigint) {
    if (num < 0n) {
        throw new RangeError();
    }

    if (num < 2n) {
        return num;
    }

    function iter(n: bigint, x0: bigint) {
        const x1 = ((n / x0) + x0) >> 1n;

        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0;
        }

        return iter(n, x1);
    }

    return iter(num, 1n);
}

export function findApprox(numN: bigint, numD: bigint, maxD: bigint): { n: bigint, d: bigint } {
    let minDistN: bigint = 1n;
    let minDistD: bigint = 0n;

    let approxN: bigint = 0n;
    let approxD: bigint = 0n;

    for (let d = 1n; d <= maxD; d++) {
        const n0 = (numN * d) / numD;
        const n1 = n0 + 1n;

        const offset0 = n0 * numD - numN * d;
        const offset1 = n1 * numD - numN * d;
    
        const dist0 = offset0 < 0n ? -offset0 : offset0;
        const dist1 = offset1 < 0n ? -offset1 : offset1;

        const minDist = dist0 <= dist1 ? dist0 : dist1;

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