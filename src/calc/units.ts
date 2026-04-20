import { mod, Num } from "./numbers";

type Quantity = (
    "length" | "area" | "volume" |
    "angle" | "solid_angle" |
    "mass" |
    "time" | "frequency" | "speed" | "acceleration" |
    "force" | "pressure" |
    "energy" | "power" |
    "electric_charge" | "electric_current" | "electric_potential" | "electric_resistance" | "electric_conductance" |
    "capacitance" |
    "magnetic_flux" | "magnetic_flux_density" |
    "inductance" |
    "temperature" |
    "information" | "information_rate" |
    "luminous_intensity" | "luminous_flux" | "illuminance" |
    "radiation_source_activity" | "radiation_exposure" | "radiation_absorbed_dose" | "radiation_equivalent_dose" |
    "amount_of_substance" |
    "proportion"
);

interface UnitWordPropsNoun {
    readonly type: "noun";
    readonly word: string;
    readonly accents?: ReadonlyArray<{ index: number, unicode: string }>;
    readonly plurals?: ReadonlyArray<string>; // default: with trailing s
}

interface UnitWordPropsModifier {
    readonly type: "modifier";
    readonly word: string;
    readonly isOf: boolean;
    readonly accents?: ReadonlyArray<{ index: number, unicode: string }>;
    readonly plurals?: ReadonlyArray<string>; // default: none
}

type UnitWordProps = UnitWordPropsNoun | UnitWordPropsModifier;

type UnitFormProps = ReadonlyArray<UnitWordProps>;

interface UnitDisambiguatorProps {
    readonly system: string;
    readonly systemForms: ReadonlyArray<UnitFormProps>;
    readonly shortSystemForms?: ReadonlyArray<UnitFormProps>;
}

interface UnitProps {
    readonly id: string;

    readonly quantity: Quantity;

    readonly disambiguators?: Readonly<Record<string, UnitDisambiguatorProps>>; // used to differentiate units with the same name

    readonly forms: ReadonlyArray<UnitFormProps>;
    readonly shortForms?: ReadonlyArray<UnitFormProps>;
    readonly rawShortForms?: ReadonlyArray<UnitFormProps>; // no disambiguators
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

const US_LAND_SYSTEM = {
    distance: {
        system: "us_land",
        systemForms: [[modifier("united_states"), modifier("statutory"), modifier("statute"), modifier("international"), modifier("land")]],
        shortSystemForms: [[modifier("US"), modifier("us"), modifier("stat"), modifier("intl"), modifier("int"), modifier("land")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const NAUTICAL_SYSTEM = {
    distance: {
        system: "nautical",
        systemForms: [[modifier("nautical")]],
        shortSystemForms: [[modifier("naut"), modifier("n")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const US_VOLUME_SYSTEM = {
    volume: {
        system: "us",
        systemForms: [[modifier("united_states"), modifier("customary")]],
        shortSystemForms: [[modifier("US"), modifier("us"), modifier("cust")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const IMPERIAL_VOLUME_SYSTEM = {
    volume: {
        system: "imperial",
        systemForms: [[modifier("imperial")]],
        shortSystemForms: [[modifier("imp")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const TROY_WEIGHT_SYSTEM = {
    weight: {
        system: "troy",
        systemForms: [[modifier("troy")]],
        shortSystemForms: [[modifier("tr")], [modifier("t")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const US_WEIGHT_SYSTEM = {
    weight: {
        system: "us",
        systemForms: [[modifier("united_states"), modifier("international"), modifier("avoirdupois")]],
        shortSystemForms: [[modifier("US"), modifier("us"), modifier("intl"), modifier("int"), modifier("av")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const MASS_QUANTITY_SYSTEM = {
    quantity: {
        system: "mass",
        systemForms: [[modifier("mass")]],
        shortSystemForms: [[modifier("m")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const WEIGHT_FORCE_QUANTITY_SYSTEM = {
    quantity: {
        system: "force",
        systemForms: [[modifier("weight")], [modifier("force")]],
        shortSystemForms: [[modifier("wght")], [modifier("wgt")], [modifier("wt")], [modifier("wt")], [modifier("w")], [modifier("f")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const FLUID_OUNCE_QUANTITY_SYSTEM = {
    quantity: {
        system: "volume",
        systemForms: [[modifier("fluid")]],
        shortSystemForms: [[modifier("fl")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const SHORT_TON_SYSTEM = {
    quantity: {
        system: "ton",
        systemForms: [[modifier("short")]],
        shortSystemForms: [[modifier("sh")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

const LONG_TON_SYSTEM = {
    quantity: {
        system: "ton",
        systemForms: [[modifier("long")]],
        shortSystemForms: [[modifier("long")]],
    },
} as const satisfies Partial<UnitProps["disambiguators"]>;

// calendar systems:
// month: 30 days, 29 days, lunar (synodic), OR year divided by 12
// year: 365 days, 366 days, 365.25 days (julian), 365.2425 days (gregorian), mean tropical, sidereal, OR month times 12 (which is 360 days, 348 days, or 12 synodic months)
// calendar systems (always 12 months / year):
// - common: 365 days / year
// - leap: 366 days / year
// - julian: 365.25 days / year
// - gregorian: 365.2425 days / year
// - mean_tropical: precise days / year
// - sidereal: precise days / year
// - synodic: precise days / year
// - month systems (overrides month but not year):
// - full_month: 30 days / month
// - hollow_month: 29 days / month
// - short_month: 28 days / month
// - long_month: 31 days / month
// - synodic_month: precise days / month

const UNIT_PROPS: ReadonlyArray<UnitProps> = [
    // length
    {
        id: "angstrom",

        quantity: "length",

        forms: [[noun("angstrom", {
            accents: [
                { index: 0, unicode: "å" },
                { index: 6, unicode: "ö" },
            ],
        })]],
        shortForms: simpleForms(["Å"]),
    },
    {
        id: "fermi",

        quantity: "length",

        forms: simpleForms(["fermi"]),
    },
    {
        id: "micron",

        quantity: "length",

        forms: simpleForms(["micron"]),
        shortForms: simpleForms(["µ"]),
    },
    {
        id: "meter",

        quantity: "length",

        forms: simpleForms(["meter", "metre"]),
        shortForms: simpleForms(["m"]),
    },
    {
        id: "mil",

        quantity: "length",

        forms: simpleForms(["mil", "thou"]),
    },
    {
        id: "inch",

        quantity: "length",

        forms: [[noun("inch", { plurals: ["inches"] })]],
        shortForms: simpleForms(["in", "ins"]),
    },
    {
        id: "foot",

        quantity: "length",

        forms: [[noun("foot", { plurals: ["feet"] })]],
        shortForms: simpleForms(["ft"]),
    },
    {
        id: "yard",

        quantity: "length",

        forms: simpleForms(["yard"]),
        shortForms: simpleForms(["yd", "yds"]),
    },
    {
        id: "furlong",

        quantity: "length",

        forms: simpleForms(["furlong"]),
        shortForms: simpleForms(["fur"]),
    },
    {
        id: "mile",

        quantity: "length",

        disambiguators: {
            ...US_LAND_SYSTEM,
        },

        forms: simpleForms(["mile"]),
        shortForms: simpleForms(["mi"]),
    },
    {
        id: "fathom",

        quantity: "length",

        forms: simpleForms(["fathom"]),
        shortForms: simpleForms(["ftm"]),
    },
    {
        id: "league",

        quantity: "length",

        disambiguators: {
            ...US_LAND_SYSTEM,
        },

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
    },
    {
        id: "nautical_mile",

        quantity: "length",

        disambiguators: {
            ...NAUTICAL_SYSTEM,
        },

        forms: [[noun("mile")]],
        shortForms: simpleForms(["mi"]),
        rawShortForms: simpleForms(["NM"]),
    },
    {
        id: "nautical_league",

        quantity: "length",

        disambiguators: {
            ...NAUTICAL_SYSTEM,
        },

        forms: [[noun("league")]],
        shortForms: simpleForms(["lea"]),
        rawShortForms: simpleForms(["NL", "nl"]),
    },
    {
        id: "link",

        quantity: "length",

        forms: simpleForms(["link"]),
        shortForms: simpleForms(["lnk"]),
    },
    {
        id: "chain",

        quantity: "length",

        forms: simpleForms(["chain"]),
        shortForms: simpleForms(["ch"]),
    },
    {
        id: "rod",

        quantity: "length",

        forms: simpleForms(["rod"]),
        shortForms: simpleForms(["rd"]),
    },
    {
        id: "parsec",

        quantity: "length",

        forms: simpleForms(["parsec"]),
        shortForms: simpleForms(["pc"]),
    },
    {
        id: "astronomical_unit",

        quantity: "length",

        forms: [[modifier("astronomical"), noun("unit")]],
        shortForms: simpleForms(["au"]),
    },
    {
        id: "pixel",

        quantity: "length",

        forms: simpleForms(["pixel"]),
        shortForms: simpleForms(["px"]),
    },
    {
        id: "point",

        quantity: "length",

        forms: simpleForms(["point"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    {
        id: "planck_length",

        quantity: "length",

        forms: [[modifier("planck"), noun("length")]],
    },
    {
        id: "reduced_planck_length",

        quantity: "length",

        forms: [[modifier("reduced"), modifier("planck"), noun("length")]],
    },

    // area
    {
        id: "hectare",

        quantity: "area",

        forms: simpleForms(["hectare"]),
        shortForms: simpleForms(["ha"]),
    },
    {
        id: "acre",

        quantity: "area",

        forms: simpleForms(["acre"]),
        shortForms: simpleForms(["ac"]),
    },
    {
        id: "barn",

        quantity: "area",

        forms: simpleForms(["barn"]),
    },

    // volume
    {
        id: "liter",

        quantity: "volume",

        forms: simpleForms(["liter", "litre"]),
        shortForms: simpleForms(["L"]),
    },
    {
        id: "us_gallon",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    {
        id: "us_quart",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    {
        id: "us_pint",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    {
        id: "us_cup",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    {
        id: "us_fluid_ounce",

        quantity: "volume",

        disambiguators: {
            ...FLUID_OUNCE_QUANTITY_SYSTEM,
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "us_tablespoon",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    {
        id: "us_teaspoon",

        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    {
        id: "imperial_gallon",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    {
        id: "imperial_quart",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    {
        id: "imperial_pint",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    {
        id: "imperial_cup",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    {
        id: "imperial_fluid_ounce",

        quantity: "volume",

        disambiguators: {
            ...FLUID_OUNCE_QUANTITY_SYSTEM,
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "imperial_tablespoon",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    {
        id: "imperial_teaspoon",

        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    {
        id: "barrel",

        quantity: "volume",

        forms: simpleForms(["barrel"]),
        shortForms: simpleForms(["bl", "bbl"]),
    },
    {
        id: "board_foot",

        quantity: "volume",

        forms: [[modifier("board"), noun("foot")]],
        shortForms: [[modifier("bd"), noun("ft")]],
    },
    {
        id: "cord",

        quantity: "volume",

        forms: simpleForms(["cord"]),
        shortForms: simpleForms(["cord"]),
    },
    {
        id: "bushel",

        quantity: "volume",

        forms: simpleForms(["bushel"]),
        shortForms: simpleForms(["bu"]),
    },

    // plane angle
    {
        id: "radian",

        quantity: "angle",

        forms: simpleForms(["radian"]),
        shortForms: simpleForms(["rad"]),
    },
    {
        id: "revolution",

        quantity: "angle",

        forms: simpleForms(["revolution"]),
        shortForms: simpleForms(["rev", "revs"]),
    },
    {
        id: "degree_of_arc",

        quantity: "angle",

        forms: [[noun("degree"), modifier("of arc")]],
        shortForms: simpleForms(["°", "deg", "degs"]),
    },
    {
        id: "arcminute",

        quantity: "angle",

        forms: [[noun("minute"), modifier("of arc")]],
        shortForms: simpleForms(["MOA", "MoA", "moa", "'"]),
    },
    {
        id: "arcsecond",

        quantity: "angle",

        forms: [[noun("second"), modifier("of arc")]],
        shortForms: simpleForms(["\""]),
    },
    {
        id: "grad",

        quantity: "angle",

        forms: simpleForms(["grad"]),
        shortForms: simpleForms(["grad"]),
    },

    // solid angle
    {
        id: "steradian",

        quantity: "solid_angle",

        forms: simpleForms(["steradian"]),
        shortForms: simpleForms(["sr"]),
    },
    {
        id: "spat",

        quantity: "solid_angle",

        forms: simpleForms(["spat"]),
        shortForms: simpleForms(["spat"]),
    },

    // mass
    {
        id: "gram",

        quantity: "mass",

        forms: simpleForms(["gram", "gramme"]),
        shortForms: simpleForms(["g"]),
    },
    {
        id: "carat",

        quantity: "mass",

        forms: simpleForms(["carat"]),
        shortForms: simpleForms(["ct"]),
    },
    {
        id: "metric_ton",

        quantity: "mass",

        disambiguators: {
            ton: {
                system: "si",
                systemForms: simpleForms(["metric"]),
            },
        },

        forms: simpleForms(["ton", "tonne"]),
        shortForms: simpleForms(["t"]),
    },
    {
        id: "ounce_mass",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "pound_mass",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "stone_mass",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    {
        id: "short_ton_mass",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
            ...SHORT_TON_SYSTEM,
        },

        forms: [[noun("ton")]],
        shortForms: [[noun("tn")]],
    },
    {
        id: "long_ton_mass",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
            ...LONG_TON_SYSTEM,
        },

        forms: [[modifier("ton")]],
        shortForms: [[modifier("tn")]],
    },
    {
        id: "grain",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["grain"]),
        shortForms: simpleForms(["gr"]),
    },
    {
        id: "pennyweight",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pennyweight"]),
        shortForms: simpleForms(["dwt", "dwts", "pwt", "pwts"]),
    },
    {
        id: "troy_ounce",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "troy_pound",

        quantity: "mass",

        disambiguators: {
            ...MASS_QUANTITY_SYSTEM,
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "slug",

        quantity: "mass",

        forms: simpleForms(["slug"]),
    },
    {
        id: "atomic_mass_unit",

        quantity: "mass",

        forms: [[modifier("atomic"), modifier("mass"), noun("unit")], [noun("dalton")]],
        shortForms: simpleForms(["u", "AMU", "amu", "Da"]),
    },

    // time
    {
        id: "second",

        quantity: "time",

        forms: simpleForms(["second"]),
        shortForms: simpleForms(["s", "sec", "secs"]),
    },
    {
        id: "minute",

        quantity: "time",

        forms: simpleForms(["minute"]),
        shortForms: simpleForms(["min", "mins"]),
    },
    {
        id: "hour",

        quantity: "time",

        forms: simpleForms(["hour"]),
        shortForms: simpleForms(["h", "hr", "hrs"]),
    },
    {
        id: "day",

        quantity: "time",

        forms: simpleForms(["day"]),
        shortForms: simpleForms(["d"]),
    },
    {
        id: "week",

        quantity: "time",

        forms: simpleForms(["week"]),
        shortForms: simpleForms(["wk", "wks"]),
    },
    {
        id: "fortnight",

        quantity: "time",

        forms: simpleForms(["fortnight"]),
        shortForms: simpleForms(["fn"]),
    },
    {
        id: "month",

        quantity: "time", // todo: add calendars, which would work like systems (30-day month, 365-day year, 365.25-day year, lunar, gregorian)

        forms: simpleForms(["month"]),
        shortForms: simpleForms(["mo", "mos", "mon", "mons"]),
    },
    {
        id: "year",

        quantity: "time",

        forms: simpleForms(["year"]),
        shortForms: simpleForms(["a", "y", "yr", "yrs"]),
    },
    {
        id: "decade",

        quantity: "time",

        forms: simpleForms(["decade"]),
        shortForms: simpleForms(["dec"]),
    },
    {
        id: "century",

        quantity: "time",

        forms: [[noun("century", { plurals: ["centuries"] })]],
    },
    {
        id: "millennium",

        quantity: "time",

        forms: [[noun("millennium", { plurals: ["millennia"] })]],
    },
    {
        id: "planck_time",

        quantity: "time",

        forms: [[modifier("planck"), noun("time")]]
    },

    // frequency
    {
        id: "hertz",

        quantity: "frequency",

        forms: [[noun("hertz", { plurals: [] })]],
        shortForms: simpleForms(["Hz"]),
    },

    // speed or velocity
    {
        id: "knot",

        quantity: "speed",

        forms: simpleForms(["knot"]),
        shortForms: simpleForms(["kn"]),
    },
    {
        id: "speed_of_light",

        quantity: "speed",

        forms: [[noun("speed"), modifier("of light")]],
        shortForms: simpleForms(["c"]),
    },

    // acceleration
    {
        id: "standard_gravity",

        quantity: "acceleration",

        forms: [[modifier("standard"), noun("gravity", { plurals: ["gravities"] })]]
    },

    // weight/force
    {
        id: "newton",

        quantity: "force",

        forms: simpleForms(["newton"]),
        shortForms: simpleForms(["N"]),
    },
    {
        id: "dyne",

        quantity: "force",

        forms: simpleForms(["dyne"]),
        shortForms: simpleForms(["dyn"]),
    },
    {
        id: "ounce",

        quantity: "force",

        disambiguators: {
            ...WEIGHT_FORCE_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "pound",

        quantity: "force",

        disambiguators: {
            ...WEIGHT_FORCE_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "stone",

        quantity: "force",

        disambiguators: {
            ...WEIGHT_FORCE_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    {
        id: "short_ton",

        quantity: "force",

        disambiguators: {
            ...WEIGHT_FORCE_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
            ...SHORT_TON_SYSTEM,
        },

        forms: [[noun("ton")]],
        shortForms: [[noun("tn")]],
    },
    {
        id: "long_ton",

        quantity: "force",

        disambiguators: {
            ...WEIGHT_FORCE_QUANTITY_SYSTEM,
            ...US_WEIGHT_SYSTEM,
            ...LONG_TON_SYSTEM,
        },

        forms: [[modifier("ton")]],
        shortForms: [[modifier("tn")]],
    },
    {
        id: "poundal",

        quantity: "force",

        forms: simpleForms(["poundal"]),
        shortForms: simpleForms(["pdl"]),
    },

    // pressure
    {
        id: "atmosphere",

        quantity: "pressure",

        forms: simpleForms(["atmosphere"]),
        shortForms: simpleForms(["atm"]),
    },
    {
        id: "bar",

        quantity: "pressure",

        forms: simpleForms(["bar"]),
        shortForms: simpleForms(["bar"]),
    },
    {
        id: "barye",

        quantity: "pressure",

        forms: simpleForms(["barye"]),
        shortForms: simpleForms(["barye"]),
    },
    {
        id: "pascal",

        quantity: "pressure",

        forms: simpleForms(["pascal"]),
        shortForms: simpleForms(["Pa"]),
    },
    {
        id: "torr",

        quantity: "pressure",

        forms: [[noun("torr", { plurals: [] })]],
        shortForms: simpleForms(["torr"]),
    },

    // energy
    {
        id: "british_thermal_unit",

        quantity: "energy",

        forms: [[modifier("british"), modifier("thermal"), noun("unit")]],
        shortForms: simpleForms(["BTU", "BTUs"]),
    },
    {
        id: "calorie",

        quantity: "energy",

        forms: simpleForms(["calorie"]),
        shortForms: simpleForms(["cal", "cals"]),
    },
    {
        id: "joule",

        quantity: "energy",

        forms: simpleForms(["joule"]),
        shortForms: simpleForms(["J"]),
    },
    {
        id: "electronvolt",

        quantity: "energy",

        forms: [[modifier("electron"), noun("volt")]],
        shortForms: simpleForms(["eV"]),
    },
    {
        id: "therm",

        quantity: "energy",

        forms: simpleForms(["therm"]),
        shortForms: simpleForms(["therm"]),
    },

    // power
    {
        id: "watt",

        quantity: "power",

        forms: simpleForms(["watt"]),
        shortForms: simpleForms(["W"]),
    },
    {
        id: "horsepower",

        quantity: "power",

        forms: [[noun("horse"), modifier("power")]],
        shortForms: simpleForms(["hp"]),
    },

    // electricity/magnetism
    {
        id: "coulomb",

        quantity: "electric_charge",

        forms: simpleForms(["coulomb"]),
        shortForms: simpleForms(["C"]),
    },
    {
        id: "ampere",

        quantity: "electric_current",

        forms: simpleForms(["ampere", "amp"]),
        shortForms: simpleForms(["A"]),
    },
    {
        id: "volt",

        quantity: "electric_potential",

        forms: simpleForms(["volt"]),
        shortForms: simpleForms(["V"]),
    },
    {
        id: "ohm",

        quantity: "electric_resistance",

        forms: simpleForms(["ohm"]),
        shortForms: simpleForms(["Ω"]),
    },
    {
        id: "siemens",

        quantity: "electric_conductance",

        forms: [[noun("siemens", { plurals: ["siemenses"] })]],
        shortForms: simpleForms(["S"]),
    },
    {
        id: "farad",

        quantity: "capacitance",

        forms: simpleForms(["farad"]),
        shortForms: simpleForms(["F"]),
    },
    {
        id: "weber",

        quantity: "magnetic_flux",

        forms: simpleForms(["weber"]),
        shortForms: simpleForms(["Wb"]),
    },
    {
        id: "gauss",

        quantity: "magnetic_flux_density",

        forms: [[noun("gauss", { plurals: ["gausses"] })]],
        shortForms: simpleForms(["G"]),
    },
    {
        id: "tesla",

        quantity: "magnetic_flux_density",

        forms: simpleForms(["tesla"]),
        shortForms: simpleForms(["T"]),
    },
    {
        id: "henry",

        quantity: "inductance",

        forms: [[noun("henry", { plurals: ["henries"] })]],
        shortForms: simpleForms(["H"]),
    },

    // temperature
    {
        id: "degree_celsius",

        quantity: "temperature",

        forms: [[noun("degree"), modifier("celsius")]],
        shortForms: simpleForms(["°C"]),
    },
    {
        id: "degree_fahrenheit",

        quantity: "temperature",

        forms: [[noun("degree"), modifier("fahrenheit")]],
        shortForms: simpleForms(["°F"]),
    },
    {
        id: "degree_rankine",

        quantity: "temperature",

        forms: [[noun("degree"), modifier("rankine")]],
        shortForms: simpleForms(["°R"]),
    },
    {
        id: "kelvin",

        quantity: "temperature",

        forms: [[noun("kelvin")], [noun("degree"), modifier("kelvin")]],
        shortForms: simpleForms(["K", "°K"]),
    },

    // information
    {
        id: "natural_unit_of_information",

        quantity: "information",

        forms: [[modifier("natural"), noun("unit"), modifier("of information")], [noun("nepit")], [noun("nit")]],
        shortForms: simpleForms(["nat"]),
    },
    {
        id: "bit",

        quantity: "information",

        forms: simpleForms(["bit", "shannon"]),
        shortForms: simpleForms(["b", "Sh"]),
    },
    {
        id: "nibble",

        quantity: "information",

        forms: simpleForms(["nibble"]),
    },
    {
        id: "byte",

        quantity: "information",

        forms: simpleForms(["byte"]),
        shortForms: simpleForms(["B"]),
    },

    // information rate
    {
        id: "bit_per_second",

        quantity: "information_rate",

        forms: [[noun("bit"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["bps"]),
    },
    {
        id: "byte_per_second",

        quantity: "information_rate",

        forms: [[noun("byte"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["Bps"]),
    },

    // luminous intensity
    {
        id: "candela",

        quantity: "luminous_intensity",

        forms: [[noun("candela")], [noun("candle"), modifier("power")]],
        shortForms: simpleForms(["cd"]),
    },

    // luminous flux
    {
        id: "lumen",

        quantity: "luminous_flux",

        forms: simpleForms(["lumen"]),
        shortForms: simpleForms(["lm"]),
    },

    // illuminance
    {
        id: "lux",

        quantity: "illuminance",

        forms: [[noun("lux", { plurals: ["luxes"] })]],
        shortForms: simpleForms(["lx"]),
    },
    {
        id: "footcandle",

        quantity: "illuminance",

        forms: [[modifier("foot"), noun("candle")]],
        shortForms: simpleForms(["fc"]),
    },

    // radiation and doses
    {
        id: "becquerel",

        quantity: "radiation_source_activity",

        forms: simpleForms(["becquerel"]),
        shortForms: simpleForms(["Bq"]),
    },
    {
        id: "curie",

        quantity: "radiation_source_activity",

        forms: simpleForms(["curie"]),
        shortForms: simpleForms(["Ci"]),
    },
    {
        id: "rutherford",

        quantity: "radiation_source_activity",

        forms: simpleForms(["rutherford"]),
        shortForms: simpleForms(["Rd"]),
    },
    {
        id: "roentgen",

        quantity: "radiation_exposure",

        forms: [[noun("roentgen", {
            accents: [
                { index: 1, unicode: "ö" },
                { index: 2, unicode: "" },
            ]
        })]],
        shortForms: simpleForms(["R"]),
    },
    {
        id: "gray",

        quantity: "radiation_absorbed_dose",

        forms: simpleForms(["gray"]),
        shortForms: simpleForms(["Gy"]),
    },
    {
        id: "roentgen_equivalent_man",

        quantity: "radiation_equivalent_dose",

        forms: [[noun("roentgen", {
            accents: [
                { index: 1, unicode: "ö" },
                { index: 2, unicode: "" },
            ]
        }), modifier("equivalent"), modifier("man")]],
        shortForms: simpleForms(["rem"]),
    },
    {
        id: "sievert",

        quantity: "radiation_equivalent_dose",

        forms: simpleForms(["sievert"]),
        shortForms: simpleForms(["Sv"]),
    },

    // amount of substance
    {
        id: "mole",

        quantity: "amount_of_substance",

        forms: simpleForms(["mole"]),
        shortForms: simpleForms(["mol"]),
    },

    // proportion
    {
        id: "percent",

        quantity: "proportion",

        forms: simpleForms(["percent"]),
        shortForms: simpleForms(["pct", "%"]),
    },
    {
        id: "part_per_thousand",

        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("thousand")]],
    },
    {
        id: "part_per_million",

        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("million")]],
        shortForms: simpleForms(["ppm"]),
    },
    {
        id: "part_per_billion",

        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("billion")]],
        shortForms: simpleForms(["ppb"]),
    },
    {
        id: "part_per_trillion",

        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("trillion")]],
        shortForms: simpleForms(["ppt"]),
    },
    {
        id: "part_per_quadrillion",

        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("quadrillion")]],
        shortForms: simpleForms(["ppq"]),
    },
] as const satisfies ReadonlyArray<UnitProps>;

const SI_PREFIXES_LONG: { [prefix: string]: Num } = {
    "quecto": { type: "rational", n: 1n, d: 10n ** 30n },
    "ronto": { type: "rational", n: 1n, d: 10n ** 27n },
    "yocto": { type: "rational", n: 1n, d: 10n ** 24n },
    "zepto": { type: "rational", n: 1n, d: 10n ** 21n },
    "atto": { type: "rational", n: 1n, d: 10n ** 18n },
    "femto": { type: "rational", n: 1n, d: 10n ** 15n },
    "pico": { type: "rational", n: 1n, d: 10n ** 12n },
    "nano": { type: "rational", n: 1n, d: 1_000_000_000n },
    "micro": { type: "rational", n: 1n, d: 1_000_000n },
    "milli": { type: "rational", n: 1n, d: 1000n },
    "centi": { type: "rational", n: 1n, d: 100n },
    "deci": { type: "rational", n: 1n, d: 10n },
    "deca": { type: "int", int: 10n },
    "hecto": { type: "int", int: 100n },
    "kilo": { type: "int", int: 1000n },
    "mega": { type: "int", int: 1_000_000n },
    "giga": { type: "int", int: 1_000_000_000n },
    "tera": { type: "int", int: 10n ** 12n },
    "peta": { type: "int", int: 10n ** 15n },
    "exa": { type: "int", int: 10n ** 18n },
    "zetta": { type: "int", int: 10n ** 21n },
    "yotta": { type: "int", int: 10n ** 24n },
    "ronna": { type: "int", int: 10n ** 27n },
    "quetta": { type: "int", int: 10n ** 30n },
};

const SI_PREFIXES_SHORT: { [prefix: string]: Num } = {
    "q": { type: "rational", n: 1n, d: 10n ** 30n },
    "r": { type: "rational", n: 1n, d: 10n ** 27n },
    "y": { type: "rational", n: 1n, d: 10n ** 24n },
    "z": { type: "rational", n: 1n, d: 10n ** 21n },
    "a": { type: "rational", n: 1n, d: 10n ** 18n },
    "f": { type: "rational", n: 1n, d: 10n ** 15n },
    "p": { type: "rational", n: 1n, d: 10n ** 12n },
    "n": { type: "rational", n: 1n, d: 1_000_000_000n },
    "\xb5": { type: "rational", n: 1n, d: 1_000_000n },
    "mc": { type: "rational", n: 1n, d: 1_000_000n },
    "m": { type: "rational", n: 1n, d: 1000n },
    "c": { type: "rational", n: 1n, d: 100n },
    "d": { type: "rational", n: 1n, d: 10n },
    "da": { type: "int", int: 10n },
    "h": { type: "int", int: 100n },
    "k": { type: "int", int: 1000n },
    "M": { type: "int", int: 1_000_000n },
    "G": { type: "int", int: 1_000_000_000n },
    "T": { type: "int", int: 10n ** 12n },
    "P": { type: "int", int: 10n ** 15n },
    "E": { type: "int", int: 10n ** 18n },
    "Z": { type: "int", int: 10n ** 21n },
    "Y": { type: "int", int: 10n ** 24n },
    "R": { type: "int", int: 10n ** 27n },
    "Q": { type: "int", int: 10n ** 30n },
};

const BINARY_PREFIXES_LONG: { [prefix: string]: Num } = {
    "kibi": { type: "int", int: 1024n },
    "mebi": { type: "int", int: 1024n ** 2n },
    "gibi": { type: "int", int: 1024n ** 3n },
    "tebi": { type: "int", int: 1024n ** 4n },
    "pebi": { type: "int", int: 1024n ** 5n },
    "exbi": { type: "int", int: 1024n ** 6n },
    "zebi": { type: "int", int: 1024n ** 7n },
    "yobi": { type: "int", int: 1024n ** 8n },
    "robi": { type: "int", int: 1024n ** 9n },
    "quebi": { type: "int", int: 1024n ** 10n },
};

const BINARY_PREFIXES_SHORT: { [prefix: string]: Num } = {
    "Ki": { type: "int", int: 1024n },
    "Mi": { type: "int", int: 1024n ** 2n },
    "Gi": { type: "int", int: 1024n ** 3n },
    "Ti": { type: "int", int: 1024n ** 4n },
    "Pi": { type: "int", int: 1024n ** 5n },
    "Ei": { type: "int", int: 1024n ** 6n },
    "Zi": { type: "int", int: 1024n ** 7n },
    "Yi": { type: "int", int: 1024n ** 8n },
    "Ri": { type: "int", int: 1024n ** 9n },
    "Qi": { type: "int", int: 1024n ** 10n },
};

function orderings<T>(array: T[]): T[][] {
    if (array.length == 0) return [[]];
    if (array.length == 1) return [[array[0]]];

    const ords: T[][] = [];

    for (let i = 0; i < array.length; i++) {
        const ordsWithout = orderings([...array.slice(0, i), ...array.slice(i + 1)]);

        for (const ord of ordsWithout) {
            ords.push([array[i], ...ord]);
        }
    }

    return ords;
}

function combinations<T>(array: T[]): T[][] {
    const combs: T[][] = [];

    const max = 1n << BigInt(array.length);
    for (let i = 0n; i < max; i++) {
        combs.push(array.filter((_, j) => (i & (1n << BigInt(j))) != 0n));
    }

    return combs;
}

function combinationsWithout<T>(array: T[], without: T): T[][] {
    const indices = [...array.keys()].filter((i) => array[i] === without);

    return combinations(indices).map((comb) => array.filter((_, i) => !comb.includes(i)));
}

function cartProd<T>(opts: T[][]): T[][] {
    if (opts.length == 0) return [[]];

    const nProd = cartProd(opts.slice(1));

    let prod: T[][] = [];
    for (const opt of opts[0]) {
        prod = prod.concat(nProd.map(p => [opt, ...p]));
    }

    return prod;
}

function buildWordForms(wordProps: UnitWordProps, isShort: boolean): string[][] {
    const { type, word, accents, plurals } = wordProps;

    let forms = plurals === undefined ? type == "noun" && !isShort ? [word, word + "s"] : [word] : [word, ...plurals];

    for (const accent of accents ?? []) {
        forms = forms.concat(forms.map((form) => [...form]).map((form) => [
            ...form.slice(0, accent.index),
            accent.unicode,
            ...form.slice(accent.index + 1)
        ].join("")));
    }
    
    return wordProps.type == "modifier" && wordProps.isOf ? forms.map((form) => ["of", form]) : forms.map((form) => [form]);
}

function buildForms(unitProps: UnitProps): Map<string, { lowercases: number }> {
    let combSplitForms: { splitForm: string[][], lowercases: number }[] = [];

    for (const formProps of unitProps.forms) {
        // 1. plurals and different accent forms are accounted for
        // 2. any combination of "of"s can be removed

        const opts = formProps.map((word) => buildWordForms(word, false));
        const splitForms = cartProd(opts);

        combSplitForms = combSplitForms.concat(splitForms.map((splitForm) => ({ splitForm, lowercases: 0 })));
    }

    for (const shortFormProps of unitProps.shortForms ?? []) {
        const opts = shortFormProps.map((word) => buildWordForms(word, true));
        const splitForms = cartProd(opts);

        // lowercase

        // concat to combSplitForms
    }

    // add long and short disambiguators

    // 3/1. words can be in any order

    const outOfOrderSplitForms = combSplitForms.flatMap(({ splitForm, lowercases }) => orderings(splitForm).flatMap((ord) => ({ splitForm: ord, lowercases })));

    // 4/2. any combination of underscores can be removed

    const splicedForms = outOfOrderSplitForms.map(({ splitForm, lowercases }) => ({ splitForm: splitForm.length == 0 ? [] : [splitForm[0], ...splitForm.slice(1).flatMap((word) => ["_", word])], lowercases }));
    const withoutUnderscoreForms = splicedForms.flatMap(({ splitForm, lowercases }) => combinationsWithout(splitForm, "_").map((comb): [string, { lowercases: number }] => [comb.join("_"), { lowercases }]));

    const forms: Map<string, { lowercases: number }> = new Map();

    for (const [form, { lowercases }] of withoutUnderscoreForms) {
        const curr = forms.get(form);

        if (curr === undefined) {
            forms.set(form, { lowercases });
        } else {
            curr.lowercases = Math.min(curr.lowercases, lowercases);
        }
    }

    return forms;
}

function buildLongForms(unitProps: UnitProps): Set<string> {
    return buildForms(unitProps.forms, false);
}

function buildShortForms(unitProps: UnitProps): Set<string> {
    return buildForms(unitProps.shortForms ?? [], true);
}

function buildLowercaseShortForms(unitProps: UnitProps): Set<string> {
    const lowercaseForms: Set<string> = new Set();
    for (const shortForm of buildShortForms(unitProps)) {
        const formChars = [...shortForm];

        const uppercaseIndices = [...formChars.keys()].filter((i) => formChars[i] != formChars[i].toLowerCase());

        for (const comb of combinations(uppercaseIndices)) {
            if (comb.length == 0) continue;

            lowercaseForms.add(formChars.map((c, i) => comb.includes(i) ? c.toLowerCase() : c).join(""));
        }
    }

    return lowercaseForms;
}

export function buildUnitReference(): Set<string> {
    const long: Map<string, string> = new Map();
    const short: Map<string, string> = new Map();
    const lowercaseShort: Map<string, string> = new Map();

    for (const unit of UNIT_PROPS) {
        for (const form of buildLongForms(unit)) {
            if (long.has(form)) {
                console.log("LONG CONTRADICTION: " + unit.id + " " + form);
            } else {
                long.set(form, unit.id);
            }
        }

        for (const form of buildShortForms(unit)) {
            if (long.has(form) && long.get(form) !== unit.id || short.has(form) && short.get(form) !== unit.id) {
                console.log("SHORT CONTRADICTION: " + unit.id + " " + form);
            } else {
                short.set(form, unit.id);
            }
        }

        for (const form of buildLowercaseShortForms(unit)) {
            if (long.has(form) && long.get(form) !== unit.id || short.has(form) && short.get(form) !== unit.id || lowercaseShort.has(form) && lowercaseShort.get(form) !== unit.id) {
                console.log("lowercase short contradiction: " + unit.id + " " + form);
            } else {
                lowercaseShort.set(form, unit.id);
            }
        }
    }

    return new Set([...long.keys(), ...short.keys(), ...lowercaseShort.keys()]);
}

const scaleRegExp = new RegExp([...Object.keys(SI_PREFIXES_SHORT), ...Object.keys(BINARY_PREFIXES_SHORT)].join("|"), "g");

export function parseUnit(shortUnit: string) {
    shortUnit = shortUnit.normalize("NFC");

    type ParserStage = (parts: string[], mods: Record<string, { modStr: string, index: number } | null>) => void;
    function buildParserStage(modId: string, startIndexModId: string | null, modRegExp: RegExp, matchValidator: (lo: string, hi: string) => boolean, nStageFn: ParserStage): ParserStage {
        return function(parts: string[], mods: Record<string, { modStr: string, index: number } | null>): void {
            for (let i = startIndexModId === null ? 0 : mods[startIndexModId]?.index ?? 0; i < parts.length; i++) {
                const part = parts[i];

                for (const match of part.matchAll(modRegExp)) {
                    const modStr = match[0];
                    const index = match.index;

                    const lo = part.slice(0, index);
                    const hi = part.slice(index + modStr.length);
                    const superLo = parts.slice(0, i).join("") + lo;
                    const superHi = hi + parts.slice(i + 1).join("");

                    if (!matchValidator(superLo, superHi)) continue;

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

        console.log(words, buildUnitReference());
    }

    parseDisp = buildParserStage("disp", "light", /disp(?:lacement)?(?:_?of)?(?:_?(?:H2[O0]|Hg|water|mercury))?|(?:H2[O0]|Hg|water|mercury)(?:_?disp(?:lacement)?)?/gi, (lo, _hi) => lo != "", parseBaseUnit);
    parseSqOrCb = buildParserStage("sqOrCb", null, /sq(?:uare)?|cb|cubic/gi, (lo, hi) => lo != "" || hi != "", parseDisp);
    parseLight = buildParserStage("light", null, /l|[lL][iI][gG][hH][tT]/g, (_lo, hi) => hi.match(/^[a-zA-Z]/) !== null, parseSqOrCb);
    parseScale = buildParserStage("scale", null, scaleRegExp, (_lo, hi) => hi.match(/^[a-zA-Z]/) !== null, parseLight);

    parseScale([shortUnit], {});
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

// type Mod = "si_prefix" | "light" | "square" | "cubic" | "of_mercury" | "of_water" | "of_displacement" | "of_weight" | "of_mass";
// type ModifiedForms = Map<string, { mods: Mod[], dimension: string }>;

// // todo: make these invoke dimensionally-correct functions instead of being hardcoded
// const MOD_DIMENSION_CHANGES: { [mod in Mod]?: { [dimension: string]: string } } = {
//     "light": {
//         "time": "length"
//     },
//     "square": {
//         "length": "area"
//     },
//     "cubic": {
//         "length": "volume"
//     },
//     "of_mercury": {
//         "length": "pressure"
//     },
//     "of_water": {
//         "length": "pressure",
//         "mass": "volume",
//         "force": "volume",
//         "volume": "mass"
//     },
//     "of_displacement": {
//         "mass": "volume",
//         "force": "volume",
//         "volume": "mass"
//     },
//     "of_weight": {
//         "mass": "force"
//     },
//     "of_mass": {
//         "force": "mass"
//     }
// };

// function insertModifiersInner(before: boolean, after: boolean, forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
//     const modForms: ModifiedForms = new Map();

//     function insertModForm(form: string, mods: Mod[], dimension: string) {
//         const foundForm = modForms.get(form);
//         if (foundForm !== undefined) {
//             if (foundForm.mods.join(",") != mods.join(",") || foundForm.dimension != dimension) {
//                 console.log("MOD CONFLICT", form, mods, dimension);
//             }
//         } else {
//             modForms.set(form, { mods, dimension });
//         }
//     }

//     for (const [form, { mods: formMods, dimension }] of forms) {
//         insertModForm(form, formMods, dimension);

//         if (dimensions !== undefined && !dimensions.includes(dimension)) continue;
//         if (mutExMods !== undefined && formMods.some(m => mutExMods.includes(m))) continue;

//         for (const [modStr, mod] of mods) {
//             const nFormMods = formMods.concat([mod]).sort();
//             const nDimension = (MOD_DIMENSION_CHANGES[mod] ?? {})[dimension] ?? dimension;

//             if (before) {
//                 insertModForm(modStr + form, nFormMods, nDimension);
//                 if (after) insertModForm(modStr + "_" + form, nFormMods, nDimension);
//             }

//             for (const { index } of form.matchAll(/_/g)) {
//                 const lo = form.slice(0, index);
//                 const hi = form.slice(index + 1);

//                 if (after) insertModForm(lo + "_" + modStr + "_" + hi, nFormMods, nDimension);
//                 insertModForm(lo + "_" + modStr + hi, nFormMods, nDimension);
//                 if (after) insertModForm(lo + modStr + "_" + hi, nFormMods, nDimension);
//                 insertModForm(lo + modStr + hi, nFormMods, nDimension);
//             }

//             if (after) {
//                 insertModForm(form + modStr, nFormMods, nDimension);
//                 insertModForm(form + "_" + modStr, nFormMods, nDimension);
//             }
//         }
//     }

//     return modForms;
// }

// function insertModifiersBefore(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
//     return insertModifiersInner(true, false, forms, mods, dimensions, mutExMods);
// }

// function insertModifiers(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
//     return insertModifiersInner(true, true, forms, mods, dimensions, mutExMods);
// }

// function insertModifiersAfter(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
//     return insertModifiersInner(false, true, forms, mods, dimensions, mutExMods);
// }

// function buildLongModifierForms(baseForms: string[], unitProps: UnitProps): ModifiedForms {
//     let forms: ModifiedForms = new Map(baseForms.map(f => [f, { mods: [], dimension: unitProps.quantity }]));

//     // 2. long SI prefixes may be inserted before any word (but not after the last word)
//     // 3. short SI prefixes may be inserted before any word (but not after the last word)

//     forms = insertModifiersBefore(forms, new Map([
//         ...Object.keys(SI_PREFIXES_LONG).flatMap((modStr) => [modStr, modStr + "_"]),
//         ...Object.keys(SI_PREFIXES_SHORT).filter((modStr) => modStr == modStr.toLowerCase())
//     ].map((modStr) => [modStr, "si_prefix"])));

//     // 4. for times, "light" or "l" may be inserted before any word (but not after the last word)

//     forms = insertModifiersBefore(forms, new Map(["light", "light_", "l"].map((modStr) => [modStr, "light"])), ["time"]);

//     // 5. for lengths, "square", "squared", "sq", "cube", "cubed", "cubic", or "cb" may be inserted at any position
//     // 6. for lengths, "[of] mercury" or "[of] hg" may be inserted at any position

//     forms = insertModifiers(forms, new Map([
//         ...["square", "squared", "sq"].map((modStr): [string, Mod] => [modStr, "square"]),
//         ...["cube", "cubed", "cubic", "cb"].map((modStr): [string, Mod] => [modStr, "cubic"]),
//         ...["of_mercury", "ofmercury", "mercury", "of_hg", "ofhg", "hg"].map((modStr): [string, Mod] => [modStr, "of_mercury"]),
//     ]), ["length"]);

//     // 9. for masses, "[of] weight", "[of] wght", "[of] wgt", "[of] wt", "[of] w", "[of] force", or "[of] f" may be inserted at any position

//     forms = insertModifiers(forms, new Map([
//         "of_weight", "ofweight", "weight",
//         "of_wght", "ofwght", "wght",
//         "of_wgt", "ofwgt", "wgt",
//         "of_wt", "ofwt", "wt",
//         "of_w", "ofw", "w",
//         "of_force", "offorce", "force",
//         "of_f", "off", "f"
//     ].map((modStr) => [modStr, "of_weight"])), ["mass"]);

//     // 10. for weights/forces, "[of] mass" may be inserted at any position

//     forms = insertModifiers(forms, new Map(["of_mass", "ofmass", "mass"].map((modStr) => [modStr, "of_mass"])), ["force"], ["of_weight"]);

//     // 7. for lengths, masses, weights/forces, or volumes, "[of] water" or "[of] h2o" may be inserted at any position

//     forms = insertModifiers(forms, new Map(["of_water", "ofwater", "water", "of_h2o", "ofh2o", "h2o"].map((modStr) => [modStr, "of_water"])), ["length", "mass", "force", "volume"], ["of_weight", "of_mass"]);

//     // 8. for masses, weights/forces, or volumes, "[of] displacement", "[of] disp", "[of] water displacement", "[of] water disp", "[of] h2o displacement", or "[of] h20 disp" may be inserted at any position

//     forms = insertModifiers(forms, new Map([
//         "of_displacement", "ofdisplacement", "displacement", "of_disp", "ofdisp", "disp",
//         "of_water_displacement", "ofwater_displacement", "water_displacement", "of_water_disp", "ofwater_disp", "water_disp",
//         "of_waterdisplacement", "ofwaterdisplacement", "waterdisplacement", "of_waterdisp", "ofwaterdisp", "waterdisp",
//         "of_h2o_displacement", "ofh2o_displacement", "h2o_displacement", "of_h2o_disp", "ofh2o_disp", "h2o_disp",
//         "of_h2odisplacement", "ofh2odisplacement", "h2odisplacement", "of_h2odisp", "ofh2odisp", "h2odisp"
//     ].map((modStr) => [modStr, "of_displacement"])), ["length", "mass", "force", "volume"], ["of_weight", "of_mass", "of_water"]);

//     return new Map([...forms].filter(([_, { mods, dimension: _dimension }]) => mods.length != 0));
// }

// function buildShortModifierForms(baseForms: string[], unitProps: UnitProps): ModifiedForms {
//     let forms: ModifiedForms = new Map(baseForms.map(f => [f, { mods: [], dimension: unitProps.quantity }]));

//     // 2. short SI prefixes may be inserted before any word (but not after the last word)

//     forms = insertModifiersBefore(forms, new Map(Object.keys(SI_PREFIXES_SHORT).map((modStr) => [modStr, "si_prefix"])));

//     // 3. for times, "l" may be inserted before any word (but not after the last word)

//     forms = insertModifiersBefore(forms, new Map([["l", "light"]]), ["time"]);

//     // 4. for lengths, "sq" or "cb" may be inserted at any position

//     forms = insertModifiers(forms, new Map([
//         ["sq", "square"],
//         ["cb", "cubic"],
//     ]), ["length"]);

//     // 5. for lengths, "Hg" or "hg" may be inserted after any word (but not before the first word)

//     forms = insertModifiersAfter(forms, new Map([
//         ["Hg", "of_mercury"],
//         ["hg", "of_mercury"],
//     ]), ["length"]);

//     // 8. for masses, "wght", "wgt", "wt", "w", or "f" may be inserted after any word (but not before the first word)

//     forms = insertModifiersAfter(forms, new Map(["wght", "wgt", "wt", "w", "f"].map((modStr) => [modStr, "of_weight"])), ["mass"]);

//     // 6. for lengths, masses, weights/forces, or volumes, "H2O", "h2O", "H2o", or "h2o" may be inserted after any word (but not before the first word)

//     forms = insertModifiers(forms, new Map(["H2O", "h2O", "H2o", "h2o"].map((modStr) => [modStr, "of_water"])), ["length", "mass", "force", "volume"], ["of_weight"]);

//     // 7. for masses, weights/forces, or volumes, "disp" with optional pre- or post-fixed "H2O", "h2O", "H2o", or "h2o" may be inserted after any word (but not before the first word)

//     forms = insertModifiersAfter(forms, new Map([
//         "disp",
//         "dispH2O", "disph2O", "dispH2o", "disph2o",
//         "disp_H2O", "disp_h2O", "disp_H2o", "disp_h2o",
//         "H2Odisp", "h2Odisp", "H2odisp", "h2odisp",
//         "H2O_disp", "h2O_disp", "H2o_disp", "h2o_disp",
//     ].map((modStr) => [modStr, "of_displacement"])), ["length", "mass", "force", "volume"], ["of_weight", "of_water"]);

//     return new Map([...forms].filter(([_, { mods, dimension: _dimension }]) => mods.length != 0));
// }

interface UnitlessUnit {
    readonly type: "unitless";
}

interface BaseUnit {
    readonly type: "base";
    readonly unit: string;
    readonly scale: Num;
}

interface ProdUnit {
    readonly type: "prod";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

interface QuotUnit {
    readonly type: "quot";
    readonly lhs: Unit;
    readonly rhs: Unit;
}

interface PowUnit {
    readonly type: "pow";
    readonly arg: Unit;
    readonly pow: bigint;
}

export type Unit = UnitlessUnit | BaseUnit | ProdUnit | QuotUnit | PowUnit;