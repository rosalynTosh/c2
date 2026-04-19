





// const UNARY_OPS = [
//     "sqrt"
// ] as const;

// const UNITS = [
//     "pm",
//     "nm",
//     "\xb5m",
//     "mm",
//     "cm",
//     "m",
//     "km",

//     "mil",
//     "in",
//     "ft",
//     "yd",
//     "mi",

//     "\xb0C",
//     "\xb0F",
//     "K",

//     "ha",
//     "ac",

//     "pl",
//     "nl",
//     "ml",
//     "cl",
//     "dl",
//     "l",

//     "oz",
//     "cup",
//     "pi",
//     "qt",
//     "gal",

//     "s",
//     "min",
//     "h",
//     "hr",

//     ""
// ] as const;

// function buildUnitTable(): Map<string, Unit> {

//     // binary prefixes

    

//     const UNITS_LONG_PLURALS = {} as const satisfies { [alias: string]: string };
//     const UNITS_LONG_ALIASES = {
//         "thou": "mil",
//         "metre": "meter",
//         "litre": "liter",
//         "shannon": "bit" // Sh
//     } as const satisfies { [alias: string]: string };
//     const UNITS_LONG_ALIAS_PLURALS = {} as const satisfies { [alias: string]: string };

//     const UNITS_LONG_SPECIAL = {
//         "fermi": {},
//         "angstrom": {},
//         "\xe5ngstrom": {},
//         "angstr\xf6m": {},
//         "myriameter": {},
//         "xu": {},
//         "pi\xe8ze",
//     } as const satisfies { [name: string]: Unit };

//     // square/sq
//     // cubic
//     // light/l
//     // displacement
//     // MOA
//     // of mercurcy (length to pressure)
//     // of water (length to pressure)
//     // interconversion between units of mass and weight/force
//     // fucked up oilfield units
//     // circular [length]: area (multiply by pi/4), abbr circ_
//     // x unit
//     // mAh, Ns, Nm, other well-known product units
// }

