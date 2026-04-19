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

type System = "si" | "cgs" | "us" | "us_survey" | "nautical" | "imperial" | "troy";

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

interface UnitProps {
    readonly id: string;

    readonly quantity: Quantity; // used to differentiate units with the same name
    readonly system?: System; // used to differentiate units with the same name

    readonly quantityForms?: ReadonlyArray<UnitFormProps>;
    readonly shortQuantityForms?: ReadonlyArray<UnitFormProps>;

    readonly systemForms?: ReadonlyArray<UnitFormProps>;
    readonly shortSystemForms?: ReadonlyArray<UnitFormProps>;

    readonly forms: ReadonlyArray<UnitFormProps>;
    readonly shortForms?: ReadonlyArray<UnitFormProps>;
    readonly rawShortForms?: ReadonlyArray<UnitFormProps>; // no quantity or system forms
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
    system: "us",

    systemForms: [[modifier("united_states"), modifier("statutory"), modifier("statute"), modifier("international"), modifier("land")]],
    shortSystemForms: [[modifier("US"), modifier("us"), modifier("stat"), modifier("intl"), modifier("int"), modifier("land")]],
} as const satisfies Partial<UnitProps>;

const NAUTICAL_SYSTEM = {
    system: "nautical",

    systemForms: [[modifier("nautical")]],
    shortSystemForms: [[modifier("naut"), modifier("n")]],
} as const satisfies Partial<UnitProps>;

const US_VOLUME_SYSTEM = {
    system: "us",

    systemForms: [[modifier("united_states"), modifier("customary")]],
    shortSystemForms: [[modifier("US"), modifier("us"), modifier("cust")]],
} as const satisfies Partial<UnitProps>;

const IMPERIAL_VOLUME_SYSTEM = {
    system: "imperial",

    systemForms: [[modifier("imperial")]],
    shortSystemForms: [[modifier("imp")]],
} as const satisfies Partial<UnitProps>;

const TROY_MASS_SYSTEM = {
    system: "troy",

    systemForms: [[modifier("troy")]],
    shortSystemForms: [[modifier("tr")], [modifier("t")]],
} as const satisfies Partial<UnitProps>;

const US_MASS_QUANTITY_SYSTEM = {
    quantity: "mass",
    system: "us",

    quantityForms: [[modifier("mass")]],
    shortQuantityForms: [[modifier("m")]],

    systemForms: [[modifier("avoirdupois")]],
    shortSystemForms: [[modifier("av")]],
} as const satisfies Partial<UnitProps>;

const US_WEIGHT_QUANTITY_SYSTEM = {
    quantity: "force",
    system: "us",

    quantityForms: [[modifier("weight")], [modifier("force")]],
    shortQuantityForms: [[modifier("wght")], [modifier("wgt")], [modifier("wt")], [modifier("wt")], [modifier("w")], [modifier("f")]],

    systemForms: [[modifier("avoirdupois")]],
    shortSystemForms: [[modifier("av")]],
} as const satisfies Partial<UnitProps>;

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
        ...US_LAND_SYSTEM,

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
        ...US_LAND_SYSTEM,

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
    },
    {
        id: "nautical_mile",

        quantity: "length",
        ...NAUTICAL_SYSTEM,

        forms: [[noun("mile")]],
        shortForms: simpleForms(["mi"]),
        rawShortForms: simpleForms(["NM"]),
    },
    {
        id: "nautical_league",

        quantity: "length",
        ...NAUTICAL_SYSTEM,

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
        ...US_VOLUME_SYSTEM,

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    {
        id: "us_quart",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    {
        id: "us_pint",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    {
        id: "us_cup",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    {
        id: "us_fluid_ounce",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        quantityForms: simpleForms(["fluid"]),
        shortQuantityForms: simpleForms(["fl"]),

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "us_tablespoon",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    {
        id: "us_teaspoon",

        quantity: "volume",
        ...US_VOLUME_SYSTEM,

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    {
        id: "imperial_gallon",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    {
        id: "imperial_quart",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    {
        id: "imperial_pint",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    {
        id: "imperial_cup",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    {
        id: "imperial_fluid_ounce",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        quantityForms: simpleForms(["fluid"]),
        shortQuantityForms: simpleForms(["fl"]),

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "imperial_tablespoon",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    {
        id: "imperial_teaspoon",

        quantity: "volume",
        ...IMPERIAL_VOLUME_SYSTEM,

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
        system: "si",

        systemForms: simpleForms(["metric"]),

        forms: simpleForms(["ton", "tonne"]),
        shortForms: simpleForms(["t"]),
    },
    {
        id: "ounce_mass",

        ...US_MASS_QUANTITY_SYSTEM,

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "pound_mass",

        ...US_MASS_QUANTITY_SYSTEM,

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "stone_mass",

        ...US_MASS_QUANTITY_SYSTEM,

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    {
        id: "short_ton_mass",

        ...US_MASS_QUANTITY_SYSTEM,

        forms: [[noun("ton")], [modifier("short"), modifier("ton")]],
        shortForms: [[noun("tn")], [modifier("sh"), modifier("tn")]],
    },
    {
        id: "long_ton_mass",

        ...US_MASS_QUANTITY_SYSTEM,

        forms: [[modifier("long"), modifier("ton")]],
        shortForms: [[modifier("long"), modifier("tn")]],
    },
    {
        id: "grain",

        quantity: "mass",
        ...TROY_MASS_SYSTEM,

        forms: simpleForms(["grain"]),
        shortForms: simpleForms(["gr"]),
    },
    {
        id: "pennyweight",

        quantity: "mass",
        ...TROY_MASS_SYSTEM,

        forms: simpleForms(["pennyweight"]),
        shortForms: simpleForms(["dwt", "dwts", "pwt", "pwts"]),
    },
    {
        id: "troy_ounce",

        quantity: "mass",
        ...TROY_MASS_SYSTEM,

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "troy_pound",

        quantity: "mass",
        ...TROY_MASS_SYSTEM,

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

        ...US_WEIGHT_QUANTITY_SYSTEM,

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "pound",

        ...US_WEIGHT_QUANTITY_SYSTEM,

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "stone",

        ...US_WEIGHT_QUANTITY_SYSTEM,

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    {
        id: "short_ton",

        ...US_WEIGHT_QUANTITY_SYSTEM,

        forms: [[noun("ton")], [modifier("short"), modifier("ton")]],
        shortForms: [[noun("tn")], [modifier("sh"), modifier("tn")]],
    },
    {
        id: "long_ton",

        ...US_WEIGHT_QUANTITY_SYSTEM,

        forms: [[modifier("long"), modifier("ton")]],
        shortForms: [[modifier("long"), modifier("tn")]],
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

        forms: [[noun("kelvin")], [noun("degree"), modifier("celsius")]],
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

export function parseShortUnit(shortUnit: string) {

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
// 9. for masses, "[of] weight", "[of] wght", "[of] wgt", "[of] wt", "[of] w", "[of] force", or "[of] f" may be inserted at any position
// 10. for weights/forces, "[of] mass" may be inserted at any position

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
// 8. for masses, "wght", "wgt", "wt", "w", or "f" may be inserted after any word (but not before the first word)

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

function buildAliasLongForms(aliasProps: UnitProps | Exclude<UnitProps["aliases"], undefined>[number]): Set<string> {
    const id = aliasProps.id;

    if (id != id.normalize("NFC").toLowerCase()) {
        throw new Error(id);
    }

    // 1. plurals and different accent forms are accounted for

    let inOrderForms = aliasProps.plurals === undefined ? [[...id], [...id, "s"]] : [id, ...aliasProps.plurals].map((form) => [...form]);

    for (const accent of aliasProps.accents ?? []) {
        inOrderForms = inOrderForms.concat(inOrderForms.map((form) => [
            ...form.slice(0, accent.index),
            accent.unicode,
            ...form.slice(accent.index + 1)
        ]));
    }

    const splitInOrderForms = inOrderForms.map((form) => form.join("").split("_"));

    // 2. any combination of "of"s can be removed

    const withoutOfForms = splitInOrderForms.flatMap((form) => combinationsWithout(form, "of"));

    // 3. words can be in any order

    const outOfOrderForms = withoutOfForms.flatMap((form) => orderings(form));

    const splicedForms = outOfOrderForms.map((form) => form.length == 0 ? [] : [form[0], ...form.slice(1).flatMap((word) => ["_", word])]);

    // 4. any combination of underscores can be removed

    const withoutUnderscoreForms = splicedForms.flatMap((form) => combinationsWithout(form, "_"));

    return new Set(withoutUnderscoreForms.map((form) => form.join("")));
}

function buildUnitLongForms(unitProps: UnitProps): Set<string> {
    const forms: Set<string> = new Set();

    for (const alias of [unitProps, ...(unitProps.aliases ?? [])]) {
        for (const form of buildAliasLongForms(alias)) {
            forms.add(form);
        }
    }

    return forms;
}

function buildShortForms(id: string): Set<string> {
    if (id != id.normalize("NFC")) {
        throw new Error(id);
    }

    // 1. parts separated by underscores can be in any order

    const words = id.split("_");
    const outOfOrderForms = orderings(words);

    // 2. any combination of underscores can be removed

    const splicedForms = outOfOrderForms.map((form) => form.length == 0 ? [] : [form[0], ...form.slice(1).flatMap((word) => ["_", word])]);
    const withoutUnderscoreForms = splicedForms.flatMap((form) => combinationsWithout(form, "_")).map((form) => form.join(""));

    return new Set(withoutUnderscoreForms);
}

function buildUnitShortForms(unitProps: UnitProps): Set<string> {
    const forms: Set<string> = new Set();

    for (const shortFormId of unitProps.shortForms ?? []) {
        for (const form of buildShortForms(shortFormId)) {
            forms.add(form);
        }
    }

    return forms;
}

function buildLowercaseShortForms(id: string): Set<string> {
    // 3. any combination of uppercase letters can be lowercased

    const lowercaseForms: Set<string> = new Set();
    for (const shortForm of buildShortForms(id)) {
        const formChars = [...shortForm];

        const uppercaseIndices = [...formChars.keys()].filter((i) => formChars[i] != formChars[i].toLowerCase());

        for (const comb of combinations(uppercaseIndices)) {
            if (comb.length == 0) continue;

            lowercaseForms.add(formChars.map((c, i) => comb.includes(i) ? c.toLowerCase() : c).join(""));
        }
    }

    return lowercaseForms;
}

function buildUnitLowercaseShortForms(unitProps: UnitProps): Set<string> {
    const forms: Set<string> = new Set();

    for (const shortFormId of unitProps.shortForms ?? []) {
        for (const form of buildLowercaseShortForms(shortFormId)) {
            forms.add(form);
        }
    }

    return forms;
}

type Mod = "si_prefix" | "light" | "square" | "cubic" | "of_mercury" | "of_water" | "of_displacement" | "of_weight" | "of_mass";
type ModifiedForms = Map<string, { mods: Mod[], dimension: string }>;

// todo: make these invoke dimensionally-correct functions instead of being hardcoded
const MOD_DIMENSION_CHANGES: { [mod in Mod]?: { [dimension: string]: string } } = {
    "light": {
        "time": "length"
    },
    "square": {
        "length": "area"
    },
    "cubic": {
        "length": "volume"
    },
    "of_mercury": {
        "length": "pressure"
    },
    "of_water": {
        "length": "pressure",
        "mass": "volume",
        "force": "volume",
        "volume": "mass"
    },
    "of_displacement": {
        "mass": "volume",
        "force": "volume",
        "volume": "mass"
    },
    "of_weight": {
        "mass": "force"
    },
    "of_mass": {
        "force": "mass"
    }
};

function insertModifiersInner(before: boolean, after: boolean, forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
    const modForms: ModifiedForms = new Map();

    function insertModForm(form: string, mods: Mod[], dimension: string) {
        const foundForm = modForms.get(form);
        if (foundForm !== undefined) {
            if (foundForm.mods.join(",") != mods.join(",") || foundForm.dimension != dimension) {
                console.log("MOD CONFLICT", form, mods, dimension);
            }
        } else {
            modForms.set(form, { mods, dimension });
        }
    }

    for (const [form, { mods: formMods, dimension }] of forms) {
        insertModForm(form, formMods, dimension);

        if (dimensions !== undefined && !dimensions.includes(dimension)) continue;
        if (mutExMods !== undefined && formMods.some(m => mutExMods.includes(m))) continue;

        for (const [modStr, mod] of mods) {
            const nFormMods = formMods.concat([mod]).sort();
            const nDimension = (MOD_DIMENSION_CHANGES[mod] ?? {})[dimension] ?? dimension;

            if (before) {
                insertModForm(modStr + form, nFormMods, nDimension);
                if (after) insertModForm(modStr + "_" + form, nFormMods, nDimension);
            }

            for (const { index } of form.matchAll(/_/g)) {
                const lo = form.slice(0, index);
                const hi = form.slice(index + 1);

                if (after) insertModForm(lo + "_" + modStr + "_" + hi, nFormMods, nDimension);
                insertModForm(lo + "_" + modStr + hi, nFormMods, nDimension);
                if (after) insertModForm(lo + modStr + "_" + hi, nFormMods, nDimension);
                insertModForm(lo + modStr + hi, nFormMods, nDimension);
            }

            if (after) {
                insertModForm(form + modStr, nFormMods, nDimension);
                insertModForm(form + "_" + modStr, nFormMods, nDimension);
            }
        }
    }

    return modForms;
}

function insertModifiersBefore(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
    return insertModifiersInner(true, false, forms, mods, dimensions, mutExMods);
}

function insertModifiers(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
    return insertModifiersInner(true, true, forms, mods, dimensions, mutExMods);
}

function insertModifiersAfter(forms: ModifiedForms, mods: Map<string, Mod>, dimensions?: string[], mutExMods?: Mod[]): ModifiedForms {
    return insertModifiersInner(false, true, forms, mods, dimensions, mutExMods);
}

function buildLongModifierForms(baseForms: string[], unitProps: UnitProps): ModifiedForms {
    let forms: ModifiedForms = new Map(baseForms.map(f => [f, { mods: [], dimension: unitProps.quantity }]));

    // 2. long SI prefixes may be inserted before any word (but not after the last word)
    // 3. short SI prefixes may be inserted before any word (but not after the last word)

    forms = insertModifiersBefore(forms, new Map([
        ...Object.keys(SI_PREFIXES_LONG).flatMap((modStr) => [modStr, modStr + "_"]),
        ...Object.keys(SI_PREFIXES_SHORT).filter((modStr) => modStr == modStr.toLowerCase())
    ].map((modStr) => [modStr, "si_prefix"])));

    // 4. for times, "light" or "l" may be inserted before any word (but not after the last word)

    forms = insertModifiersBefore(forms, new Map(["light", "light_", "l"].map((modStr) => [modStr, "light"])), ["time"]);

    // 5. for lengths, "square", "squared", "sq", "cube", "cubed", "cubic", or "cb" may be inserted at any position
    // 6. for lengths, "[of] mercury" or "[of] hg" may be inserted at any position

    forms = insertModifiers(forms, new Map([
        ...["square", "squared", "sq"].map((modStr): [string, Mod] => [modStr, "square"]),
        ...["cube", "cubed", "cubic", "cb"].map((modStr): [string, Mod] => [modStr, "cubic"]),
        ...["of_mercury", "ofmercury", "mercury", "of_hg", "ofhg", "hg"].map((modStr): [string, Mod] => [modStr, "of_mercury"]),
    ]), ["length"]);

    // 9. for masses, "[of] weight", "[of] wght", "[of] wgt", "[of] wt", "[of] w", "[of] force", or "[of] f" may be inserted at any position

    forms = insertModifiers(forms, new Map([
        "of_weight", "ofweight", "weight",
        "of_wght", "ofwght", "wght",
        "of_wgt", "ofwgt", "wgt",
        "of_wt", "ofwt", "wt",
        "of_w", "ofw", "w",
        "of_force", "offorce", "force",
        "of_f", "off", "f"
    ].map((modStr) => [modStr, "of_weight"])), ["mass"]);

    // 10. for weights/forces, "[of] mass" may be inserted at any position

    forms = insertModifiers(forms, new Map(["of_mass", "ofmass", "mass"].map((modStr) => [modStr, "of_mass"])), ["force"], ["of_weight"]);

    // 7. for lengths, masses, weights/forces, or volumes, "[of] water" or "[of] h2o" may be inserted at any position

    forms = insertModifiers(forms, new Map(["of_water", "ofwater", "water", "of_h2o", "ofh2o", "h2o"].map((modStr) => [modStr, "of_water"])), ["length", "mass", "force", "volume"], ["of_weight", "of_mass"]);

    // 8. for masses, weights/forces, or volumes, "[of] displacement", "[of] disp", "[of] water displacement", "[of] water disp", "[of] h2o displacement", or "[of] h20 disp" may be inserted at any position

    forms = insertModifiers(forms, new Map([
        "of_displacement", "ofdisplacement", "displacement", "of_disp", "ofdisp", "disp",
        "of_water_displacement", "ofwater_displacement", "water_displacement", "of_water_disp", "ofwater_disp", "water_disp",
        "of_waterdisplacement", "ofwaterdisplacement", "waterdisplacement", "of_waterdisp", "ofwaterdisp", "waterdisp",
        "of_h2o_displacement", "ofh2o_displacement", "h2o_displacement", "of_h2o_disp", "ofh2o_disp", "h2o_disp",
        "of_h2odisplacement", "ofh2odisplacement", "h2odisplacement", "of_h2odisp", "ofh2odisp", "h2odisp"
    ].map((modStr) => [modStr, "of_displacement"])), ["length", "mass", "force", "volume"], ["of_weight", "of_mass", "of_water"]);

    return new Map([...forms].filter(([_, { mods, dimension: _dimension }]) => mods.length != 0));
}

function buildShortModifierForms(baseForms: string[], unitProps: UnitProps): ModifiedForms {
    let forms: ModifiedForms = new Map(baseForms.map(f => [f, { mods: [], dimension: unitProps.quantity }]));

    // 2. short SI prefixes may be inserted before any word (but not after the last word)

    forms = insertModifiersBefore(forms, new Map(Object.keys(SI_PREFIXES_SHORT).map((modStr) => [modStr, "si_prefix"])));

    // 3. for times, "l" may be inserted before any word (but not after the last word)

    forms = insertModifiersBefore(forms, new Map([["l", "light"]]), ["time"]);

    // 4. for lengths, "sq" or "cb" may be inserted at any position

    forms = insertModifiers(forms, new Map([
        ["sq", "square"],
        ["cb", "cubic"],
    ]), ["length"]);

    // 5. for lengths, "Hg" or "hg" may be inserted after any word (but not before the first word)

    forms = insertModifiersAfter(forms, new Map([
        ["Hg", "of_mercury"],
        ["hg", "of_mercury"],
    ]), ["length"]);

    // 8. for masses, "wght", "wgt", "wt", "w", or "f" may be inserted after any word (but not before the first word)

    forms = insertModifiersAfter(forms, new Map(["wght", "wgt", "wt", "w", "f"].map((modStr) => [modStr, "of_weight"])), ["mass"]);

    // 6. for lengths, masses, weights/forces, or volumes, "H2O", "h2O", "H2o", or "h2o" may be inserted after any word (but not before the first word)

    forms = insertModifiers(forms, new Map(["H2O", "h2O", "H2o", "h2o"].map((modStr) => [modStr, "of_water"])), ["length", "mass", "force", "volume"], ["of_weight"]);

    // 7. for masses, weights/forces, or volumes, "disp" with optional pre- or post-fixed "H2O", "h2O", "H2o", or "h2o" may be inserted after any word (but not before the first word)

    forms = insertModifiersAfter(forms, new Map([
        "disp",
        "dispH2O", "disph2O", "dispH2o", "disph2o",
        "disp_H2O", "disp_h2O", "disp_H2o", "disp_h2o",
        "H2Odisp", "h2Odisp", "H2odisp", "h2odisp",
        "H2O_disp", "h2O_disp", "H2o_disp", "h2o_disp",
    ].map((modStr) => [modStr, "of_displacement"])), ["length", "mass", "force", "volume"], ["of_weight", "of_water"]);

    return new Map([...forms].filter(([_, { mods, dimension: _dimension }]) => mods.length != 0));
}

export function buildUnitReference(): Set<string> {
    // 1. build all permutations of long names
    // 2. mix in short names
    // 3. take product with all permutations of prefixes
    // 4. resolve conflicts

    // 1. build long/short base units

    const longBaseUnits: Map<string, string> = new Map();
    const shortBaseUnits: Map<string, string> = new Map();
    const lowercaseShortBaseUnits: Map<string, string> = new Map();

    for (const unit of UNIT_PROPS) {
        for (const form of buildUnitLongForms(unit)) {
            if (longBaseUnits.has(form)) {
                console.log("LONG CONTRADICTION: " + unit.id + " " + form);
            } else {
                longBaseUnits.set(form, unit.id);
            }
        }

        for (const form of buildUnitShortForms(unit)) {
            if (longBaseUnits.has(form) && longBaseUnits.get(form) !== unit.id || shortBaseUnits.has(form) && shortBaseUnits.get(form) !== unit.id) {
                console.log("SHORT CONTRADICTION: " + unit.id + " " + form);
            } else {
                shortBaseUnits.set(form, unit.id);
            }
        }

        for (const form of buildUnitLowercaseShortForms(unit)) {
            if (longBaseUnits.has(form) && longBaseUnits.get(form) !== unit.id || shortBaseUnits.has(form) && shortBaseUnits.get(form) !== unit.id || lowercaseShortBaseUnits.has(form) && lowercaseShortBaseUnits.get(form) !== unit.id) {
                console.log("lowercase short contradiction: " + unit.id + " " + form);
            } else {
                lowercaseShortBaseUnits.set(form, unit.id);
            }
        }
    }

    // 2. add modifiers

    const longModifiedUnits: Map<string, { unitId: string, mods: Mod[], dimension: string }> = new Map();
    const shortModifiedUnits: Map<string, { unitId: string, mods: Mod[], dimension: string }> = new Map();

    for (const unit of [UNIT_PROPS[Math.floor(Math.random() * UNIT_PROPS.length)]]) {
        // for (const [form, { mods, dimension }] of buildLongModifierForms([...longBaseUnits, ...lowercaseShortBaseUnits].filter(([_, unitId]) => unitId == unit.id).map(([baseUnit, _]) => baseUnit), unit)) {
        //     if (longBaseUnits.has(form)) {
        //         console.log("modified long contradiction: " + unit.id + " " + form);
        //     } else {
        //         longModifiedUnits.set(form, { unitId: unit.id, mods, dimension });
        //     }
        // }

        for (const [form, { mods, dimension }] of buildShortModifierForms([...shortBaseUnits, ...lowercaseShortBaseUnits].filter(([_, unitId]) => unitId == unit.id).map(([baseUnit, _]) => baseUnit), unit)) {
            if (longBaseUnits.has(form) && longBaseUnits.get(form) !== unit.id || shortBaseUnits.has(form) && shortBaseUnits.get(form) !== unit.id || lowercaseShortBaseUnits.has(form) && lowercaseShortBaseUnits.get(form) !== unit.id || shortModifiedUnits.has(form) && shortModifiedUnits.get(form)!.unitId !== unit.id) {
                console.log("modified short contradiction: " + unit.id + " " + form);
            } else {
                shortModifiedUnits.set(form, { unitId: unit.id, mods, dimension });
            }
        }
    }

    return new Set([...longBaseUnits.keys(), ...shortBaseUnits.keys(), ...lowercaseShortBaseUnits.keys(), ...longModifiedUnits.keys(), ...shortModifiedUnits.keys()]);
}

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