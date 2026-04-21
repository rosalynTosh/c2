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
    readonly quantity: Quantity;

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

export const UNIT_PROPS: Readonly<Record<string, UnitProps>> = {
    // length
    "angstrom": {
        quantity: "length",

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

        forms: simpleForms(["fermi"]),
    },
    "micron": {
        quantity: "length",

        forms: simpleForms(["micron"]),
        shortForms: simpleForms(["µ"]),
    },
    "meter": {
        quantity: "length",

        forms: simpleForms(["meter", "metre"]),
        shortForms: simpleForms(["m"]),
    },
    "mil": {
        quantity: "length",

        forms: simpleForms(["mil", "thou"]),
    },
    "inch": {
        quantity: "length",

        forms: [[noun("inch", { plurals: ["inches"] })]],
        shortForms: simpleForms(["in", "ins"]),
    },
    "foot": {
        quantity: "length",

        forms: [[noun("foot", { plurals: ["feet"] })]],
        shortForms: simpleForms(["ft"]),
    },
    "yard": {
        quantity: "length",

        forms: simpleForms(["yard"]),
        shortForms: simpleForms(["yd", "yds"]),
    },
    "furlong": {
        quantity: "length",

        forms: simpleForms(["furlong"]),
        shortForms: simpleForms(["fur"]),
    },
    "mile": {
        quantity: "length",

        disambiguators: {
            ...US_LAND_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["mile"]),
        shortForms: simpleForms(["mi"]),
    },
    "fathom": {
        quantity: "length",

        forms: simpleForms(["fathom"]),
        shortForms: simpleForms(["ftm"]),
    },
    "league": {
        quantity: "length",

        disambiguators: {
            ...US_LAND_DISTANCE_SYSTEM,
        },

        forms: simpleForms(["league"]),
        shortForms: simpleForms(["lea"]),
    },
    "nautical_mile": {
        quantity: "length",

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
        },

        forms: [[noun("mile")]],
        shortForms: simpleForms(["mi"]),
        rawShortForms: ["NM"],
    },
    "nautical_league": {
        quantity: "length",

        disambiguators: {
            ...NAUTICAL_DISTANCE_SYSTEM,
        },

        forms: [[noun("league")]],
        shortForms: simpleForms(["lea"]),
        rawShortForms: ["NL"],
    },
    "link": {
        quantity: "length",

        forms: simpleForms(["link"]),
        shortForms: simpleForms(["lnk"]),
    },
    "chain": {
        quantity: "length",

        forms: simpleForms(["chain"]),
        shortForms: simpleForms(["ch"]),
    },
    "rod": {
        quantity: "length",

        forms: simpleForms(["rod"]),
        shortForms: simpleForms(["rd"]),
    },
    "parsec": {
        quantity: "length",

        forms: simpleForms(["parsec"]),
        shortForms: simpleForms(["pc"]),
    },
    "astronomical_unit": {
        quantity: "length",

        forms: [[modifier("astronomical"), noun("unit")]],
        shortForms: simpleForms(["au"]),
    },
    "pixel": {
        quantity: "length",

        forms: simpleForms(["pixel"]),
        shortForms: simpleForms(["px"]),
    },
    "point": {
        quantity: "length",

        forms: simpleForms(["point"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "planck_length": {
        quantity: "length",

        forms: [[modifier("planck"), noun("length")]],
    },
    "reduced_planck_length": {
        quantity: "length",

        forms: [[modifier("reduced"), modifier("planck"), noun("length")]],
    },

    // area
    "hectare": {
        quantity: "area",

        forms: simpleForms(["hectare"]),
        shortForms: simpleForms(["ha"]),
    },
    "acre": {
        quantity: "area",

        forms: simpleForms(["acre"]),
        shortForms: simpleForms(["ac"]),
    },
    "barn": {
        quantity: "area",

        forms: simpleForms(["barn"]),
    },

    // volume
    "liter": {
        quantity: "volume",

        forms: simpleForms(["liter", "litre"]),
        shortForms: simpleForms(["L"]),
    },
    "us_gallon": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    "us_quart": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    "us_pint": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "us_cup": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    "us_fluid_ounce": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
    },
    "us_tablespoon": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    "us_teaspoon": {
        quantity: "volume",

        disambiguators: {
            ...US_VOLUME_SYSTEM,
        },

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    "imperial_gallon": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["gallon"]),
        shortForms: simpleForms(["gal", "gals"]),
    },
    "imperial_quart": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["quart"]),
        shortForms: simpleForms(["qt", "qts"]),
    },
    "imperial_pint": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["pint"]),
        shortForms: simpleForms(["pt", "pts"]),
    },
    "imperial_cup": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: simpleForms(["cup"]),
        shortForms: simpleForms(["c", "cup", "cups"]),
    },
    "imperial_fluid_ounce": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("fluid"), noun("ounce")], [modifier("fl"), noun("ounce")], [modifier("fluid"), noun("oz")], [modifier("fluid"), noun("ozs")]],
        shortForms: [[modifier("fl"), noun("oz")], [modifier("fl"), noun("ozs")]],
    },
    "imperial_tablespoon": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("table"), noun("spoon")]],
        shortForms: simpleForms(["tbsp", "tbsps"]),
    },
    "imperial_teaspoon": {
        quantity: "volume",

        disambiguators: {
            ...IMPERIAL_VOLUME_SYSTEM,
        },

        forms: [[modifier("tea"), noun("spoon")]],
        shortForms: simpleForms(["tsp", "tsps"]),
    },
    "barrel": {
        quantity: "volume",

        forms: simpleForms(["barrel"]),
        shortForms: simpleForms(["bl", "bbl"]),
    },
    "board_foot": {
        quantity: "volume",

        forms: [[modifier("board"), noun("foot")]],
        shortForms: [[modifier("bd"), noun("ft")]],
    },
    "cord": {
        quantity: "volume",

        forms: simpleForms(["cord"]),
        shortForms: simpleForms(["cord"]),
    },
    "bushel": {
        quantity: "volume",

        forms: simpleForms(["bushel"]),
        shortForms: simpleForms(["bu"]),
    },

    // plane angle
    "radian": {
        quantity: "angle",

        forms: simpleForms(["radian"]),
        shortForms: simpleForms(["rad"]),
    },
    "revolution": {
        quantity: "angle",

        forms: simpleForms(["revolution"]),
        shortForms: simpleForms(["rev", "revs"]),
    },
    "degree_of_arc": {
        quantity: "angle",

        forms: [[noun("degree")], [noun("degree"), modifier("of arc")]],
        shortForms: simpleForms(["°", "deg", "degs"]),
    },
    "arcminute": {
        quantity: "angle",

        forms: [[noun("minute"), modifier("of arc")]],
        shortForms: simpleForms(["MOA", "MoA", "moa", "'"]),
    },
    "arcsecond": {
        quantity: "angle",

        forms: [[noun("second"), modifier("of arc")]],
        shortForms: simpleForms(["\""]),
    },
    "grad": {
        quantity: "angle",

        forms: simpleForms(["grad"]),
        shortForms: simpleForms(["grad"]),
    },

    // solid angle
    "steradian": {
        quantity: "solid_angle",

        forms: simpleForms(["steradian"]),
        shortForms: simpleForms(["sr"]),
    },
    "spat": {
        quantity: "solid_angle",

        forms: simpleForms(["spat"]),
        shortForms: simpleForms(["spat"]),
    },

    // mass
    "gram": {
        quantity: "mass",

        forms: simpleForms(["gram", "gramme"]),
        shortForms: simpleForms(["g"]),
    },
    "carat": {
        quantity: "mass",

        forms: simpleForms(["carat"]),
        shortForms: simpleForms(["ct"]),
    },
    "metric_ton": {
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
    "ounce": {
        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    "pound": {
        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    "stone": {
        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["stone"]),
        shortForms: simpleForms(["st"]),
    },
    "short_ton": {
        quantity: "mass",

        disambiguators: {
            ...US_WEIGHT_SYSTEM,
            ...SHORT_TON_SYSTEM,
        },

        forms: simpleForms(["ton"]),
        shortForms: simpleForms(["tn"]),
    },
    "long_ton": {
        quantity: "mass",

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

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["grain"]),
        shortForms: simpleForms(["gr"]),
    },
    "pennyweight": {
        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pennyweight"]),
        shortForms: simpleForms(["dwt", "dwts", "pwt", "pwts"]),
    },
    "troy_ounce": {
        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["ounce"]),
        shortForms: simpleForms(["oz", "ozs"]),
    },
    "troy_pound": {
        quantity: "mass",

        disambiguators: {
            ...TROY_WEIGHT_SYSTEM,
        },

        forms: simpleForms(["pound"]),
        shortForms: simpleForms(["lb", "lbs"]),
    },
    "slug": {
        quantity: "mass",

        forms: simpleForms(["slug"]),
    },
    "atomic_mass_unit": {
        quantity: "mass",

        forms: [[modifier("atomic"), modifier("mass"), noun("unit")], [noun("dalton")]],
        shortForms: simpleForms(["u", "AMU", "amu", "Da"]),
    },

    // density
    "density_H2O": {
        quantity: "density",

        forms: [[noun("density"), modifier("of water")], [noun("density"), modifier("of h2o")], [noun("density"), modifier("of h20")]],
    },
    "density_Hg": {
        quantity: "density",

        forms: [[noun("density"), modifier("of mercury")], [noun("density"), modifier("of hg")]],
    },

    // time
    "second": {
        quantity: "time",

        forms: simpleForms(["second"]),
        shortForms: simpleForms(["s", "sec", "secs"]),
    },
    "minute": {
        quantity: "time",

        forms: simpleForms(["minute"]),
        shortForms: simpleForms(["min", "mins"]),
    },
    "hour": {
        quantity: "time",

        forms: simpleForms(["hour"]),
        shortForms: simpleForms(["h", "hr", "hrs"]),
    },
    "day": {
        quantity: "time",

        forms: simpleForms(["day"]),
        shortForms: simpleForms(["d"]),
    },
    "week": {
        quantity: "time",

        forms: simpleForms(["week"]),
        shortForms: simpleForms(["wk", "wks"]),
    },
    "fortnight": {
        quantity: "time",

        forms: simpleForms(["fortnight"]),
        shortForms: simpleForms(["fn"]),
    },
    "common_month": {
        quantity: "time",

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "common_year": {
        quantity: "time",

        disambiguators: {
            ...COMMON_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "leap_month": {
        quantity: "time",

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "leap_year": {
        quantity: "time",

        disambiguators: {
            ...LEAP_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "julian_month": {
        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "julian_year": {
        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "julian_decade": {
        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "julian_century": {
        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "julian_millennium": {
        quantity: "time",

        disambiguators: {
            ...JULIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "gregorian_month": {
        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "gregorian_year": {
        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "gregorian_decade": {
        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "gregorian_century": {
        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "gregorian_millennium": {
        quantity: "time",

        disambiguators: {
            ...GREGORIAN_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "mean_tropical_month": {
        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "mean_tropical_year": {
        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "mean_tropical_decade": {
        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "mean_tropical_century": {
        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "mean_tropical_millennium": {
        quantity: "time",

        disambiguators: {
            ...MEAN_TROPICAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "sidereal_month": {
        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "sidereal_year": {
        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "sidereal_decade": {
        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "sidereal_century": {
        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "sidereal_millennium": {
        quantity: "time",

        disambiguators: {
            ...SIDEREAL_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "synodic_month": {
        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MONTH_FORMS,
    },
    "synodic_year": {
        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...YEAR_FORMS,
    },
    "synodic_decade": {
        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...DECADE_FORMS,
    },
    "synodic_century": {
        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...CENTURY_FORMS,
    },
    "synodic_millennium": {
        quantity: "time",

        disambiguators: {
            ...SYNODIC_CALENDAR_SYSTEM,
        },

        ...MILLENNIUM_FORMS,
    },
    "short_month": {
        quantity: "time",

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

        forms: [[modifier("planck"), noun("time")]]
    },

    // frequency
    "hertz": {
        quantity: "frequency",

        forms: [[noun("hertz", { plurals: [] })]],
        shortForms: simpleForms(["Hz"]),
    },

    // speed or velocity
    "knot": {
        quantity: "speed",

        forms: simpleForms(["knot"]),
        shortForms: simpleForms(["kn"]),
    },
    "speed_of_light": {
        quantity: "speed",

        forms: [[noun("speed"), modifier("of light")]],
        shortForms: simpleForms(["c"]),
    },

    // acceleration
    "standard_gravity": {
        quantity: "acceleration",

        forms: [[modifier("standard"), noun("gravity", { plurals: ["gravities"] })]]
    },
    "gal_acceleration": {
        quantity: "acceleration",

        forms: simpleForms(["galileo"]),
        shortForms: simpleForms(["Gal"]),
    },

    // weight/force
    "newton": {
        quantity: "force",

        forms: simpleForms(["newton"]),
        shortForms: simpleForms(["N"]),
    },
    "dyne": {
        quantity: "force",

        forms: simpleForms(["dyne"]),
        shortForms: simpleForms(["dyn"]),
    },
    "poundal": {
        quantity: "force",

        forms: simpleForms(["poundal"]),
        shortForms: simpleForms(["pdl"]),
    },

    // pressure
    "atmosphere": {
        quantity: "pressure",

        forms: simpleForms(["atmosphere"]),
        shortForms: simpleForms(["atm"]),
    },
    "bar": {
        quantity: "pressure",

        forms: simpleForms(["bar"]),
        shortForms: simpleForms(["bar"]),
    },
    "barye": {
        quantity: "pressure",

        forms: simpleForms(["barye"]),
        shortForms: simpleForms(["barye"]),
    },
    "pascal": {
        quantity: "pressure",

        forms: simpleForms(["pascal"]),
        shortForms: simpleForms(["Pa"]),
    },
    "torr": {
        quantity: "pressure",

        forms: [[noun("torr", { plurals: [] })]],
        shortForms: simpleForms(["torr"]),
    },

    // energy
    "british_thermal_unit": {
        quantity: "energy",

        forms: [[modifier("british"), modifier("thermal"), noun("unit")]],
        shortForms: simpleForms(["BTU", "BTUs"]),
    },
    "calorie": {
        quantity: "energy",

        forms: simpleForms(["calorie"]),
        shortForms: simpleForms(["cal", "cals"]),
    },
    "joule": {
        quantity: "energy",

        forms: simpleForms(["joule"]),
        shortForms: simpleForms(["J"]),
    },
    "erg": {
        quantity: "energy",

        forms: simpleForms(["erg"]),
        shortForms: simpleForms(["erg"]),
    },
    "electronvolt": {
        quantity: "energy",

        forms: [[modifier("electron"), noun("volt")]],
        shortForms: simpleForms(["eV"]),
    },
    "therm": {
        quantity: "energy",

        forms: simpleForms(["therm"]),
        shortForms: simpleForms(["therm"]),
    },

    // power
    "watt": {
        quantity: "power",

        forms: simpleForms(["watt"]),
        shortForms: simpleForms(["W"]),
    },
    "horsepower": {
        quantity: "power",

        forms: [[noun("horse"), modifier("power")]],
        shortForms: simpleForms(["hp"]),
    },

    // electricity/magnetism
    "coulomb": {
        quantity: "electric_charge",

        forms: simpleForms(["coulomb"]),
        shortForms: simpleForms(["C"]),
    },
    "ampere": {
        quantity: "electric_current",

        forms: simpleForms(["ampere", "amp"]),
        shortForms: simpleForms(["A"]),
    },
    "volt": {
        quantity: "electric_potential",

        forms: simpleForms(["volt"]),
        shortForms: simpleForms(["V"]),
    },
    "ohm": {
        quantity: "electric_resistance",

        forms: simpleForms(["ohm"]),
        shortForms: simpleForms(["Ω"]),
    },
    "siemens": {
        quantity: "electric_conductance",

        forms: [[noun("siemens", { plurals: ["siemenses"] })]],
        shortForms: simpleForms(["S"]),
    },
    "farad": {
        quantity: "capacitance",

        forms: simpleForms(["farad"]),
        shortForms: simpleForms(["F"]),
    },
    "weber": {
        quantity: "magnetic_flux",

        forms: simpleForms(["weber"]),
        shortForms: simpleForms(["Wb"]),
    },
    "gauss": {
        quantity: "magnetic_flux_density",

        forms: [[noun("gauss", { plurals: ["gausses"] })]],
        shortForms: simpleForms(["G"]),
    },
    "tesla": {
        quantity: "magnetic_flux_density",

        forms: simpleForms(["tesla"]),
        shortForms: simpleForms(["T"]),
    },
    "henry": {
        quantity: "inductance",

        forms: [[noun("henry", { plurals: ["henries"] })]],
        shortForms: simpleForms(["H"]),
    },

    // temperature
    "degree_celsius": {
        quantity: "temperature",

        forms: [[noun("degree"), modifier("celsius")]],
        shortForms: simpleForms(["°C"]),
    },
    "degree_fahrenheit": {
        quantity: "temperature",

        forms: [[noun("degree"), modifier("fahrenheit")]],
        shortForms: simpleForms(["°F"]),
    },
    "degree_rankine": {
        quantity: "temperature",

        forms: [[noun("degree"), modifier("rankine")]],
        shortForms: simpleForms(["°R"]),
    },
    "kelvin": {
        quantity: "temperature",

        forms: [[noun("kelvin")], [noun("degree"), modifier("kelvin")]],
        shortForms: simpleForms(["K", "°K"]),
    },

    // information
    "natural_unit_of_information": {
        quantity: "information",

        forms: [[modifier("natural"), noun("unit"), modifier("of information")], [noun("nepit")], [noun("nit")]],
        shortForms: simpleForms(["nat"]),
    },
    "bit": {
        quantity: "information",

        forms: simpleForms(["bit", "shannon"]),
        shortForms: simpleForms(["b", "Sh"]),
    },
    "nibble": {
        quantity: "information",

        forms: simpleForms(["nibble"]),
    },
    "byte": {
        quantity: "information",

        forms: simpleForms(["byte"]),
        shortForms: simpleForms(["B"]),
    },

    // information rate
    "bit_per_second": {
        quantity: "information_rate",

        forms: [[noun("bit"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["bps"]),
    },
    "byte_per_second": {
        quantity: "information_rate",

        forms: [[noun("byte"), modifier("per"), modifier("second")]],
        shortForms: simpleForms(["Bps"]),
    },

    // luminous intensity
    "candela": {
        quantity: "luminous_intensity",

        forms: [[noun("candela")], [noun("candle"), modifier("power")]],
        shortForms: simpleForms(["cd"]),
    },

    // luminous flux
    "lumen": {
        quantity: "luminous_flux",

        forms: simpleForms(["lumen"]),
        shortForms: simpleForms(["lm"]),
    },

    // illuminance
    "lux": {
        quantity: "illuminance",

        forms: [[noun("lux", { plurals: ["luxes"] })]],
        shortForms: simpleForms(["lx"]),
    },
    "footcandle": {
        quantity: "illuminance",

        forms: [[modifier("foot"), noun("candle")]],
        shortForms: simpleForms(["fc"]),
    },

    // radiation and doses
    "becquerel": {
        quantity: "radiation_source_activity",

        forms: simpleForms(["becquerel"]),
        shortForms: simpleForms(["Bq"]),
    },
    "curie": {
        quantity: "radiation_source_activity",

        forms: simpleForms(["curie"]),
        shortForms: simpleForms(["Ci"]),
    },
    "rutherford": {
        quantity: "radiation_source_activity",

        forms: simpleForms(["rutherford"]),
        shortForms: simpleForms(["Rd"]),
    },
    "roentgen": {
        quantity: "radiation_exposure",

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

        forms: simpleForms(["gray"]),
        shortForms: simpleForms(["Gy"]),
    },
    "roentgen_equivalent_man": {
        quantity: "radiation_equivalent_dose",

        forms: [[noun("roentgen", {
            accents: [
                { index: 1, unicode: "ö" },
                { index: 2, unicode: "" },
            ]
        }), modifier("equivalent"), modifier("man")]],
        shortForms: simpleForms(["rem"]),
    },
    "sievert": {
        quantity: "radiation_equivalent_dose",

        forms: simpleForms(["sievert"]),
        shortForms: simpleForms(["Sv"]),
    },

    // amount of substance
    "mole": {
        quantity: "amount_of_substance",

        forms: simpleForms(["mole"]),
        shortForms: simpleForms(["mol"]),
    },

    // proportion
    "percent": {
        quantity: "proportion",

        forms: simpleForms(["percent"]),
        shortForms: simpleForms(["pct", "%"]),
    },
    "part_per_thousand": {
        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("thousand")]],
    },
    "part_per_million": {
        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("million")]],
        shortForms: simpleForms(["ppm"]),
    },
    "part_per_billion": {
        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("billion")]],
        shortForms: simpleForms(["ppb"]),
    },
    "part_per_trillion": {
        quantity: "proportion",

        forms: [[noun("part"), modifier("per"), modifier("trillion")]],
        shortForms: simpleForms(["ppt"]),
    },
    "part_per_quadrillion": {
        quantity: "proportion",

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