import { Num } from "./numbers";
import { runCalc, Value } from "./run_calc";
import { parseStd } from "./std_parsing";
import { INT_SCALE_MODS_SHORT, INV_INT_SCALE_MODS_SHORT } from "./units/scale_mods";
import { Unit } from "./units/unit";
import { parseUnit } from "./units/unit_parsing";
import { CalendarSystem, UNIT_PROPS } from "./units/unit_props";

export interface SystemSettings {
    distance: "us_land" | "us_survey" | "nautical";
    ptStandsFor: "point" | "pint";
    volume: "us" | "imperial";
    weight: "troy" | "us";
    ton: "si" | "short" | "long";
    calendar: CalendarSystem;
}

export class CalcModule {
    private logDiv: HTMLDivElement;
    private stdInput: HTMLTextAreaElement;
    private fpInput: HTMLTextAreaElement;

    private history: Value[] = [];

    private systemSettings: SystemSettings = {
        distance: "us_land",
        ptStandsFor: "pint",
        volume: "us",
        weight: "us",
        ton: "short",
        calendar: "gregorian",
    };

    constructor() {
        this.logDiv = document.getElementById("calc_log") as HTMLDivElement;
        this.stdInput = document.getElementById("calc_input_std") as HTMLTextAreaElement;
        this.fpInput = document.getElementById("calc_input_fp") as HTMLTextAreaElement;

        this.stdInput.addEventListener("input", () => {
            this.stdInput.parentElement!.dataset.copy = this.stdInput.value;
        });

        this.stdInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                const input = this.stdInput.value.normalize("NFC").trim();

                this.runStd(input);

                event.preventDefault();
            }
        });

        this.fpInput.addEventListener("input", () => {
            this.fpInput.parentElement!.dataset.copy = this.fpInput.value;
        });

        this.fpInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                const input = this.fpInput.value;

                // this.parseFp(input);

                console.log(parseUnit(input));

                this.fpInput.value = "";
                this.fpInput.parentElement!.dataset.copy = this.fpInput.value;

                event.preventDefault();
            }
        });
    }

    private formatOutput(num: Num): Node {
        const span = document.createElement("span");

        switch (num.type) {
            case "int": {
                span.textContent = String(num.int);
                break;
            }
            case "rational": {
                if (num.d == 1n) {
                    span.textContent = String(num.n);
                } else {
                    span.textContent = num.n + " / " + num.d;
                }
                break;
            }
            case "float": {
                span.textContent = String(num.num);
                break;
            }
            default: {
                num satisfies never;
            }
        }

        return span;
    }

    private formatUnit(unit: Unit): Node | null {
        const span = document.createElement("span");

        const scale = unit.scale;
        const scaleSpan = document.createElement("span");
        let joiningSpace: boolean;
        switch (scale.type) {
            case "int": {
                if (scale.int == 1n) {
                    joiningSpace = false;
                    break;
                }

                if (unit.baseUnits.length != 0) {
                    const shortMod = INT_SCALE_MODS_SHORT[String(scale.int)];

                    if (shortMod !== undefined) {
                        scaleSpan.textContent = shortMod;
                        joiningSpace = false;

                        span.appendChild(scaleSpan);

                        break;
                    }
                }

                scaleSpan.textContent = String(scale.int);
                joiningSpace = true;

                span.appendChild(scaleSpan);

                break;
            }
            case "rational": {
                if (scale.d == 1n) {
                    if (scale.n == 1n) {
                        joiningSpace = false;
                        break;
                    }

                    if (unit.baseUnits.length != 0) {
                        if (scale.n == -1n) {
                            scaleSpan.textContent = "-";
                            joiningSpace = false;
                        } else {
                            const shortMod = INT_SCALE_MODS_SHORT[String(scale.n < 0n ? -scale.n : scale.n)];

                            if (shortMod !== undefined) {
                                scaleSpan.textContent = (scale.n < 0n ? "-" : "") + shortMod;
                                joiningSpace = false;

                                span.appendChild(scaleSpan);

                                break;
                            }

                            scaleSpan.textContent = String(scale.n);
                            joiningSpace = true;
                        }
                    } else {
                        scaleSpan.textContent = String(scale.n);
                        joiningSpace = true;
                    }
                } else {
                    if (unit.baseUnits.length != 0 && (scale.n == 1n || scale.n == -1n)) {
                        const invShortMod = INV_INT_SCALE_MODS_SHORT[String(scale.d)];

                        if (invShortMod !== undefined) {
                            scaleSpan.textContent = (scale.n < 0n ? "-" : "") + invShortMod;
                            joiningSpace = false;

                            span.appendChild(scaleSpan);

                            break;
                        }
                    }

                    scaleSpan.textContent = scale.n + " / " + scale.d;
                    joiningSpace = true;
                }

                span.appendChild(scaleSpan);

                break;
            }
            case "float": {
                scaleSpan.textContent = String(scale.num);
                joiningSpace = true;

                span.appendChild(scaleSpan);

                break;
            }
        }

        for (const baseUnit of unit.baseUnits) {
            if (joiningSpace) span.appendChild(document.createTextNode(" "));

            const props = UNIT_PROPS[baseUnit.unitId];

            // TODO: add disambiguators
            const canonForm = [
                ...(props.forms ?? []).map((f) => f.map((w) => w.word).join("_")),
                baseUnit.unitId
            ][0];
            const shortCanonForm = [
                ...props.rawShortForms ?? [],
                ...(props.shortForms ?? []).map((sF) => sF.map((w) => w.word).join("_")),
                canonForm
            ][0];

            const canonFormAbbr = document.createElement("abbr");
            canonFormAbbr.textContent = shortCanonForm;
            canonFormAbbr.title = canonForm;
            span.appendChild(canonFormAbbr);

            if (baseUnit.pow != 1n) {
                const sup = document.createElement("sup");
                sup.textContent = String(baseUnit.pow);
                span.appendChild(sup);
            }

            joiningSpace = true;
        }

        return span.childNodes.length == 0 ? null : span;
    }

    private runStd(input: string) {
        const ast = parseStd(input, this.systemSettings);
        const output = runCalc(ast, [...this.history]);

        const logRow = document.createElement("div");

        const logCode = document.createElement("div");
        logCode.textContent = input;
        logRow.appendChild(logCode);

        const logOutput = document.createElement("div");
        logOutput.appendChild(this.formatOutput(output.num));
        if (output.unit !== null) {
            const fmt = this.formatUnit(output.unit);

            if (fmt !== null) {
                logOutput.appendChild(document.createTextNode(" ["));
                logOutput.appendChild(fmt);
                logOutput.appendChild(document.createTextNode("]"));
            }
        }

        logRow.appendChild(logOutput);

        this.logDiv.appendChild(logRow);

        this.history.unshift(output);

        console.log(output);

        this.stdInput.value = "";
        this.stdInput.parentElement!.dataset.copy = this.stdInput.value;
    }
}