import { UNIT_PROPS, UnitProps, UnitWordProps } from "./unit_props";

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

    return wordProps.type == "modifier" && wordProps.isOf ? forms.flatMap((form) => [[form], ["of", form]]) : forms.map((form) => [form]);
}

function splitFormLowercases(splitForms: string[][][]): { splitForm: string[][], lowercases: number }[] {
    let combSplitForms: { splitForm: string[][], lowercases: number }[] = [];

    for (const splitForm of splitForms) {
        const splitFormLowercasesLists = [];

        for (const wordGrp of splitForm) {
            const wordLowercasesGrps = [];

            for (const word of wordGrp) {
                const wordChars = [...word];

                const uppercaseIndices = [...wordChars.keys()].filter((i) => wordChars[i] != wordChars[i].toLowerCase());

                const wordLowercases = [];

                for (const comb of combinations(uppercaseIndices)) {
                    wordLowercases.push({ word: wordChars.map((c, i) => comb.includes(i) ? c.toLowerCase() : c).join(""), lowercases: comb.length });
                }

                wordLowercasesGrps.push(wordLowercases);
            }

            const wordGrpLowercases = cartProd(wordLowercasesGrps).map((wordLowercases) => ({
                wordGrp: wordLowercases.map((wordLowercase) => wordLowercase.word),
                lowercases: wordLowercases.reduce((lowercases, wordLowercase) => lowercases + wordLowercase.lowercases, 0)
            }));

            splitFormLowercasesLists.push(wordGrpLowercases);
        }

        const splitFormLowercases = cartProd(splitFormLowercasesLists).map((wordGrpLowercases) => ({
            splitForm: wordGrpLowercases.map((wordLowercase) => wordLowercase.wordGrp),
            lowercases: wordGrpLowercases.reduce((lowercases, wordGrpLowercase) => lowercases + wordGrpLowercase.lowercases, 0)
        }));

        combSplitForms = combSplitForms.concat(splitFormLowercases);
    }

    return combSplitForms;
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

        combSplitForms = combSplitForms.concat(splitFormLowercases(splitForms));
    }

    for (const disambiguatorId in unitProps.disambiguators) {
        const { systemForms, shortSystemForms } = unitProps.disambiguators[disambiguatorId as keyof typeof unitProps.disambiguators]!;

        let modifiedCombSplitForms: typeof combSplitForms = [];

        for (const formProps of systemForms) {
            const opts = formProps.map((word) => buildWordForms(word, false));
            const systemSplitForms = cartProd(opts);

            modifiedCombSplitForms = modifiedCombSplitForms.concat(combSplitForms.flatMap(({ splitForm, lowercases }) => systemSplitForms.map((sSF) => ({ splitForm: splitForm.concat(sSF), lowercases }))));
        }

        for (const shortFormProps of shortSystemForms ?? []) {
            const opts = shortFormProps.map((word) => buildWordForms(word, true));
            const systemSplitForms = cartProd(opts);
            const systemLowercaseSplitForms = splitFormLowercases(systemSplitForms);

            modifiedCombSplitForms = modifiedCombSplitForms.concat(combSplitForms.flatMap(({ splitForm, lowercases }) => systemLowercaseSplitForms.map((({ splitForm: sLSF, lowercases: sLs }) => ({
                splitForm: splitForm.concat(sLSF),
                lowercases: lowercases + sLs
            })))));
        }

        combSplitForms = combSplitForms.concat(modifiedCombSplitForms);
    }

    // 3/1. words can be in any order

    const outOfOrderSplitForms = combSplitForms.flatMap(({ splitForm, lowercases }) => orderings(splitForm).flatMap((ord) => ({ splitForm: ord.flat(), lowercases })));

    // 4/2. any combination of underscores can be removed

    const splicedForms = outOfOrderSplitForms.map(({ splitForm, lowercases }) => ({ splitForm: splitForm.length == 0 ? [] : [splitForm[0], ...splitForm.slice(1).flatMap((word) => ["_", word])], lowercases }));
    const withoutUnderscoreForms = splicedForms.flatMap(({ splitForm, lowercases }) => combinationsWithout(splitForm, "_").map((comb): [string, { lowercases: number }] => [comb.join(""), { lowercases }]));

    const forms: Map<string, { lowercases: number }> = new Map();

    for (const [form, { lowercases }] of withoutUnderscoreForms) {
        const curr = forms.get(form);

        if (curr === undefined) {
            forms.set(form, { lowercases });
        } else {
            curr.lowercases = Math.min(curr.lowercases, lowercases);
        }
    }

    for (const form of unitProps.rawShortForms ?? []) {
        const curr = forms.get(form);

        if (curr === undefined) {
            forms.set(form, { lowercases: 0 });
        } else {
            curr.lowercases = 0;
        }
    }

    return forms;
}

export function buildUnitReference(): Map<string, { unitId: string, lowercases: number }[]> {
    const ref: Map<string, { unitId: string, lowercases: number }[]> = new Map();

    for (const unitId in UNIT_PROPS) {
        const unitProps = UNIT_PROPS[unitId];

        for (const [form, { lowercases }] of buildForms(unitProps)) {
            const found = ref.get(form);

            if (found === undefined) {
                ref.set(form, [{ unitId, lowercases }]);
            } else {
                found.push({ unitId, lowercases });
            }
        }
    }

    return ref;
}

export const ref = buildUnitReference();

console.log(ref);