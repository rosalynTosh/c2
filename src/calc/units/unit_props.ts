import { BOLTZMANN_CONSTANT, ELEMENTARY_CHARGE, LN_2, LN_3, LN_5, N_A, PI, SPEED_OF_LIGHT, SQRT_TAU, TAU } from "../consts";
import { add, div, mul, Num, pow, simplify } from "../numbers";

export type BaseQuantity = (
    "length" |
    "mass" |
    "time" |
    "electric_current" |
    "thermodynamic_temperature" |
    "amount_of_substance" |
    "luminous_intensity"
);

export type Quantity = (
    "length" | "area" | "volume" |
    "angle" | "solid_angle" |
    "mass" | "density" |
    "time" | "frequency" | "speed" | "acceleration" |
    "force" | "pressure" |
    "energy" | "power" |
    "electric_charge" | "electric_current" | "electric_potential" | "electric_resistance" | "electric_conductance" |
    "capacitance" |
    "magnetic_flux" | "magnetic_flux_density" |
    "inductance" |
    "temperature" |
    "information_entropy" | "information_rate" |
    "luminous_intensity" | "luminous_flux" | "illuminance" |
    "radiation_source_activity" | "radiation_exposure" | "radiation_absorbed_dose" | "radiation_equivalent_dose" |
    "amount_of_substance" |
    "proportion"
);

export type QuantityDimension = { [qty in BaseQuantity]: bigint };

export const QUANTITY_DIMENSIONS: { [qty in Quantity]: Partial<QuantityDimension> } = {
    "length": { length: 1n },
    "area": { length: 2n },
    "volume": { length: 3n },
    "angle": {},
    "solid_angle": {},
    "mass": { mass: 1n },
    "density": { mass: 1n, length: -3n },
    "time": { time: 1n },
    "frequency": { time: -1n },
    "speed": { length: 1n, time: -1n },
    "acceleration": { length: 1n, time: -2n },
    "force": { length: 1n, mass: 1n, time: -2n },
    "pressure": { length: -1n, mass: 1n, time: -2n },
    "energy": { length: 2n, mass: 1n, time: -2n },
    "power": { length: 2n, mass: 1n, time: -3n },
    "electric_charge": { time: 1n, electric_current: 1n },
    "electric_current": { electric_current: 1n },
    "electric_potential": { length: 2n, mass: 1n, time: -3n, electric_current: -1n },
    "electric_resistance": { length: 2n, mass: 1n, time: -3n, electric_current: -2n },
    "electric_conductance": { length: -2n, mass: -1n, time: 3n, electric_current: 2n },
    "capacitance": { length: -2n, mass: -1n, time: 4n, electric_current: 2n },
    "magnetic_flux": { length: 2n, mass: 1n, time: -2n, electric_current: -1n },
    "magnetic_flux_density": { mass: 1n, time: -2n, electric_current: -1n },
    "inductance": { length: 2n, mass: 1n, time: -2n, electric_current: -2n },
    "temperature": { thermodynamic_temperature: 1n },
    "information_entropy": { length: 2n, mass: 1n, time: -2n, thermodynamic_temperature: -1n },
    "information_rate": { length: 2n, mass: 1n, time: -3n, thermodynamic_temperature: -1n },
    "luminous_intensity": { luminous_intensity: 1n },
    "luminous_flux": { luminous_intensity: 1n },
    "illuminance": { length: -2n, luminous_intensity: 1n },
    "radiation_source_activity": { time: -1n },
    "radiation_exposure": { mass: -1n, time: 1n, electric_current: 1n },
    "radiation_absorbed_dose": { length: 2n, time: -2n },
    "radiation_equivalent_dose": { length: 2n, time: -2n },
    "amount_of_substance": { amount_of_substance: 1n },
    "proportion": {},
} as const satisfies { [qty in Quantity]: Partial<QuantityDimension> };

export const BASE_QUANTITY = {
    "length": null,
    "mass": null,
    "time": null,
    "electric_current": null,
    "thermodynamic_temperature": null,
    "amount_of_substance": null,
    "luminous_intensity": null,
} as const satisfies { [qty in BaseQuantity]: null };

export interface UnitWordPropsNoun {
    readonly type: "noun";
    readonly word: string;
    readonly accents?: ReadonlyArray<{ index: number, unicode: string }>;
    readonly plurals?: ReadonlyArray<string>; // default: with trailing s
}

export interface UnitWordPropsModifier {
    readonly type: "modifier";
    readonly word: string;
    readonly isOf: boolean;
    readonly accents?: ReadonlyArray<{ index: number, unicode: string }>;
    readonly plurals?: ReadonlyArray<string>; // default: none
}

export type UnitWordProps = UnitWordPropsNoun | UnitWordPropsModifier;

export type UnitFormProps = ReadonlyArray<UnitWordProps>;

export interface UnitDisambiguatorProps<System> {
    readonly system: System;
    readonly systemForms?: ReadonlyArray<UnitFormProps>;
    readonly shortSystemForms?: ReadonlyArray<UnitFormProps>;
}

export type CalendarSystem = (
    "common" | // 365 days / year
    "leap" | // 366 days / year
    "julian" | // 365.25 days / year
    "gregorian" | // 365.2425 days/year
    "mean_tropical" | // precise
    "sidereal" | // precise
    "synodic" | // precise
    "short_month" | // 28 days / month
    "hollow_month" | // 29 days / month
    "full_month" | // 30 days / month
    "long_month" // 31 days / month
);

export interface UnitDisambiguators {
    readonly distance?: UnitDisambiguatorProps<"us_land" | "us_survey" | "nautical">;
    readonly ptStandsFor?: UnitDisambiguatorProps<"point" | "pint">;
    readonly volume?: UnitDisambiguatorProps<"us" | "imperial">;
    readonly weight?: UnitDisambiguatorProps<"troy" | "us">;
    readonly ton?: UnitDisambiguatorProps<"si" | "short" | "long">;
    readonly calendar?: UnitDisambiguatorProps<CalendarSystem>;
}

export interface UnitProps {
    readonly quantity: Quantity;
    readonly conversionOffset?: Num; // used only for degrees of temperature, applied before conversion factor
    readonly conversionFactor: Num; // relative to SI base unit

    readonly disambiguators?: UnitDisambiguators; // used to differentiate units with the same name

    readonly forms: ReadonlyArray<UnitFormProps>;
    readonly shortForms?: ReadonlyArray<UnitFormProps>;
    readonly rawShortForms?: ReadonlyArray<string>; // no disambiguators
}

function noun(word: string, options?: Partial<UnitWordPropsNoun>): UnitWordProps {
    return {
        type: "noun",
        word,
        accents: options?.accents,
        plurals: options?.plurals
    };
}

function modifier(word: string, options?: Partial<UnitWordPropsModifier>): UnitWordProps {
    const isOf = word.startsWith("of ");
    if (isOf) {
        word = word.slice(3);
    }

    return {
        type: "modifier",
        word,
        isOf: options?.isOf ?? isOf,
        accents: options?.accents,
        plurals: options?.plurals
    };
}

function simpleForms(formWords: string[]): UnitFormProps[] {
    return formWords.map((word) => [noun(word)]);
}

const US_LAND_DISTANCE_SYSTEM = {
    distance: {
        system: "us_land",
        systemForms: [[modifier("united_states")], [modifier("statutory")], [modifier("statute")], [modifier("international")], [modifier("land")]],
        shortSystemForms: [[modifier("US")], [modifier("us")], [modifier("stat")], [modifier("intl")], [modifier("int")], [modifier("land")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const NAUTICAL_DISTANCE_SYSTEM = {
    distance: {
        system: "nautical",
        systemForms: [[modifier("nautical")]],
        shortSystemForms: [[modifier("naut")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const US_VOLUME_SYSTEM = {
    volume: {
        system: "us",
        systemForms: [[modifier("united_states")], [modifier("customary")]],
        shortSystemForms: [[modifier("US")], [modifier("us")], [modifier("cust")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const IMPERIAL_VOLUME_SYSTEM = {
    volume: {
        system: "imperial",
        systemForms: [[modifier("imperial")]],
        shortSystemForms: [[modifier("imp")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const TROY_WEIGHT_SYSTEM = {
    weight: {
        system: "troy",
        systemForms: [[modifier("troy")]],
        shortSystemForms: [[modifier("tr")], [modifier("t")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const US_WEIGHT_SYSTEM = {
    weight: {
        system: "us",
        systemForms: [[modifier("united_states")], [modifier("international")], [modifier("avoirdupois")]],
        shortSystemForms: [[modifier("US")], [modifier("us")], [modifier("intl")], [modifier("int")], [modifier("av")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const SHORT_TON_SYSTEM = {
    ton: {
        system: "short",
        systemForms: [[modifier("short")]],
        shortSystemForms: [[modifier("sh")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const LONG_TON_SYSTEM = {
    ton: {
        system: "long",
        systemForms: [[modifier("long")]],
        shortSystemForms: [[modifier("long")]],
    },
} as const satisfies Partial<UnitDisambiguators>;

const COMMON_CALENDAR_SYSTEM = {
    calendar: {
        system: "common",
        systemForms: [[modifier("common")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const LEAP_CALENDAR_SYSTEM = {
    calendar: {
        system: "leap",
        systemForms: [[modifier("leap")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const JULIAN_CALENDAR_SYSTEM = {
    calendar: {
        system: "julian",
        systemForms: [[modifier("julian")]],
        shortSystemForms: [[modifier("jul")], [modifier("jul"), modifier("av")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const GREGORIAN_CALENDAR_SYSTEM = {
    calendar: {
        system: "gregorian",
        systemForms: [[modifier("gregorian")]],
        shortSystemForms: [[modifier("greg")], [modifier("greg"), modifier("av")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const MEAN_TROPICAL_CALENDAR_SYSTEM = {
    calendar: {
        system: "mean_tropical",
        systemForms: [[modifier("mean"), modifier("tropical")], [modifier("solar")]],
        shortSystemForms: [[modifier("trop")], [modifier("trop"), modifier("av")], [modifier("sol")], [modifier("sol"), modifier("av")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const SIDEREAL_CALENDAR_SYSTEM = {
    calendar: {
        system: "sidereal",
        systemForms: [[modifier("sidereal")]],
        shortSystemForms: [[modifier("sr")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const SYNODIC_CALENDAR_SYSTEM = {
    calendar: {
        system: "synodic",
        systemForms: [[modifier("synodic")], [modifier("lunar")]],
        shortSystemForms: [[modifier("syn")], [modifier("lun")], [modifier("lr")]],
    }
} as const satisfies Partial<UnitDisambiguators>;

const MONTH_FORMS = {
    forms: simpleForms(["month"]),
    shortForms: simpleForms(["mo", "mos", "mon", "mons"]),
} as const satisfies Partial<UnitProps>;

const YEAR_FORMS = {
    forms: simpleForms(["year"]),
    shortForms: simpleForms(["a", "y", "yr", "yrs"]),
} as const satisfies Partial<UnitProps>;

const DECADE_FORMS = {
    forms: simpleForms(["decade"]),
    shortForms: simpleForms(["dec"]),
} as const satisfies Partial<UnitProps>;

const CENTURY_FORMS = {
    forms: [[noun("century", { plurals: ["centuries"] })]],
} as const satisfies Partial<UnitProps>;

const MILLENNIUM_FORMS = {
    forms: [[noun("millennium", { plurals: ["millennia"] })]],
} as const satisfies Partial<UnitProps>;

function int(int: bigint): Num {
    return { type: "int", int };
}

function invInt(d: bigint): Num {
    return { type: "rational", n: 1n, d };
}

function rational(n: bigint, d: bigint): Num {
    return simplify({ type: "rational", n, d });
}

const FOOT_CONVERSION_FACTOR = rational(3_048n, 10_000n);
const ASTRONOMICAL_UNIT_CONVERSION_FACTOR = int(149_597_870_700n);
const REDUCED_PLANCK_LENGTH_CONVERSION_FACTOR = rational(1_616_255n, 1_000_000n * 10n ** 35n);

const US_GALLON_CONVERSION_FACTOR = mul(pow(FOOT_CONVERSION_FACTOR, int(3n)), rational(231n, 12n ** 3n));
const IMPERIAL_GALLON_CONVERSION_FACTOR = rational(454_609n, 100_000_000n);

const US_POUND_CONVERSION_FACTOR = rational(45_359_237n, 100_000_000n);
const TROY_POUND_CONVERSION_FACTOR = mul(US_POUND_CONVERSION_FACTOR, rational(5760n, 7000n));
const AMU_CONVERSION_FACTOR = div(invInt(1000n), N_A);
const REDUCED_PLANCK_MASS_CONVERSION_FACTOR = rational(2_176_434n, 1_000_000n * 10n ** 8n);

const DAY_CONVERSION_FACTOR = int(86_400n);
const COMMON_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, int(365n));
const LEAP_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, int(366n));
const JULIAN_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, rational(36_525n, 100n));
const GREGORIAN_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, rational(3_652_425n, 10_000n));
const MEAN_TROPICAL_YEAR_CONVERSION_FACTOR = int(31_556_925n);
const SIDEREAL_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, rational(365_256_363n, 1_000_000n));
const SYNODIC_YEAR_CONVERSION_FACTOR = mul(DAY_CONVERSION_FACTOR, rational(29_530_589n * 12n, 1_000_000n));
const REDUCED_PLANCK_TIME_CONVERSION_FACTOR = rational(5_391_247n, 1_000_000n * 10n ** 44n);

const STANDARD_GRAVITY_CONVERSION_FACTOR = rational(980_665n, 100_000n);

const BTU_CONVERSION_FACTOR = rational(10_545n, 10n);
const ELECTRONVOLT_CONVERSION_FACTOR = ELEMENTARY_CHARGE;

const REDUCED_PLANCK_TEMPERATURE_CONVERSION_FACTOR = rational(1_416_784n * 10n ** 32n, 1_000_000n);

const NAT_CONVERSION_FACTOR = BOLTZMANN_CONSTANT;
const BIT_CONVERSION_FACTOR = mul(NAT_CONVERSION_FACTOR, LN_2);

export const UNIT_PROPS: Readonly<Record<string, UnitProps>> = {
    // length
    "angstrom": {
        quantity: "length",
        conversionFactor: invInt(10n ** 10n),

        forms: [[noun("angstrom", {
            accents: [
                { index: 0, unicode: "å" },
                { index: 6, unicode: "ö" },
            ],
        })]],
        shortForms: simpleForms(["Å"]),
    },
    "fermi": {
        quantity: "length",
        conversionFactor: invInt(10n ** 15n),

        forms: simpleForms(["fermi"]),
    },
    "micron": {
        quantity: "length",
        conversionFactor: invInt(10n ** 6n),

        forms: simpleForms(["micron"]),
        shortForms: simpleForms(["µ"]),
    },
    "meter": {
        quantity: "length",
        conversionFactor: int(1n),

        forms: simpleForms(["meter", "metre"]),
        shortForms: simpleForms(["m"]),
    },
    "mil": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, invInt(12n * 1000n)),

        forms: simpleForms(["mil", "thou"]),
    },
    "inch": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, invInt(12n)),

        forms: [[noun("inch", { plurals: ["inches"] })]],
        shortForms: simpleForms(["in", "ins"]),
    },
    "foot": {
        quantity: "length",
        conversionFactor: FOOT_CONVERSION_FACTOR,

        forms: [[noun("foot", { plurals: ["feet"] })]],
        shortForms: simpleForms(["ft"]),
    },
    "yard": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(3n)),

        forms: simpleForms(["yard"]),
        shortForms: simpleForms(["yd", "yds"]),
    },
    "furlong": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(660n)),

        forms: simpleForms(["furlong"]),
        shortForms: simpleForms(["fur"]),
    },
    "mile": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(5280n)),

        disambiguators: {
            ...US_LAND_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["mile"]),
        shortForms: simpleForms(["mi"]),
    },
    "fathom": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(6n)),

        forms: simpleForms(["fathom"]),
        shortForms: simpleForms(["ftm"]),
    },
    "league": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(5280n * 3n)),

        disambiguators: {
            ...US_LAND_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
    },
    "nautical_mile": {
        quantity: "length",
        conversionFactor: int(1852n),

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["mile"]),
        shortForms: simpleForms(["mi"]),
        rawShortForms: ["NM", "nmi", "n_mi", "mi_n"],
    },
    "nautical_league": {
        quantity: "length",
        conversionFactor: int(1852n * 3n),

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
        rawShortForms: ["NL", "nlea", "n_lea", "lea_n"],
    },
    "link": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, rational(66n, 100n)),

        forms: simpleForms(["link"]),
        shortForms: simpleForms(["lnk"]),
    },
    "rod": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, rational(66n, 4n)),

        forms: simpleForms(["rod"]),
        shortForms: simpleForms(["rd"]),
    },
    "chain": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, int(66n)),

        forms: simpleForms(["chain"]),
        shortForms: simpleForms(["ch"]),
    },
    "parsec": {
        quantity: "length",
        conversionFactor: mul(ASTRONOMICAL_UNIT_CONVERSION_FACTOR, div(int(648_000n), PI)),

        forms: simpleForms(["parsec"]),
        shortForms: simpleForms(["pc"]),
    },
    "astronomical_unit": {
        quantity: "length",
        conversionFactor: ASTRONOMICAL_UNIT_CONVERSION_FACTOR,

        forms: [[modifier("astronomical"), noun("unit")]],
        shortForms: simpleForms(["au"]),
    },
    "pixel": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, invInt(12n * 96n)),

        forms: simpleForms(["pixel"]),
        shortForms: simpleForms(["px"]),
    },
    "point": {
        quantity: "length",
        conversionFactor: mul(FOOT_CONVERSION_FACTOR, invInt(12n * 72n)),

        disambiguators: {
            ptStandsFor: {
                system: "point",
            },
        },

        forms: simpleForms(["point"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "planck_length": {
        quantity: "length",
        conversionFactor: mul(REDUCED_PLANCK_LENGTH_CONVERSION_FACTOR, SQRT_TAU),

        forms: [[modifier("planck"), noun("length")]],
    },
    "reduced_planck_length": {
        quantity: "length",
        conversionFactor: REDUCED_PLANCK_LENGTH_CONVERSION_FACTOR,

        forms: [[modifier("reduced"), modifier("planck"), noun("length")]],
    },

    // area
    "hectare": {
        quantity: "area",
        conversionFactor: int(10_000n),

        forms: simpleForms(["hectare"]),
        shortForms: simpleForms(["ha"]),
    },
    "acre": {
        quantity: "area",
        conversionFactor: mul(pow(FOOT_CONVERSION_FACTOR, int(2n)), int(9n * 4840n)),

        forms: simpleForms(["acre"]),
        shortForms: simpleForms(["ac"]),
    },
    "barn": {
        quantity: "area",
        conversionFactor: invInt(10n ** 28n),

        forms: simpleForms(["barn"]),
    },

    // volume
    "liter": {
        quantity: "volume",
        conversionFactor: invInt(1000n),

        forms: simpleForms(["liter", "litre"]),
        shortForms: simpleForms(["L"]),
    },
    "us_gallon": {
        quantity: "volume",
        conversionFactor: US_GALLON_CONVERSION_FACTOR,

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    "us_quart": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(4n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    "us_pint": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(8n)),

        disambiguators: {
            ptStandsFor: {
                system: "pint",
            },
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "us_cup": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(16n)),

        forms: [[noun("cup")], [modifier("us"), noun("cup")]],
        shortForms: [[modifier("us"), noun("c")], [noun("cup")], [modifier("us"), noun("cup")], [noun("cups")], [modifier("us"), noun("cups")]],
    },
    "us_gill": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(32n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gill"]),
        shortForms: simpleForms(["gi", "gis"]),
    },
    "us_shot": {
        quantity: "volume",
        conversionFactor: mul(US_GALLON_CONVERSION_FACTOR, rational(3n, 256n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["jigger", "shot"]),
        shortForms: simpleForms(["jig", "jigs"]),
    },
    "us_fluid_ounce": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(128n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
    },
    "us_tablespoon": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(256n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    "us_teaspoon": {
        quantity: "volume",
        conversionFactor: div(US_GALLON_CONVERSION_FACTOR, int(768n)),

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    "imperial_gallon": {
        quantity: "volume",
        conversionFactor: IMPERIAL_GALLON_CONVERSION_FACTOR,

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    "imperial_quart": {
        quantity: "volume",
        conversionFactor: div(IMPERIAL_GALLON_CONVERSION_FACTOR, int(4n)),

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    "imperial_pint": {
        quantity: "volume",
        conversionFactor: div(IMPERIAL_GALLON_CONVERSION_FACTOR, int(8n)),

        disambiguators: {
            ptStandsFor: {
                system: "pint",
            },
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "imperial_gill": {
        quantity: "volume",
        conversionFactor: div(IMPERIAL_GALLON_CONVERSION_FACTOR, int(32n)),

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gill"]),
        shortForms: simpleForms(["gi", "gis"]),
    },
    "imperial_fluid_ounce": {
        quantity: "volume",
        conversionFactor: div(IMPERIAL_GALLON_CONVERSION_FACTOR, int(160n)),

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
    },
    "oil_barrel": {
        quantity: "volume",
        conversionFactor: mul(US_GALLON_CONVERSION_FACTOR, int(42n)),

        forms: [[noun("barrel")], [modifier("oil"), noun("barrel")]],
        shortForms: simpleForms(["bl", "bbl"]),
    },
    "board_foot": {
        quantity: "volume",
        conversionFactor: mul(pow(FOOT_CONVERSION_FACTOR, int(3n)), invInt(12n)),

        forms: [[modifier("board"), noun("foot")]],
        shortForms: [[modifier("bd"), noun("ft")]],
    },
    "cord": {
        quantity: "volume",
        conversionFactor: mul(pow(FOOT_CONVERSION_FACTOR, int(3n)), int(8n * 4n * 4n)),

        forms: simpleForms(["cord"]),
        shortForms: simpleForms(["cord"]),
    },

    // plane angle
    "radian": {
        quantity: "angle",
        conversionFactor: int(1n),

        forms: simpleForms(["radian"]),
        shortForms: simpleForms(["rad"]),
    },
    "revolution": {
        quantity: "angle",
        conversionFactor: TAU,

        forms: simpleForms(["revolution"]),
        shortForms: simpleForms(["rev", "revs"]),
    },
    "degree_of_arc": {
        quantity: "angle",
        conversionFactor: div(PI, int(180n)),

        forms: [[noun("degree")], [noun("degree"), modifier("of arc")]],
        shortForms: simpleForms(["°", "deg", "degs"]),
    },
    "arcminute": {
        quantity: "angle",
        conversionFactor: div(PI, int(180n * 60n)),

        forms: [[noun("minute"), modifier("of arc")]],
        shortForms: simpleForms(["MOA", "MoA", "moa", "'"]),
    },
    "arcsecond": {
        quantity: "angle",
        conversionFactor: div(PI, int(180n * 3600n)),

        forms: [[noun("second"), modifier("of arc")]],
        shortForms: simpleForms(["\""]),
    },
    "grad": {
        quantity: "angle",
        conversionFactor: div(TAU, int(400n)),

        forms: simpleForms(["grad"]),
        shortForms: simpleForms(["grad"]),
    },

    // solid angle
    "steradian": {
        quantity: "solid_angle",
        conversionFactor: int(1n),

        forms: simpleForms(["steradian"]),
        shortForms: simpleForms(["sr"]),
    },
    "spat": {
        quantity: "solid_angle",
        conversionFactor: mul(PI, int(4n)),

        forms: simpleForms(["spat"]),
        shortForms: simpleForms(["spat"]),
    },

    // mass
    "gram": {
        quantity: "mass",
        conversionFactor: invInt(1000n),

        forms: simpleForms(["gram", "gramme"]),
        shortForms: simpleForms(["g"]),
    },
    "carat": {
        quantity: "mass",
        conversionFactor: rational(200n, 1_000_000n),

        forms: simpleForms(["carat"]),
        shortForms: simpleForms(["ct"]),
    },
    "metric_ton": {
        quantity: "mass",
        conversionFactor: int(1000n),

        disambiguators: {
            ton: {
                system: "si",
                systemForms: [[modifier("metric")]],
            },
        },

        forms: simpleForms(["ton", "tonne"]),
        shortForms: simpleForms(["t"]),
    },
    "ounce": {
        quantity: "mass",
        conversionFactor: div(US_POUND_CONVERSION_FACTOR, int(16n)),

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    "pound": {
        quantity: "mass",
        conversionFactor: US_POUND_CONVERSION_FACTOR,

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    "stone": {
        quantity: "mass",
        conversionFactor: mul(US_POUND_CONVERSION_FACTOR, int(14n)),

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    "short_ton": {
        quantity: "mass",
        conversionFactor: mul(US_POUND_CONVERSION_FACTOR, int(2000n)),

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
            ...SHORT_TON_SYSTEM,
        },

        forms: simpleForms(["ton"]),
        shortForms: simpleForms(["tn"]),
    },
    "long_ton": {
        quantity: "mass",
        conversionFactor: mul(US_POUND_CONVERSION_FACTOR, int(2240n)),

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
            ...LONG_TON_SYSTEM,
        },

        forms: simpleForms(["ton"]),
        shortForms: simpleForms(["tn"]),
        rawShortForms: ["LT"],
    },
    "grain": {
        quantity: "mass",
        conversionFactor: div(US_POUND_CONVERSION_FACTOR, int(7000n)),

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["grain"]),
        shortForms: simpleForms(["gr"]),
    },
    "pennyweight": {
        quantity: "mass",
        conversionFactor: div(TROY_POUND_CONVERSION_FACTOR, int(12n * 20n)),

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pennyweight"]),
        shortForms: simpleForms(["dwt", "dwts", "pwt", "pwts"]),
    },
    "troy_ounce": {
        quantity: "mass",
        conversionFactor: div(TROY_POUND_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    "troy_pound": {
        quantity: "mass",
        conversionFactor: TROY_POUND_CONVERSION_FACTOR,

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    "slug": {
        quantity: "mass",
        conversionFactor: div(mul(STANDARD_GRAVITY_CONVERSION_FACTOR, US_POUND_CONVERSION_FACTOR), FOOT_CONVERSION_FACTOR),

        forms: simpleForms(["slug"]),
    },
    "atomic_mass_unit": {
        quantity: "mass",
        conversionFactor: AMU_CONVERSION_FACTOR,

        forms: [[modifier("atomic"), modifier("mass"), noun("unit")], [noun("dalton")]],
        shortForms: simpleForms(["u", "AMU", "amu", "Da"]),
    },
    "planck_mass": {
        quantity: "mass",
        conversionFactor: mul(REDUCED_PLANCK_MASS_CONVERSION_FACTOR, SQRT_TAU),

        forms: [[modifier("planck"), noun("mass")]]
    },
    "reduced_planck_mass": {
        quantity: "mass",
        conversionFactor: REDUCED_PLANCK_MASS_CONVERSION_FACTOR,

        forms: [[modifier("reduced"), modifier("planck"), noun("mass")]]
    },

    // density
    "density_H2O": {
        quantity: "density",
        conversionFactor: int(1_000n),

        forms: [[noun("density"), modifier("of water")], [noun("density"), modifier("of h2o")], [noun("density"), modifier("of h20")]],
    },
    "density_Hg": {
        quantity: "density",
        conversionFactor: int(13_546n),

        forms: [[noun("density"), modifier("of mercury")], [noun("density"), modifier("of hg")]],
    },

    // time
    "second": {
        quantity: "time",
        conversionFactor: int(1n),

        forms: simpleForms(["second"]),
        shortForms: simpleForms(["s", "sec", "secs"]),
    },
    "minute": {
        quantity: "time",
        conversionFactor: int(60n),

        forms: simpleForms(["minute"]),
        shortForms: simpleForms(["min", "mins"]),
    },
    "hour": {
        quantity: "time",
        conversionFactor: int(3600n),

        forms: simpleForms(["hour"]),
        shortForms: simpleForms(["h", "hr", "hrs"]),
    },
    "day": {
        quantity: "time",
        conversionFactor: DAY_CONVERSION_FACTOR,

        forms: simpleForms(["day"]),
        shortForms: simpleForms(["d"]),
    },
    "week": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(7n)),

        forms: simpleForms(["week"]),
        shortForms: simpleForms(["wk", "wks"]),
    },
    "fortnight": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(14n)),

        forms: simpleForms(["fortnight"]),
        shortForms: simpleForms(["fn"]),
    },
    "common_month": {
        quantity: "time",
        conversionFactor: div(COMMON_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "common_year": {
        quantity: "time",
        conversionFactor: COMMON_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "leap_month": {
        quantity: "time",
        conversionFactor: div(LEAP_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "leap_year": {
        quantity: "time",
        conversionFactor: LEAP_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "julian_month": {
        quantity: "time",
        conversionFactor: div(JULIAN_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "julian_year": {
        quantity: "time",
        conversionFactor: JULIAN_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "julian_decade": {
        quantity: "time",
        conversionFactor: mul(JULIAN_YEAR_CONVERSION_FACTOR, int(10n)),

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "julian_century": {
        quantity: "time",
        conversionFactor: mul(JULIAN_YEAR_CONVERSION_FACTOR, int(100n)),

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "julian_millennium": {
        quantity: "time",
        conversionFactor: mul(JULIAN_YEAR_CONVERSION_FACTOR, int(1000n)),

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "gregorian_month": {
        quantity: "time",
        conversionFactor: div(GREGORIAN_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "gregorian_year": {
        quantity: "time",
        conversionFactor: GREGORIAN_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "gregorian_decade": {
        quantity: "time",
        conversionFactor: mul(GREGORIAN_YEAR_CONVERSION_FACTOR, int(10n)),

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "gregorian_century": {
        quantity: "time",
        conversionFactor: mul(GREGORIAN_YEAR_CONVERSION_FACTOR, int(100n)),

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "gregorian_millennium": {
        quantity: "time",
        conversionFactor: mul(GREGORIAN_YEAR_CONVERSION_FACTOR, int(1000n)),

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "mean_tropical_month": {
        quantity: "time",
        conversionFactor: div(MEAN_TROPICAL_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "mean_tropical_year": {
        quantity: "time",
        conversionFactor: MEAN_TROPICAL_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "mean_tropical_decade": {
        quantity: "time",
        conversionFactor: mul(MEAN_TROPICAL_YEAR_CONVERSION_FACTOR, int(10n)),

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "mean_tropical_century": {
        quantity: "time",
        conversionFactor: mul(MEAN_TROPICAL_YEAR_CONVERSION_FACTOR, int(100n)),

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "mean_tropical_millennium": {
        quantity: "time",
        conversionFactor: mul(MEAN_TROPICAL_YEAR_CONVERSION_FACTOR, int(1000n)),

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "sidereal_month": {
        quantity: "time",
        conversionFactor: div(SIDEREAL_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "sidereal_year": {
        quantity: "time",
        conversionFactor: SIDEREAL_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "sidereal_decade": {
        quantity: "time",
        conversionFactor: mul(SIDEREAL_YEAR_CONVERSION_FACTOR, int(10n)),

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "sidereal_century": {
        quantity: "time",
        conversionFactor: mul(SIDEREAL_YEAR_CONVERSION_FACTOR, int(100n)),

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "sidereal_millennium": {
        quantity: "time",
        conversionFactor: mul(SIDEREAL_YEAR_CONVERSION_FACTOR, int(1000n)),

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "synodic_month": {
        quantity: "time",
        conversionFactor: div(SYNODIC_YEAR_CONVERSION_FACTOR, int(12n)),

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "synodic_year": {
        quantity: "time",
        conversionFactor: SYNODIC_YEAR_CONVERSION_FACTOR,

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "synodic_decade": {
        quantity: "time",
        conversionFactor: mul(SYNODIC_YEAR_CONVERSION_FACTOR, int(10n)),

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "synodic_century": {
        quantity: "time",
        conversionFactor: mul(SYNODIC_YEAR_CONVERSION_FACTOR, int(100n)),

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "synodic_millennium": {
        quantity: "time",
        conversionFactor: mul(SYNODIC_YEAR_CONVERSION_FACTOR, int(1000n)),

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "short_month": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(28n)),

        disambiguators: {
            calendar: {
                system: "short_month",
                systemForms: [[modifier("short")]],
            },
        },

        ...MONTH_FORMS,
    },
    "short_month_year": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(28n * 12n)),

        disambiguators: {
            calendar: {
                system: "short_month",
                systemForms: [[modifier("short"), modifier("month")], [modifier("short"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    "hollow_month": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(29n)),

        disambiguators: {
            calendar: {
                system: "hollow_month",
                systemForms: [[modifier("hollow")]],
            },
        },

        ...MONTH_FORMS,
    },
    "hollow_month_year": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(29n * 12n)),

        disambiguators: {
            calendar: {
                system: "hollow_month",
                systemForms: [[modifier("hollow"), modifier("month")], [modifier("hollow"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    "full_month": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(30n)),

        disambiguators: {
            calendar: {
                system: "full_month",
                systemForms: [[modifier("full")]],
            },
        },

        ...MONTH_FORMS,
    },
    "full_month_year": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(30n * 12n)),

        disambiguators: {
            calendar: {
                system: "full_month",
                systemForms: [[modifier("full"), modifier("month")], [modifier("full"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    "long_month": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(31n)),

        disambiguators: {
            calendar: {
                system: "long_month",
                systemForms: [[modifier("long")]],
            },
        },

        ...MONTH_FORMS,
    },
    "long_month_year": {
        quantity: "time",
        conversionFactor: mul(DAY_CONVERSION_FACTOR, int(31n * 12n)),

        disambiguators: {
            calendar: {
                system: "long_month",
                systemForms: [[modifier("long"), modifier("month")], [modifier("long"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    "planck_time": {
        quantity: "time",
        conversionFactor: mul(REDUCED_PLANCK_TIME_CONVERSION_FACTOR, SQRT_TAU),

        forms: [[modifier("planck"), noun("time")]]
    },
    "reduced_planck_time": {
        quantity: "time",
        conversionFactor: REDUCED_PLANCK_TIME_CONVERSION_FACTOR,

        forms: [[modifier("reduced"), modifier("planck"), noun("time")]]
    },

    // frequency
    "hertz": {
        quantity: "frequency",
        conversionFactor: int(1n),

        forms: [[noun("hertz", { plurals: [] })]],
        shortForms: simpleForms(["Hz"]),
    },

    // speed or velocity
    "knot": {
        quantity: "speed",
        conversionFactor: rational(1852n, 3600n),

        forms: simpleForms(["knot"]),
        shortForms: simpleForms(["kn"]),
    },
    "speed_of_light": {
        quantity: "speed",
        conversionFactor: SPEED_OF_LIGHT,

        forms: [[noun("speed"), modifier("of light")]],
        shortForms: simpleForms(["c"]),
    },

    // acceleration
    "standard_gravity": {
        quantity: "acceleration",
        conversionFactor: STANDARD_GRAVITY_CONVERSION_FACTOR,

        forms: [[modifier("standard"), noun("gravity", { plurals: ["gravities"] })]]
    },
    "galileo": {
        quantity: "acceleration",
        conversionFactor: invInt(100n),

        forms: simpleForms(["galileo"]),
        shortForms: simpleForms(["Gal"]),
    },

    // weight/force
    "newton": {
        quantity: "force",
        conversionFactor: int(1n),

        forms: simpleForms(["newton"]),
        shortForms: simpleForms(["N"]),
    },
    "dyne": {
        quantity: "force",
        conversionFactor: invInt(100_000n),

        forms: simpleForms(["dyne"]),
        shortForms: simpleForms(["dyn"]),
    },
    "poundal": {
        quantity: "force",
        conversionFactor: mul(US_POUND_CONVERSION_FACTOR, FOOT_CONVERSION_FACTOR),

        forms: simpleForms(["poundal"]),
        shortForms: simpleForms(["pdl"]),
    },

    // pressure
    "standard_atmosphere": {
        quantity: "pressure",
        conversionFactor: int(101_325n),

        forms: [[modifier("standard"), noun("atmosphere")], [noun("atmosphere")]],
        shortForms: simpleForms(["atm"]),
    },
    "bar": {
        quantity: "pressure",
        conversionFactor: int(100_000n),

        forms: simpleForms(["bar"]),
        shortForms: simpleForms(["bar"]),
    },
    "barye": {
        quantity: "pressure",
        conversionFactor: invInt(10n),

        forms: simpleForms(["barye"]),
        shortForms: simpleForms(["barye"]),
    },
    "pascal": {
        quantity: "pressure",
        conversionFactor: int(1n),

        forms: simpleForms(["pascal"]),
        shortForms: simpleForms(["Pa"]),
    },
    "torr": {
        quantity: "pressure",
        conversionFactor: rational(101_325n, 760n),

        forms: [[noun("torr", { plurals: [] })]],
        shortForms: simpleForms(["torr"]),
    },

    // energy
    "british_thermal_unit": {
        quantity: "energy",
        conversionFactor: BTU_CONVERSION_FACTOR,

        forms: [[modifier("british"), modifier("thermal"), noun("unit")]],
        shortForms: simpleForms(["BTU", "BTUs"]),
    },
    "calorie": {
        quantity: "energy",
        conversionFactor: rational(4184n, 1000n),

        forms: simpleForms(["calorie"]),
        shortForms: simpleForms(["cal", "cals"]),
    },
    "joule": {
        quantity: "energy",
        conversionFactor: int(1n),

        forms: simpleForms(["joule"]),
        shortForms: simpleForms(["J"]),
    },
    "erg": {
        quantity: "energy",
        conversionFactor: invInt(10n ** 7n),

        forms: simpleForms(["erg"]),
        shortForms: simpleForms(["erg"]),
    },
    "electronvolt": {
        quantity: "energy",
        conversionFactor: ELECTRONVOLT_CONVERSION_FACTOR,

        forms: [[modifier("electron"), noun("volt")]],
        shortForms: simpleForms(["eV"]),
    },
    "therm": {
        quantity: "energy",
        conversionFactor: mul(BTU_CONVERSION_FACTOR, int(100_000n)),

        forms: simpleForms(["therm"]),
        shortForms: simpleForms(["therm"]),
    },

    // power
    "watt": {
        quantity: "power",
        conversionFactor: int(1n),

        forms: simpleForms(["watt"]),
        shortForms: simpleForms(["W"]),
    },
    "horsepower": {
        quantity: "power",
        conversionFactor: mul(mul(FOOT_CONVERSION_FACTOR, mul(STANDARD_GRAVITY_CONVERSION_FACTOR, US_POUND_CONVERSION_FACTOR)), int(550n)),

        forms: [[noun("horse"), modifier("power")]],
        shortForms: simpleForms(["hp"]),
    },

    // electricity/magnetism
    "coulomb": {
        quantity: "electric_charge",
        conversionFactor: int(1n),

        forms: simpleForms(["coulomb"]),
        shortForms: simpleForms(["C"]),
    },
    "ampere": {
        quantity: "electric_current",
        conversionFactor: int(1n),

        forms: simpleForms(["ampere", "amp"]),
        shortForms: simpleForms(["A"]),
    },
    "volt": {
        quantity: "electric_potential",
        conversionFactor: int(1n),

        forms: simpleForms(["volt"]),
        shortForms: simpleForms(["V"]),
    },
    "ohm": {
        quantity: "electric_resistance",
        conversionFactor: int(1n),

        forms: simpleForms(["ohm"]),
        shortForms: simpleForms(["Ω"]),
    },
    "siemens": {
        quantity: "electric_conductance",
        conversionFactor: int(1n),

        forms: [[noun("siemens", { plurals: ["siemenses"] })]],
        shortForms: simpleForms(["S"]),
    },
    "farad": {
        quantity: "capacitance",
        conversionFactor: int(1n),

        forms: simpleForms(["farad"]),
        shortForms: simpleForms(["F"]),
    },
    "maxwell": {
        quantity: "magnetic_flux",
        conversionFactor: invInt(10n ** 8n),

        forms: simpleForms(["maxwell"]),
        shortForms: simpleForms(["Mx"]),
    },
    "weber": {
        quantity: "magnetic_flux",
        conversionFactor: int(1n),

        forms: simpleForms(["weber"]),
        shortForms: simpleForms(["Wb"]),
    },
    "gauss": {
        quantity: "magnetic_flux_density",
        conversionFactor: invInt(10_000n),

        forms: [[noun("gauss", { plurals: ["gausses"] })]],
        shortForms: simpleForms(["G"]),
    },
    "tesla": {
        quantity: "magnetic_flux_density",
        conversionFactor: int(1n),

        forms: simpleForms(["tesla"]),
        shortForms: simpleForms(["T"]),
    },
    "henry": {
        quantity: "inductance",
        conversionFactor: int(1n),

        forms: [[noun("henry", { plurals: ["henries"] })]],
        shortForms: simpleForms(["H"]),
    },

    // temperature
    "degree_celsius": {
        quantity: "temperature",
        conversionOffset: rational(27_315n, 100n),
        conversionFactor: int(1n),

        forms: [[noun("degree"), modifier("celsius")]],
        shortForms: simpleForms(["°C"]),
    },
    "degree_fahrenheit": {
        quantity: "temperature",
        conversionOffset: rational(45_967n, 100n),
        conversionFactor: rational(5n, 9n),

        forms: [[noun("degree"), modifier("fahrenheit")]],
        shortForms: simpleForms(["°F"]),
    },
    "degree_rankine": {
        quantity: "temperature",
        conversionFactor: rational(5n, 9n),

        forms: [[noun("degree"), modifier("rankine")]],
        shortForms: simpleForms(["°R"]),
    },
    "kelvin": {
        quantity: "temperature",
        conversionFactor: int(1n),

        forms: [[noun("kelvin")], [noun("degree"), modifier("kelvin")]],
        shortForms: simpleForms(["K", "°K"]),
    },
    "planck_temperature": {
        quantity: "temperature",
        conversionFactor: mul(REDUCED_PLANCK_TEMPERATURE_CONVERSION_FACTOR, SQRT_TAU),

        forms: [[modifier("planck"), noun("temperature")], [modifier("planck"), noun("temp")]],
    },
    "reduced_planck_temperature": {
        quantity: "temperature",
        conversionFactor: REDUCED_PLANCK_TEMPERATURE_CONVERSION_FACTOR,

        forms: [[modifier("reduced"), modifier("planck"), noun("temperature")], [modifier("reduced"), modifier("planck"), noun("temp")]],
    },

    // information
    "natural_unit_of_information": {
        quantity: "information_entropy",
        conversionFactor: NAT_CONVERSION_FACTOR,

        forms: [[modifier("natural"), noun("unit"), modifier("of information")], [noun("nepit")], [noun("nit")]],
        shortForms: simpleForms(["nat"]),
    },
    "bit": {
        quantity: "information_entropy",
        conversionFactor: BIT_CONVERSION_FACTOR,

        forms: simpleForms(["bit", "shannon"]),
        shortForms: simpleForms(["b", "Sh"]),
    },
    "trit": {
        quantity: "information_entropy",
        conversionFactor: mul(NAT_CONVERSION_FACTOR, LN_3),

        forms: simpleForms(["trit"]),
    },
    "hartley": {
        quantity: "information_entropy",
        conversionFactor: mul(NAT_CONVERSION_FACTOR, add(LN_2, LN_5)),

        forms: simpleForms(["hartley", "ban"]),
        shortForms: simpleForms(["Hart", "ban"]),
    },
    "nibble": {
        quantity: "information_entropy",
        conversionFactor: mul(BIT_CONVERSION_FACTOR, int(4n)),

        forms: simpleForms(["nibble"]),
    },
    "byte": {
        quantity: "information_entropy",
        conversionFactor: mul(BIT_CONVERSION_FACTOR, int(8n)),

        forms: simpleForms(["byte"]),
        shortForms: simpleForms(["B"]),
    },

    // information rate
    "bit_per_second": {
        quantity: "information_rate",
        conversionFactor: BIT_CONVERSION_FACTOR,

        forms: [[noun("bit"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["bps"]),
    },
    "byte_per_second": {
        quantity: "information_rate",
        conversionFactor: mul(BIT_CONVERSION_FACTOR, int(8n)),

        forms: [[noun("byte"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["Bps"]),
    },

    // luminous intensity
    "candela": {
        quantity: "luminous_intensity",
        conversionFactor: int(1n),

        forms: [[noun("candela")], [noun("candle"), modifier("power")]],
        shortForms: simpleForms(["cd"]),
    },

    // luminous flux
    "lumen": {
        quantity: "luminous_flux",
        conversionFactor: int(1n),

        forms: simpleForms(["lumen"]),
        shortForms: simpleForms(["lm"]),
    },

    // illuminance
    "lux": {
        quantity: "illuminance",
        conversionFactor: int(1n),

        forms: [[noun("lux", { plurals: ["luxes"] })]],
        shortForms: simpleForms(["lx"]),
    },
    "footcandle": {
        quantity: "illuminance",
        conversionFactor: div(int(1n), pow(FOOT_CONVERSION_FACTOR, int(2n))),

        forms: [[modifier("foot"), noun("candle")]],
        shortForms: simpleForms(["fc"]),
    },

    // radiation and doses
    "becquerel": {
        quantity: "radiation_source_activity",
        conversionFactor: int(1n),

        forms: simpleForms(["becquerel"]),
        shortForms: simpleForms(["Bq"]),
    },
    "curie": {
        quantity: "radiation_source_activity",
        conversionFactor: int(37_000_000_000n),

        forms: simpleForms(["curie"]),
        shortForms: simpleForms(["Ci"]),
    },
    "rutherford": {
        quantity: "radiation_source_activity",
        conversionFactor: int(1_000_000n),

        forms: simpleForms(["rutherford"]),
        shortForms: simpleForms(["Rd"]),
    },
    "roentgen": {
        quantity: "radiation_exposure",
        conversionFactor: rational(258n, 1_000_000n),

        forms: [[noun("roentgen", {
            accents: [
                { index: 1, unicode: "ö" },
                { index: 2, unicode: "" },
            ]
        })]],
        shortForms: simpleForms(["R"]),
    },
    "gray": {
        quantity: "radiation_absorbed_dose",
        conversionFactor: int(1n),

        forms: simpleForms(["gray"]),
        shortForms: simpleForms(["Gy"]),
    },
    "sievert": {
        quantity: "radiation_equivalent_dose",
        conversionFactor: int(1n),

        forms: simpleForms(["sievert"]),
        shortForms: simpleForms(["Sv"]),
    },
    "roentgen_equivalent_man": {
        quantity: "radiation_equivalent_dose",
        conversionFactor: invInt(100n),

        forms: [[noun("roentgen", {
            accents: [
                { index: 1, unicode: "ö" },
                { index: 2, unicode: "" },
            ]
        }), modifier("equivalent"), modifier("man")]],
        shortForms: simpleForms(["rem"]),
    },

    // amount of substance
    "mole": {
        quantity: "amount_of_substance",
        conversionFactor: int(1n),

        forms: simpleForms(["mole"]),
        shortForms: simpleForms(["mol"]),
    },

    // proportion
    "percent": {
        quantity: "proportion",
        conversionFactor: invInt(100n),

        forms: simpleForms(["percent"]),
        shortForms: simpleForms(["pct", "%"]),
    },
    "part_per_thousand": {
        quantity: "proportion",
        conversionFactor: invInt(1000n),

        forms: [[noun("part"), modifier("per"), modifier("thousand")]],
    },
    "part_per_million": {
        quantity: "proportion",
        conversionFactor: invInt(1_000_000n),

        forms: [[noun("part"), modifier("per"), modifier("million")]],
        shortForms: simpleForms(["ppm"]),
    },
    "part_per_billion": {
        quantity: "proportion",
        conversionFactor: invInt(10n ** 9n),

        forms: [[noun("part"), modifier("per"), modifier("billion")]],
        shortForms: simpleForms(["ppb"]),
    },
    "part_per_trillion": {
        quantity: "proportion",
        conversionFactor: invInt(10n ** 12n),

        forms: [[noun("part"), modifier("per"), modifier("trillion")]],
        shortForms: simpleForms(["ppt"]),
    },
    "part_per_quadrillion": {
        quantity: "proportion",
        conversionFactor: invInt(10n ** 15n),

        forms: [[noun("part"), modifier("per"), modifier("quadrillion")]],
        shortForms: simpleForms(["ppq"]),
    },
} as const satisfies Readonly<Record<string, UnitProps>>;

export function dispType(quantity: Quantity): "mul" | "div" | null {
    switch (quantity) {
        case "length": // maps to pressure; mass/area
        case "area": // maps to force/length; mass/length
        case "volume": // maps to force; mass
            {
                return "mul";
            }
        case "mass": // maps to volume/standard_gravity; volume
        case "force": // maps to volume; volume*standard_gravity
        case "pressure": // maps to length; length*standard_gravity
            {
                return "div";
            }
        default:
            return null;
    }
}