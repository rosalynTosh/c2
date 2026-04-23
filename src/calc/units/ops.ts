import { add, div, mul, Num, pow, sub } from "../numbers";
import { Unit } from "./unit";
import { BASE_QUANTITY, QUANTITY_DIMENSIONS, QuantityDimension, UNIT_PROPS } from "./unit_props";

function isOffsetSafe(unit: Unit): boolean {
    if (unit.baseUnits.length == 0) return true;
    if (unit.baseUnits.length == 1 && unit.baseUnits[0].pow == 1n) return true;

    return unit.baseUnits.every(({ unitId }) => UNIT_PROPS[unitId].conversionOffset === undefined);
}

function isDimensionallySafe(from: Unit, to: Unit): boolean {
    function unitToQtyDim(unit: Unit): QuantityDimension {
        const unitQtyDim: QuantityDimension = {
            length: 0n,
            mass: 0n,
            time: 0n,
            electric_current: 0n,
            thermodynamic_temperature: 0n,
            amount_of_substance: 0n,
            luminous_intensity: 0n,
        };

        for (const { unitId, pow } of unit.baseUnits) {
            const qtyDim = QUANTITY_DIMENSIONS[UNIT_PROPS[unitId].quantity];

            for (const qtyStr in qtyDim) {
                const qty = qtyStr as keyof typeof qtyDim;

                unitQtyDim[qty] += (qtyDim[qty] ?? 0n) * pow;
            }
        }

        return unitQtyDim;
    }
    
    const fromQtyDim = unitToQtyDim(from);
    const toQtyDim = unitToQtyDim(to);

    for (const qtyStr in BASE_QUANTITY) {
        const qty = qtyStr as keyof typeof BASE_QUANTITY;

        if (fromQtyDim[qty] !== toQtyDim[qty]) {
            return false;
        }
    }

    return true;
}

export function convert(num: Num, from: Unit | null, to: Unit | null): Num {
    if (from === null || to === null) return num;

    if (!isDimensionallySafe(from, to)) {
        throw new Error();
    }

    if (!isOffsetSafe(from) || !isOffsetSafe(to)) {
        throw new Error();
    }

    const fromOffset = UNIT_PROPS[from.baseUnits[0]?.unitId]?.conversionOffset ?? { type: "int", int: 0n };
    const toOffset = UNIT_PROPS[to.baseUnits[0]?.unitId]?.conversionOffset ?? { type: "int", int: 0n };

    const fromFactor = from.baseUnits.reduce((f, u) => mul(f, pow(UNIT_PROPS[u.unitId].conversionFactor, { type: "int", int: u.pow })), from.scale);
    const toFactor = to.baseUnits.reduce((f, u) => mul(f, pow(UNIT_PROPS[u.unitId].conversionFactor, { type: "int", int: u.pow })), to.scale);

    return sub(mul(add(num, fromOffset), div(fromFactor, toFactor)), toOffset);
}

export function mulUnits(lhs: Unit | null, rhs: Unit | null): Unit | null {
    if (lhs === null) return rhs;
    if (rhs === null) return lhs;

    const baseUnits: Map<string, bigint> = new Map();

    for (const baseUnit of [...lhs.baseUnits, ...rhs.baseUnits]) {
        const curr = baseUnits.get(baseUnit.unitId) ?? 0n;

        baseUnits.set(baseUnit.unitId, curr + baseUnit.pow);
    }

    return {
        scale: mul(lhs.scale, rhs.scale),
        baseUnits: [...baseUnits.entries()].map(([unitId, pow]) => ({ unitId, pow })).filter(({ pow }) => pow != 0n)
    };
}

export function divUnits(lhs: Unit | null, rhs: Unit | null): Unit | null {
    if (rhs === null) return lhs;

    const baseUnits: Map<string, bigint> = new Map();

    for (const baseUnit of lhs?.baseUnits ?? []) {
        const curr = baseUnits.get(baseUnit.unitId) ?? 0n;

        baseUnits.set(baseUnit.unitId, curr + baseUnit.pow);
    }

    for (const baseUnit of rhs.baseUnits) {
        const curr = baseUnits.get(baseUnit.unitId) ?? 0n;

        baseUnits.set(baseUnit.unitId, curr - baseUnit.pow);
    }

    return {
        scale: div(lhs?.scale ?? { type: "int", int: 1n }, rhs.scale),
        baseUnits: [...baseUnits.entries()].map(([unitId, pow]) => ({ unitId, pow })).filter(({ pow }) => pow != 0n)
    };
}

export function powUnit(unit: Unit | null, rhs: bigint): Unit | null {
    if (unit === null) return null;
    
    return {
        scale: pow(unit.scale, { type: "int", int: rhs }),
        baseUnits: unit.baseUnits.map(({ unitId, pow }) => ({ unitId, pow: pow * rhs })).filter(({ pow }) => pow != 0n)
    };
}