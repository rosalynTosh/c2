export type Quantity = (
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
    readonly systemForms: ReadonlyArray<UnitFormProps>;
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
    readonly volume?: UnitDisambiguatorProps<"us" | "imperial">;
    readonly weight?: UnitDisambiguatorProps<"troy" | "us">;
    readonly ton?: UnitDisambiguatorProps<"si" | "short" | "long">;
    readonly calendar?: UnitDisambiguatorProps<CalendarSystem>;
}

export interface UnitProps {
    readonly id: string;

    readonly quantity: Quantity;

    readonly disambiguators?: UnitDisambiguators; // used to differentiate units with the same name

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
        shortSystemForms: [[modifier("naut")], [modifier("n")]],
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

export const UNIT_PROPS: ReadonlyArray<UnitProps> = [
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
            ...US_LAND_DISTANCE_SYSTEM,
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
            ...US_LAND_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
    },
    {
        id: "nautical_mile",

        quantity: "length",

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
        },

        forms: [[noun("mile")]],
        shortForms: simpleForms(["mi"]),
        rawShortForms: simpleForms(["NM"]),
    },
    {
        id: "nautical_league",

        quantity: "length",

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
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
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
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
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
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

        forms: [[noun("degree")], [noun("degree"), modifier("of arc")]],
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
                systemForms: [[modifier("metric")]],
            },
        },

        forms: simpleForms(["ton", "tonne"]),
        shortForms: simpleForms(["t"]),
    },
    {
        id: "ounce",

        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "pound",

        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    {
        id: "stone",

        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    {
        id: "short_ton",

        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
            ...SHORT_TON_SYSTEM,
        },

        forms: simpleForms(["ton"]),
        shortForms: simpleForms(["tn"]),
    },
    {
        id: "long_ton",

        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
            ...LONG_TON_SYSTEM,
        },

        forms: simpleForms(["ton"]),
        shortForms: simpleForms(["tn"]),
        rawShortForms: simpleForms(["LT"]),
    },
    {
        id: "grain",

        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["grain"]),
        shortForms: simpleForms(["gr"]),
    },
    {
        id: "pennyweight",

        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pennyweight"]),
        shortForms: simpleForms(["dwt", "dwts", "pwt", "pwts"]),
    },
    {
        id: "troy_ounce",

        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    {
        id: "troy_pound",

        quantity: "mass",

        disambiguators: {
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
        id: "common_month",

        quantity: "time",

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "common_year",

        quantity: "time",

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "leap_month",

        quantity: "time",

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "leap_year",

        quantity: "time",

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "julian_month",

        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "julian_year",

        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "julian_decade",

        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    {
        id: "julian_century",

        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    {
        id: "julian_millennium",

        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    {
        id: "gregorian_month",

        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "gregorian_year",

        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "gregorian_decade",

        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    {
        id: "gregorian_century",

        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    {
        id: "gregorian_millennium",

        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    {
        id: "mean_tropical_month",

        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "mean_tropical_year",

        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "mean_tropical_decade",

        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    {
        id: "mean_tropical_century",

        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    {
        id: "mean_tropical_millennium",

        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    {
        id: "sidereal_month",

        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "sidereal_year",

        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "sidereal_decade",

        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    {
        id: "sidereal_century",

        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    {
        id: "sidereal_millennium",

        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    {
        id: "synodic_month",

        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    {
        id: "synodic_year",

        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    {
        id: "synodic_decade",

        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    {
        id: "synodic_century",

        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    {
        id: "synodic_millennium",

        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    {
        id: "short_month",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "short_month",
                systemForms: [[modifier("short")]],
            },
        },

        ...MONTH_FORMS,
    },
    {
        id: "short_month_year",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "short_month",
                systemForms: [[modifier("short"), modifier("month")], [modifier("short"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    {
        id: "hollow_month",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "hollow_month",
                systemForms: [[modifier("hollow")]],
            },
        },

        ...MONTH_FORMS,
    },
    {
        id: "hollow_month_year",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "hollow_month",
                systemForms: [[modifier("hollow"), modifier("month")], [modifier("hollow"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    {
        id: "full_month",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "full_month",
                systemForms: [[modifier("full")]],
            },
        },

        ...MONTH_FORMS,
    },
    {
        id: "full_month_year",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "full_month",
                systemForms: [[modifier("full"), modifier("month")], [modifier("full"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
    },
    {
        id: "long_month",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "long_month",
                systemForms: [[modifier("long")]],
            },
        },

        ...MONTH_FORMS,
    },
    {
        id: "long_month_year",

        quantity: "time",

        disambiguators: {
            calendar: {
                system: "long_month",
                systemForms: [[modifier("long"), modifier("month")], [modifier("long"), modifier("months")]],
            },
        },

        ...YEAR_FORMS,
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
    {
        id: "gal_acceleration",

        quantity: "acceleration",

        forms: simpleForms(["galileo"]),
        shortForms: simpleForms(["Gal"]),
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
        id: "erg",

        quantity: "energy",

        forms: simpleForms(["erg"]),
        shortForms: simpleForms(["erg"]),
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