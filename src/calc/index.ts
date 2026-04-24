import { AST } from "./ast";
import { CalcError, ErrType } from "./err";
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

const SCROLL_GRACE_PIXELS = 12;

export class CalcModule {
    private logDiv: HTMLDivElement;
    private stdInput: HTMLTextAreaElement;
    private fpInput: HTMLTextAreaElement;

    private historyIdx: number | null = null;
    private history: { code: string, ast: AST | null, output: Value | null, logRow: HTMLDivElement }[] = [];

    private placeholder: string;

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

        this.placeholder = this.stdInput.placeholder;

        this.stdInput.addEventListener("input", () => {
            this.stdInput.parentElement!.dataset.copy = this.stdInput.value;
        });

        this.stdInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                const input = this.stdInput.value.normalize("NFC").trim();

                try {
                    this.runStd(input, this.historyIdx);

                    this.stdInput.value = "";
                    this.stdInput.parentElement!.dataset.copy = this.stdInput.value;

                    this.historyIdx = null;
                    this.stdInput.placeholder = this.placeholder;
                } finally {
                    event.preventDefault();
                }
            } else if (event.code == "ArrowUp" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                let pD = true;

                if (this.historyIdx === null && this.stdInput.value.normalize("NFC").trim() == "" && this.history.length > 0) {
                    this.historyIdx = this.history.length - 1;
                    this.stdInput.value = this.history[this.historyIdx].code;
                    this.stdInput.placeholder = "";
                } else if (this.historyIdx !== null && this.historyIdx !== 0) {
                    this.historyIdx -= 1;
                    this.stdInput.value = this.history[this.historyIdx].code;
                } else {
                    pD = false;
                }

                if (pD) event.preventDefault();
            } else if (event.code == "ArrowDown" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                let pD = true;

                if (this.historyIdx !== null && this.historyIdx === this.history.length - 1) {
                    this.historyIdx = null;
                    this.stdInput.value = "";
                    this.stdInput.placeholder = this.placeholder;
                } else if (this.historyIdx !== null) {
                    this.historyIdx += 1;
                    this.stdInput.value = this.history[this.historyIdx].code;
                } else {
                    pD = false;
                }

                if (pD) event.preventDefault();
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
                span.textContent = String(num.int).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
                break;
            }
            case "rational": {
                if (num.d == 1n) {
                    span.textContent = String(num.n);
                } else {
                    span.textContent = String(num.n).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&") + " / " + String(num.d).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
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

                scaleSpan.textContent = String(scale.int).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
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

                            scaleSpan.textContent = String(scale.n).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
                            joiningSpace = true;
                        }
                    } else {
                        scaleSpan.textContent = String(scale.n).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
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

                    scaleSpan.textContent = String(scale.n).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&") + " / " + String(scale.d).replace(/(?<=.)...(?=(?:...)*$)/g, "_$&");
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

    private runStd(input: string, historyIdx: number | null) {
        let ast: AST | null = null;
        let output: { success: true, output: Value } | { success: false, errType: ErrType };
        try {
            ast = parseStd(input, this.systemSettings);

            const inputs = this.history.slice(0, historyIdx ?? this.history.length).map(({ output }) => output);

            output = {
                success: true,
                output: runCalc(
                    ast,
                    inputs.filter((input) => input !== null).reverse(),
                    inputs,
                ),
            };
        } catch (err) {
            if (err instanceof CalcError) {
                output = {
                    success: false,
                    errType: err.getType(),
                };
            } else {
                throw err;
            }
        }

        console.log(output);

        const shouldScroll = this.logDiv.scrollTop >= this.logDiv.scrollHeight - this.logDiv.offsetHeight - SCROLL_GRACE_PIXELS;

        const insertHistoryRow = historyIdx === null;

        let historyRow: typeof this.history[number];
        if (historyIdx === null) {
            historyRow = {
                code: input,
                ast: ast,
                output: output.success ? output.output : null,
                logRow: document.createElement("div"),
            };
        } else {
            historyRow = this.history[historyIdx];

            historyRow.code = input;
            historyRow.ast = ast;
            historyRow.output = output.success ? output.output : null;
            
            while (historyRow.logRow.firstChild !== null) {
                historyRow.logRow.removeChild(historyRow.logRow.firstChild);
            }

            for (const class_ of historyRow.logRow.classList) {
                historyRow.logRow.classList.remove(class_);
            }
        }

        const logId = document.createElement("div");
        logId.classList.add("calc_id");
        logId.textContent = "." + (historyIdx ?? this.history.length) + ":";
        historyRow.logRow.append(logId);

        const logCode = document.createElement("div");
        logCode.classList.add("calc_code");
        logCode.textContent = input;
        historyRow.logRow.appendChild(logCode);

        if (output.success) {
            const logOutput = document.createElement("div");
            logOutput.classList.add("calc_output");
            logOutput.appendChild(this.formatOutput(output.output.num));
            if (output.output.unit !== null) {
                const fmt = this.formatUnit(output.output.unit);

                if (fmt !== null) {
                    logOutput.appendChild(document.createTextNode(" ["));
                    logOutput.appendChild(fmt);
                    logOutput.appendChild(document.createTextNode("]"));
                }
            }

            historyRow.logRow.appendChild(logOutput);
        } else {
            historyRow.logRow.classList.add("calc_err");

            const logOutput = document.createElement("div");
            logOutput.classList.add("calc_output");
            logOutput.textContent = output.errType.toUpperCase();
            historyRow.logRow.appendChild(logOutput);
        }

        if (insertHistoryRow) {
            this.logDiv.appendChild(historyRow.logRow);
            this.history.push(historyRow);
        }

        if (shouldScroll) {
            this.logDiv.scrollTo(0, this.logDiv.scrollHeight);
        }

        if (!insertHistoryRow && historyIdx < this.history.length - 1) {
            this.runStd(this.history[historyIdx + 1].code, historyIdx + 1);
        }
    }
}