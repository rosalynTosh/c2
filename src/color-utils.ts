export function rgbToComp(r: number, g: number, b: number): string {
    return Math.round(r).toString(16).padStart(2, "0") + Math.round(g).toString(16).padStart(2, "0") + Math.round(b).toString(16).padStart(2, "0");
}

export function compToRGB(comp: string): [number, number, number] {
    return comp.match(/../g)!.map(x => window.parseInt(x, 16)) as [number, number, number];
}

export function rgbToHSL(r: number, g: number, b: number): [number, number, number] {
    const r0 = r / 255;
    const g0 = g / 255;
    const b0 = b / 255;

    const max = Math.max(r0, g0, b0)
    const min = Math.min(r0, g0, b0);

    if (max === min) {
        return [0, 0, min * 100];
    } else {
        const d = max - min;

        const s0 = max + min > 1 ? d / (2 - max - min) : d / (max + min);
        const l0 = (max + min) / 2;

        switch (max) {
            case r0: {
                const h0 = (g0 - b0) / d / 6 + (g0 < b0 ? 1 : 0);

                return [h0 * 360, s0 * 100, l0 * 100];
            }
            case g0: {
                const h0 = ((b0 - r0) / d + 2) / 6;

                return [h0 * 360, s0 * 100, l0 * 100];
            }
            case b0: {
                const h0 = ((r0 - g0) / d + 4) / 6;

                return [h0 * 360, s0 * 100, l0 * 100];
            }
            default: {
                throw new Error("max != r0,g0,b0");
            }
        }
    }
}

export function hslToRGB(h: number, s: number, l: number): [number, number, number] {
    const h0 = (h / 360 % 1 + 1) % 1;
    const s0 = s / 100;
    const l0 = l / 100;

    if (s0 === 0) {
        return [l0 * 255, l0 * 255, l0 * 255];
    } else {
        function pqtToSingleComp(p: number, q: number, t: number): number {
            if (t < 0) t++;
            if (t > 1) t--;

            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

            return p;
        }

        const q = l0 < 0.5 ? l0 * (1 + s0) : l0 + s0 - l0 * s0;

        const p = 2 * l0 - q;

        const r0 = pqtToSingleComp(p, q, h0 + 1 / 3);
        const g0 = pqtToSingleComp(p, q, h0);
        const b0 = pqtToSingleComp(p, q, h0 - 1 / 3);

        return [r0 * 255, g0 * 255, b0 * 255];
    }
}

export function rgbToYCbCr(r: number, g: number, b: number): [number, number, number] {
    var y = 0.299 * r + 0.587 * g + 0.114 * b;
    var cb = -0.169 * r + -0.331 * g + 0.500 * b + 128;
    var cr = 0.500 * r + -0.419 * g + -0.081 * b + 128;

    return [y, cb, cr];
}

export function ycbcrToRGB(y: number, cb: number, cr: number): [number, number, number] {
    var r = y + 1.403 * (cr - 128);
    var g = y + -0.344 * (cb - 128) + -0.714 * (cr - 128);
    var b = y + 1.773 * (cb - 128);

    r = Math.min(Math.max(r, 0), 255);
    g = Math.min(Math.max(g, 0), 255);
    b = Math.min(Math.max(b, 0), 255);

    return [r, g, b];
}

export function roundToThousandths(n: number): number {
    return Math.round(n * 1000) / 1000;
}