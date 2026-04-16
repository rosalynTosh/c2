export type CompColor = string; // six-digit hexadecimal string
export type RGBColor = { r: number, g: number, b: number }; // 0 <= r,g,b <= 255
export type HSLColor = { h: number, s: number, l: number }; // -Infinity < h < Infinity; 0 <= s,l <= 100
export type YCbCrColor = { y: number, cb: number, cr: number }; // 0 <= y,cb,cr <= 255

export function strToComp(str: string): CompColor | null {
    if (!str.match(/^[0-9a-f]{6}$/i)) return null;

    return str;
}

export function strsToRGB(rStr: string, gStr: string, bStr: string): RGBColor | null {
    for (const xStr of [rStr, gStr, bStr]) {
        if (xStr === "") return null;

        const x = Number(xStr);

        if (Number.isNaN(x) || x < 0 || x > 255) return null;
    }

    return {
        r: Number(rStr),
        g: Number(gStr),
        b: Number(bStr)
    };
}

export function strsToHSL(hStr: string, sStr: string, lStr: string): HSLColor | null {
    for (const xStr of [hStr, sStr, lStr]) {
        if (xStr === "") return null;

        const x = Number(xStr);

        if (Number.isNaN(x)) return null;
    }

    const h = Number(hStr);
    const s = Number(sStr);
    const l = Number(lStr);

    if (!Number.isFinite(h)) return null;
    if (s < 0 || s > 100) return null;
    if (l < 0 || l > 100) return null;

    return { h, s, l };
}

export function strsToYCbCr(yStr: string, cbStr: string, crStr: string): YCbCrColor | null {
    for (const xStr of [yStr, cbStr, crStr]) {
        if (xStr === "") return null;

        const x = Number(xStr);

        if (Number.isNaN(x) || x < 0 || x > 255) return null;
    }

    return {
        y: Number(yStr),
        cb: Number(cbStr),
        cr: Number(crStr)
    };
}

export function rgbToComp(rgb: RGBColor): string {
    return Math.round(rgb.r).toString(16).padStart(2, "0") + Math.round(rgb.g).toString(16).padStart(2, "0") + Math.round(rgb.b).toString(16).padStart(2, "0");
}

export function compToRGB(comp: CompColor): RGBColor {
    const parts = comp.match(/../g)!.map(x => window.parseInt(x, 16));

    return {
        r: parts[0],
        g: parts[1],
        b: parts[2]
    };
}

export function rgbToHSL(rgb: RGBColor): HSLColor {
    const r0 = rgb.r / 255;
    const g0 = rgb.g / 255;
    const b0 = rgb.b / 255;

    const max = Math.max(r0, g0, b0)
    const min = Math.min(r0, g0, b0);

    if (max === min) {
        return { h: 0, s: 0, l: min * 100 };
    } else {
        const d = max - min;

        const s0 = max + min > 1 ? d / (2 - max - min) : d / (max + min);
        const l0 = (max + min) / 2;

        switch (max) {
            case r0: {
                const h0 = (g0 - b0) / d / 6 + (g0 < b0 ? 1 : 0);

                return { h: h0 * 360, s: s0 * 100, l: l0 * 100 };
            }
            case g0: {
                const h0 = ((b0 - r0) / d + 2) / 6;

                return { h: h0 * 360, s: s0 * 100, l: l0 * 100 };
            }
            case b0: {
                const h0 = ((r0 - g0) / d + 4) / 6;

                return { h: h0 * 360, s: s0 * 100, l: l0 * 100 };
            }
            default: {
                throw new Error("max != r0,g0,b0");
            }
        }
    }
}

export function hslToRGB(hsl: HSLColor): RGBColor {
    const h0 = (hsl.h / 360 % 1 + 1) % 1;
    const s0 = hsl.s / 100;
    const l0 = hsl.l / 100;

    if (s0 === 0) {
        return { r: l0 * 255, g: l0 * 255, b: l0 * 255 };
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

        return { r: r0 * 255, g: g0 * 255, b: b0 * 255 };
    }
}

export function rgbToYCbCr(rgb: RGBColor): YCbCrColor {
    const { r, g, b } = rgb;

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = -0.169 * r + -0.331 * g + 0.500 * b + 128;
    const cr = 0.500 * r + -0.419 * g + -0.081 * b + 128;

    return { y, cb, cr };
}

export function ycbcrToRGB(ycbcr: YCbCrColor): RGBColor {
    const { y, cb, cr } = ycbcr;

    const ru = y + 1.403 * (cr - 128);
    const gu = y + -0.344 * (cb - 128) + -0.714 * (cr - 128);
    const bu = y + 1.773 * (cb - 128);

    const r = Math.min(Math.max(ru, 0), 255);
    const g = Math.min(Math.max(gu, 0), 255);
    const b = Math.min(Math.max(bu, 0), 255);

    return { r, g, b };
}

export function roundToThousandths(n: number): number {
    return Math.round(n * 1000) / 1000;
}