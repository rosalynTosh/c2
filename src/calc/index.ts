import { runCalc } from "./run_calc";
import { parseStd } from "./std_parsing";
import { parseUnit } from "./units/unit_parsing";
import { CalendarSystem } from "./units/unit_props";

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
                const input = this.stdInput.value;

                const ast = parseStd(input, this.systemSettings);
                const output = runCalc(ast, []);

                console.log(output);

                this.stdInput.value = "";
                this.stdInput.parentElement!.dataset.copy = this.stdInput.value;

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
}