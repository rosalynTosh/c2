const log = document.getElementById("calc_log") as HTMLDivElement;
const input_std = document.getElementById("calc_input_std") as HTMLTextAreaElement;
const input_fp = document.getElementById("calc_input_fp") as HTMLTextAreaElement;

function run_calc(ast: unknown) {}

function parse_std(input: string) {
    var toks = (input.match(/(?:[0-9]+\.)?[0-9]+|[a-zA-Z]+|\*+|\s+|./g) || []).filter(t => !t.match(/^\s+$/));

    console.log(toks);
}

function parse_fp(input: string) {
    
}

export function init() {
    input_std.addEventListener("input", () => {
        parse_std(input_std.value);
    });
}