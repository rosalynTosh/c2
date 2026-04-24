import { SystemSettings } from "..";
import { CalcError } from "../err";
import { Unit } from "./unit";
import { parseUnit } from "./unit_parsing";
import { UNIT_PROPS } from "./unit_props";

export function disambiguateUnit(units: ReturnType<typeof parseUnit>, systemSettings: SystemSettings, str?: string): Unit {
    if (units.length == 0) throw new CalcError("unk_unit");
    if (units.length == 1) {
        console.log((units[0].unit.scale.type == "int" ? units[0].unit.scale.int : units[0].unit.scale.type == "rational" ? units[0].unit.scale.n + " / " + units[0].unit.scale.d : units[0].unit.scale.num) + units[0].unit.baseUnits.map((baseUnit) => " " + baseUnit.unitId + (baseUnit.pow == 1n ? "" : "**" + baseUnit.pow)).join(""));

        return units[0].unit;
    }

    let minModCount = units.reduce((min, { modCount }) => Math.min(min, modCount), Infinity);
    let maxModCount = units.reduce((max, { modCount }) => Math.max(max, modCount), -Infinity);

    if (minModCount !== maxModCount) {
        return disambiguateUnit(units.filter(({ modCount }) => modCount == minModCount), systemSettings, str);
    }

    // if (units.some(({ usesLongShortMod }) => usesLongShortMod) && units.some(({ usesLongShortMod }) => !usesLongShortMod)) {
    //     return disambiguateUnit(units.filter(({ usesLongShortMod }) => !usesLongShortMod), str);
    // }

    const disambiguators = (["distance", "ptStandsFor", "volume", "weight", "ton", "calendar"] as const).filter((d) => units.every(({ unit }) => unit.baseUnits.some((b) => d in (UNIT_PROPS[b.unitId].disambiguators ?? {}))));

    for (const disam of disambiguators) {
        const setting = systemSettings[disam];
        const filtered = units.filter(({ unit }) => unit.baseUnits.some((b) => (UNIT_PROPS[b.unitId].disambiguators ?? {})[disam]?.system == setting));

        if (filtered.length != 0 && filtered.length < units.length) return disambiguateUnit(filtered, systemSettings, str);
    }

    console.error(...(str === undefined ? [] : [str]), units);
    throw new CalcError("ambig_unit");
}

// for (let i = 0n; i < 52n ** 2n; i++) {
//     const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     try {
//         const str = /*alpha[Number(i / 52n / 52n)] + */alpha[Number(i / 52n % 52n)] + alpha[Number(i % 52n)];
//         disambiguateUnit(parseUnit(str), str);
//     } catch (err) {}
// }