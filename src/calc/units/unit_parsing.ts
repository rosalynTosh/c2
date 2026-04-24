import { Num, pow } from "../numbers";
import { BINARY_SCALE_MODS_LONG, BINARY_SCALE_MODS_SHORT, SI_SCALE_MODS_LONG, SI_SCALE_MODS_SHORT } from "./scale_mods";
import { BaseUnit, Unit } from "./unit";
import { dispType, UNIT_PROPS } from "./unit_props";
import { UNIT_REFERENCE } from "./unit_reference";

const scaleRegExps = [
    ...[...Object.keys(SI_SCALE_MODS_SHORT), ...Object.keys(BINARY_SCALE_MODS_SHORT)].map((scale) => new RegExp(scale, "g")),
    ...[...Object.keys(SI_SCALE_MODS_LONG), ...Object.keys(BINARY_SCALE_MODS_LONG)].map((scale) => new RegExp(scale, "gi")),
];

export function parseUnit(unit: string): { unit: Unit, modCount: number, usesLongShortMod: boolean }[] {
    type RetType = { unit: Unit, modCount: number, usesLongShortMod: boolean }[];

    unit = unit.normalize("NFC");

    type Mod = { modStr: string, index: number };
    type ParserStage = (parts: string[], mods: Map<string, Mod | null>) => RetType;

    function buildParserStage(modId: string, startIndexModId: string | null, modRegExps: RegExp[], matchValidator: (lo: string, hi: string, modStr: string) => boolean, nStageFn: ParserStage): ParserStage {
        return function (parts: string[], mods: Map<string, Mod | null>): RetType {
            let units: RetType = nStageFn(parts, new Map([...mods.entries(), [modId, null]]));

            for (let i = startIndexModId === null ? 0 : mods.get(startIndexModId)?.index ?? 0; i < parts.length; i++) {
                const part = parts[i];

                for (const match of modRegExps.flatMap((regExp) => [...part.matchAll(regExp)])) {
                    const modStr = match[0];
                    const index = match.index;

                    const lo = part.slice(0, index);
                    const hi = part.slice(index + modStr.length);
                    const superLo = parts.slice(0, i).join("") + lo;
                    const superHi = hi + parts.slice(i + 1).join("");

                    if (!matchValidator(superLo, superHi, modStr)) continue;

                    const loCt = lo == "" ? 0 : 1;
                    const hiCt = hi == "" ? 0 : 1;

                    units = units.concat(nStageFn(
                        [
                            ...parts.slice(0, i),
                            ...(lo == "" ? [] : [lo]),
                            ...(hi == "" ? [] : [hi]),
                            ...parts.slice(i + 1)
                        ],
                        new Map([
                            ...[...mods.entries()].map(([pModId, mod]): [string, Mod | null] => [pModId, mod === null ? null : { modStr: mod.modStr, index: mod.index <= i ? mod.index : mod.index + loCt + hiCt - 1 }]),
                            [modId, { modStr, index: i + loCt }],
                        ])
                    ));
                }
            }

            return units;
        };
    }

    let parseScale: ParserStage;
    let parseLight: ParserStage;
    let parseSqOrCb: ParserStage;
    let parseWeightForce: ParserStage;
    let parseDisp: ParserStage;

    function parseBaseUnit(parts: string[], mods: Map<string, Mod | null>): RetType {
        const scaleMod = mods.get("scale")!;
        const lightMod = mods.get("light")!;
        const sqOrCbMod = mods.get("sqOrCb")!;
        const weightForceMod = mods.get("weightForce")!;
        const dispMod = mods.get("disp")!;

        if (scaleMod !== null && scaleMod.index >= parts.length) return [];
        if (lightMod !== null && lightMod.index >= parts.length) return [];
        if (weightForceMod !== null && weightForceMod.index <= 0) return [];
        if (dispMod !== null && dispMod.index <= 0) return [];
        if (weightForceMod !== null && dispMod !== null) return [];

        const words = parts.flatMap(p => p.split("_")).filter(w => w != "").join("_");
        let found = UNIT_REFERENCE.get(words);

        if (found === undefined) return [];

        if (scaleMod !== null && scaleMod.modStr in BINARY_SCALE_MODS_SHORT) {
            found = found.filter((f) => ["information_entropy", "information_rate"].includes(UNIT_PROPS[f.unitId].quantity));
        }

        if (lightMod !== null) {
            found = found.filter((f) => UNIT_PROPS[f.unitId].quantity == "time");
        }

        const sqOrCb = sqOrCbMod === null ? null : sqOrCbMod.modStr.match(/sq/gi) === null ? "cb" : "sq";
        if (sqOrCbMod !== null) {
            found = found.filter((f) => {
                const qty = UNIT_PROPS[f.unitId].quantity;
                
                return (
                    qty == "length" ||
                    lightMod !== null && qty == "time" ||
                    sqOrCb == "sq" && qty == "angle"
                );
            });
        }

        if (weightForceMod !== null) {
            found = found.filter((f) => UNIT_PROPS[f.unitId].quantity == "mass");
        }
        
        if (dispMod !== null) {
            found = found.filter((f) => ["length", "area", "volume", "mass", "force", "pressure"].includes(UNIT_PROPS[f.unitId].quantity));
        }

        const ONE = { type: "int", int: 1n } satisfies Num;

        const includeLowercases = !found.some(({ lowercases }) => lowercases == 0);
        const filteredFound = includeLowercases ? found : found.filter(({ lowercases }) => lowercases == 0);

        const scale = scaleMod === null ? ONE : (
            SI_SCALE_MODS_LONG[scaleMod.modStr] ??
            SI_SCALE_MODS_SHORT[scaleMod.modStr] ??
            BINARY_SCALE_MODS_LONG[scaleMod.modStr] ??
            BINARY_SCALE_MODS_SHORT[scaleMod.modStr]
        );

        const light = lightMod !== null;

        const sqOrCbPow = sqOrCb === null ? 1n : sqOrCb == "sq" ? 2n : 3n;

        const weightForce = weightForceMod !== null;

        const dispFluid = dispMod === null ? null : dispMod.modStr.match(/Hg|mercurcy/gi) === null ? "H2O" : "Hg";

        return filteredFound.map(({ unitId }) => {
            const baseUnit: BaseUnit = {
                unitId,
                pow: sqOrCbPow
            };

            const disp = dispFluid === null ? null : dispType(UNIT_PROPS[unitId].quantity);

            if (dispFluid !== null && disp === null) return null;

            const gPow = (weightForce ? 1n : 0n) * sqOrCbPow + (disp === null || dispMod!.modStr.match(/disp/gi) !== null ? 0n : disp == "mul" ? 1n : -1n);

            return {
                unit: {
                    scale: pow(scale, { type: "int", int: sqOrCbPow }),
                    baseUnits: [
                        baseUnit,
                        ...(light ? [{ unitId: "speed_of_light", pow: sqOrCbPow } satisfies BaseUnit] : []),
                        ...(gPow != 0n ? [{ unitId: "standard_gravity", pow: gPow } satisfies BaseUnit] : []),
                        ...(disp !== null ? [{ unitId: "density_" + dispFluid, pow: disp == "mul" ? 1n : -1n } satisfies BaseUnit] : []),
                    ]
                },
                modCount: [scaleMod, lightMod, sqOrCb, weightForceMod, dispMod].filter((mod) => mod !== null).length,
                usesLongShortMod: scaleMod !== null && scaleMod.modStr in SI_SCALE_MODS_SHORT && scaleMod.modStr.length > 1
            };
        }).filter((unit) => unit !== null);
    }

    parseDisp = buildParserStage("disp", "light", [
        /disp/gi,
        /of_?disp/gi,
        /displacement/gi,
        /of_?displacement/gi,
        /disp(?:lacement)?(?:_?of)?_?(?:H2[O0]|Hg|water|mercury)/gi,
        /of_?disp(?:lacement)?(?:_?of)?_?(?:H2[O0]|Hg|water|mercury)/gi,
        /H2[O0]/gi,
        /of_?H2[O0]/gi,
        /Hg/gi,
        /of_?Hg/gi,
        /water/gi,
        /of_?water/gi,
        /mercury/gi,
        /of_?mercury/gi,
        /(?:H2[O0]|Hg|water|mercury)_?disp/gi,
        /of_?(?:H2[O0]|Hg|water|mercury)_?disp/gi,
        /(?:H2[O0]|Hg|water|mercury)_?displacement/gi,
        /of_?(?:H2[O0]|Hg|water|mercury)_?displacement/gi,
    ], (lo, _hi) => lo != "", parseBaseUnit);
    parseWeightForce = buildParserStage("weightForce", null, [/weight/gi, /wg?h?t/g, /w/g, /force/gi, /f/g], (lo, _hi) => lo != "", parseDisp);
    parseSqOrCb = buildParserStage("sqOrCb", null, [/sq/gi, /square/gi, /c[bu]/gi, /cubic/gi], (lo, hi) => lo != "" || hi != "", parseWeightForce);
    parseLight = buildParserStage("light", null, [/l/g, /light/gi], (_lo, hi, modStr) => modStr == "l" ? hi.match(/^[^_]/) !== null : hi != "", parseSqOrCb);
    parseScale = buildParserStage("scale", null, scaleRegExps, (_lo, hi, modStr) => (modStr in SI_SCALE_MODS_LONG || modStr in BINARY_SCALE_MODS_LONG) ? hi != "" : hi.match(/^[^_]/) !== null, parseLight);

    return parseScale([unit], new Map());
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