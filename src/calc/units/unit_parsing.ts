import { BINARY_PREFIXES_LONG, BINARY_PREFIXES_SHORT, SI_PREFIXES_LONG, SI_PREFIXES_SHORT } from "./scale_mods";
import { ref } from "./unit_reference";

const scaleRegExps = [
    ...[...Object.keys(SI_PREFIXES_SHORT), ...Object.keys(BINARY_PREFIXES_SHORT)].map((scale) => new RegExp(scale, "g")),
    ...[...Object.keys(SI_PREFIXES_LONG), ...Object.keys(BINARY_PREFIXES_LONG)].map((scale) => new RegExp(scale, "gi")),
];

export function parseUnit(unit: string) {
    unit = unit.normalize("NFC");

    type ParserStage = (parts: string[], mods: Record<string, { modStr: string, index: number } | null>) => void;

    function buildParserStage(modId: string, startIndexModId: string | null, modRegExps: RegExp[], matchValidator: (lo: string, hi: string, modStr: string) => boolean, nStageFn: ParserStage): ParserStage {
        return function (parts: string[], mods: Record<string, { modStr: string, index: number } | null>): void {
            for (let i = startIndexModId === null ? 0 : mods[startIndexModId]?.index ?? 0; i < parts.length; i++) {
                const part = parts[i];

                for (const match of modRegExps.flatMap((regExp) => [...part.matchAll(regExp)])) {
                    const modStr = match[0];
                    const index = match.index;

                    const lo = part.slice(0, index);
                    const hi = part.slice(index + modStr.length);
                    const superLo = parts.slice(0, i).join("") + lo;
                    const superHi = hi + parts.slice(i + 1).join("");

                    if (!matchValidator(superLo, superHi, modStr)) continue;

                    nStageFn([
                        ...parts.slice(0, i),
                        ...(lo == "" ? [] : [lo]),
                        ...(hi == "" ? [] : [hi]),
                        ...parts.slice(i + 1)
                    ], { ...mods, [modId]: { modStr, index: i + (lo == "" ? 0 : 1) } });
                }
            }

            nStageFn(parts, { ...mods, [modId]: null });
        };
    }

    let parseScale: ParserStage;
    let parseLight: ParserStage;
    let parseSqOrCb: ParserStage;
    let parseDisp: ParserStage;

    function parseBaseUnit(parts: string[], mods: Record<string, { modStr: string, index: number } | null>) {
        const words = parts.flatMap(p => p.split("_")).filter(w => w != "").join("_");

        console.log(words, ref.get(words), mods);

        if (ref.get(words) === undefined) return;
    }

    parseDisp = buildParserStage("disp", "light", [
        /disp/gi,
        /displacement/gi,
        /disp(?:lacement)?(?:_?of)?_?(?:H2[O0]|Hg|water|mercury)/gi,
        /H2[O0]/gi,
        /Hg/gi,
        /water/gi,
        /mercury/gi,
        /(?:H2[O0]|Hg|water|mercury)_?disp/gi,
        /(?:H2[O0]|Hg|water|mercury)_?displacement/gi,
    ], (lo, _hi) => lo != "", parseBaseUnit);
    parseSqOrCb = buildParserStage("sqOrCb", null, [/sq/gi, /square/gi, /c[bu]/gi, /cubic/gi], (lo, hi) => lo != "" || hi != "", parseDisp);
    parseLight = buildParserStage("light", null, [/l/g, /light/gi], (_lo, hi) => hi.match(/^[^_]/) !== null, parseSqOrCb);
    parseScale = buildParserStage("scale", null, scaleRegExps, (_lo, hi, modStr) => (modStr in SI_PREFIXES_LONG || modStr in BINARY_PREFIXES_LONG) ? hi != "" : hi.match(/^[^_]/) !== null, parseLight);

    parseScale([unit], {});
}

// Long unit normalization:
// 1. normalize to NFC
// 2. lowercase

// Long unit matching rules:
// 1. plurals and different accent forms are accounted for
// 2. any combination of "of"s can be removed
// 3. words can be in any order
// 4. any combination of underscores can be removed

// Long unit modifier rules:
// 1. the long or lowercase short base unit may be used
// 2. long SI prefixes may be inserted before any word (but not after the last word)
// 3. short SI prefixes may be inserted before any word (but not after the last word)
// 4. for times, "light" or "l" may be inserted before any word (but not after the last word)
// 5. for lengths, "square", "squared", "sq", "cube", "cubed", "cubic", or "cb" may be inserted at any position
// 6. for lengths, "[of] mercury" or "[of] hg" may be inserted at any position
// 7. for lengths, masses, weights/forces, or volumes, "[of] water" or "[of] h2o" may be inserted at any position
// 8. for masses, weights/forces, or volumes, "[of] displacement", "[of] disp", "[of] water displacement", "[of] water disp", "[of] h2o displacement", or "[of] h20 disp" may be inserted at any position

// Short unit normalization:
// 1. normalize to NFC

// Short unit matching rules:
// 1. parts separated by underscores can be in any order
// 2. any combination of underscores can be removed
// 3. any combination of uppercase letters can be lowercased

// Short unit modifier rules:
// 1. the short or lowercase short base unit may be used
// 2. short SI prefixes may be inserted before any word (but not after the last word)
// 3. for times, "l" may be inserted before any word (but not after the last word)
// 4. for lengths, "sq" or "cb" may be inserted at any position
// 5. for lengths, "Hg" or "hg" may be inserted after any word (but not before the first word)
// 6. for lengths, masses, weights/forces, or volumes, "H2O", "h2O", "H2o", or "h2o" may be inserted after any word (but not before the first word)
// 7. for masses, weights/forces, or volumes, "disp" may be inserted after any word (but not before the first word)