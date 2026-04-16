export class CalcModule {
    private logDiv: HTMLDivElement;
    private stdInput: HTMLTextAreaElement;
    private fpInput: HTMLTextAreaElement;
    
    constructor() {
        this.logDiv = document.getElementById("calc_log") as HTMLDivElement;
        this.stdInput = document.getElementById("calc_input_std") as HTMLTextAreaElement;
        this.fpInput = document.getElementById("calc_input_fp") as HTMLTextAreaElement;

        this.stdInput.addEventListener("input", () => {
            this.parseStd(this.stdInput.value);
        });

        this.fpInput.addEventListener("input", () => {
            this.parseFp(this.fpInput.value);
        });
    }

    private runCalc(ast: unknown) {}

    private parseStd(input: string) {
        const toks = (input.match(/(?:[0-9]+\.)?[0-9]+|[a-zA-Z]+|\*+|\s+|./g) ?? []).filter(t => !t.match(/^\s+$/));

        console.log(toks);
    }

    private parseFp(input: string) {

    }
}