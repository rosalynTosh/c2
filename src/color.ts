const color = document.getElementById("color") as HTMLDivElement;

const color_show = document.getElementById("color_show") as HTMLDivElement;

const color_disp_comp_p = document.getElementById("color_disp_comp_p") as HTMLSpanElement;
const color_disp_comp_r = document.getElementById("color_disp_comp_r") as HTMLSpanElement;
const color_disp_rgb = document.getElementById("color_disp_rgb") as HTMLDivElement;
const color_disp_hsl = document.getElementById("color_disp_hsl") as HTMLDivElement;
const color_disp_ycbcr = document.getElementById("color_disp_ycbcr") as HTMLDivElement;

const css = document.getElementById("color_css") as HTMLInputElement;

const comp = document.getElementById("color_comp") as HTMLInputElement;

const rgb_r = document.getElementById("color_rgb_r") as HTMLInputElement;
const rgb_g = document.getElementById("color_rgb_g") as HTMLInputElement;
const rgb_b = document.getElementById("color_rgb_b") as HTMLInputElement;

const hsl_h = document.getElementById("color_hsl_h") as HTMLInputElement;
const hsl_s = document.getElementById("color_hsl_s") as HTMLInputElement;
const hsl_l = document.getElementById("color_hsl_l") as HTMLInputElement;

const ycbcr_y = document.getElementById("color_ycbcr_y") as HTMLInputElement;
const ycbcr_cb = document.getElementById("color_ycbcr_cb") as HTMLInputElement;
const ycbcr_cr = document.getElementById("color_ycbcr_cr") as HTMLInputElement;

const mod_color_show = document.getElementById("color_mod_show") as HTMLDivElement;

const color_mod_disp_comp_p = document.getElementById("color_mod_disp_comp_p") as HTMLSpanElement;
const color_mod_disp_comp_r = document.getElementById("color_mod_disp_comp_r") as HTMLSpanElement;
const color_mod_disp_rgb = document.getElementById("color_mod_disp_rgb") as HTMLDivElement;
const color_mod_disp_hsl = document.getElementById("color_mod_disp_hsl") as HTMLDivElement;
const color_mod_disp_ycbcr = document.getElementById("color_mod_disp_ycbcr") as HTMLDivElement;

const mod_b = document.getElementById("color_mod_b") as HTMLInputElement;

let d_color: [number, number, number] | null = null;
let d_mod_b: number | null = null;

function rgb_to_ycbcr(r: number, g: number, b: number): [number, number, number] {
    var y = 0.299 * r + 0.587 * g + 0.114 * b;
    var cb = -0.169 * r + -0.331 * g + 0.500 * b + 128;
    var cr = 0.500 * r + -0.419 * g + -0.081 * b + 128;

    return [y, cb, cr];
}

function ycbcr_to_rgb(y: number, cb: number, cr: number): [number, number, number] {
    var r = y + 1.403 * (cr - 128);
    var g = y + -0.344 * (cb - 128) + -0.714 * (cr - 128);
    var b = y + 1.773 * (cb - 128);

    r = Math.min(Math.max(r, 0), 255);
    g = Math.min(Math.max(g, 0), 255);
    b = Math.min(Math.max(b, 0), 255);

    return [r, g, b];
}

function rgb_to_hsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b)
    var min = Math.min(r, g, b);

    var h = 0;
    var s = 0;
    var l = (max + min) / 2;

    if (max != min) {
        var d = max - min;

        s = l > 1 / 2 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);

                break;
            case g:
                h = (b - r) / d + 2;

                break;
            case b:
                h = (r - g) / d + 4;

                break;
        }

        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function hsl_to_rgb(h: number, s: number, l: number): [number, number, number] {
    h = (h % 360 + 360) % 360;
    
    h /= 360;
    s /= 100;
    l /= 100;

    var r = l;
    var g = l;
    var b = l;

    if(s != 0) {
        function color_to_rgb(p: number, q: number, t: number): number {
            if (t < 0)
                t++;

            if (t > 1)
                t--;

            if (t < 1 / 6)
                return p + (q - p) * 6 * t;

            if (t < 1 / 2)
                return q;

            if (t < 2 / 3)
                return p + (q - p) * (2/3 - t) * 6;

            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;

        var p = 2 * l - q;

        r = color_to_rgb(p, q, h + 1 / 3);
        g = color_to_rgb(p, q, h);
        b = color_to_rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

function round(n: number): number {
    return Math.round(n * 1000) / 1000;
}

function onCompInput() {
    color_show.classList.remove("bgcolor");
    color_show.style.backgroundColor = "";

    color_disp_comp_p.textContent = "#000000";
    color_disp_comp_r.textContent = "000000";
    color_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_disp_hsl.textContent = "rgb(0, 0%, 0%)";
    color_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    mod_color_show.classList.remove("bgcolor");
    mod_color_show.style.backgroundColor = "";

    color_mod_disp_comp_p.textContent = "#000000";
    color_mod_disp_comp_r.textContent = "000000";
    color_mod_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_mod_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    for (const input of [rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l, ycbcr_y, ycbcr_cb, ycbcr_cr]) {
        input.value = "";
    }

    if (!comp.value.match(/^[0-9a-f]{6}$/i)) return;

    color_show.classList.add("bgcolor");
    color_show.style.backgroundColor = "#" + comp.value;

    const rgb = comp.value.match(/../g)!.map(x => window.parseInt(x, 16)) as [number, number, number];

    d_color = [...rgb];

    rgb_r.value = rgb[0].toString();
    rgb_g.value = rgb[1].toString();
    rgb_b.value = rgb[2].toString();

    var hsl = rgb_to_hsl(...rgb);

    hsl_h.value = round(hsl[0]).toString();
    hsl_s.value = round(hsl[1]).toString();
    hsl_l.value = round(hsl[2]).toString();

    var ycbcr = rgb_to_ycbcr(...rgb);

    ycbcr_y.value = round(ycbcr[0]).toString();
    ycbcr_cb.value = round(ycbcr[1]).toString();
    ycbcr_cr.value = round(ycbcr[2]).toString();

    color_disp_comp_p.textContent = "#" + Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_comp_r.textContent = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_rgb.textContent = "rgb(" + round(rgb[0]) + ", " + round(rgb[1]) + ", " + round(rgb[2]) + ")";
    color_disp_hsl.textContent = "hsl(" + round(hsl[0]) + ", " + round(hsl[1]) + "%, " + round(hsl[2]) + "%)";
    color_disp_ycbcr.textContent = "ycbcr(" + round(ycbcr[0]) + ", " + round(ycbcr[1]) + ", " + round(ycbcr[2]) + ")";

    onModBInput();
}

comp.addEventListener("input", onCompInput);

function onRgbInput() {
    color_show.classList.remove("bgcolor");
    color_show.style.backgroundColor = "";

    color_disp_comp_p.textContent = "#000000";
    color_disp_comp_r.textContent = "000000";
    color_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_disp_hsl.textContent = "rgb(0, 0%, 0%)";
    color_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    mod_color_show.classList.remove("bgcolor");
    mod_color_show.style.backgroundColor = "";

    color_mod_disp_comp_p.textContent = "#000000";
    color_mod_disp_comp_r.textContent = "000000";
    color_mod_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_mod_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    d_color = null;

    for (var input of [comp, hsl_h, hsl_s, hsl_l, ycbcr_y, ycbcr_cb, ycbcr_cr]) {
        input.value = "";
    }

    if (!rgb_r.value || Number.isNaN(Number(rgb_r.value)) || Number(rgb_r.value) < 0 || Number(rgb_r.value) > 255) return;
    if (!rgb_g.value || Number.isNaN(Number(rgb_g.value)) || Number(rgb_g.value) < 0 || Number(rgb_g.value) > 255) return;
    if (!rgb_b.value || Number.isNaN(Number(rgb_b.value)) || Number(rgb_b.value) < 0 || Number(rgb_b.value) > 255) return;

    color_show.classList.add("bgcolor");
    color_show.style.backgroundColor = "rgb(" + rgb_r.value + ", " + rgb_g.value + ", " + rgb_b.value + ")";

    const rgb = [Number(rgb_r.value), Number(rgb_g.value), Number(rgb_b.value)] as const;

    d_color = [...rgb];

    comp.value = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");

    var hsl = rgb_to_hsl(...rgb);

    hsl_h.value = round(hsl[0]).toString();
    hsl_s.value = round(hsl[1]).toString();
    hsl_l.value = round(hsl[2]).toString();

    var ycbcr = rgb_to_ycbcr(...rgb);

    ycbcr_y.value = round(ycbcr[0]).toString();
    ycbcr_cb.value = round(ycbcr[1]).toString();
    ycbcr_cr.value = round(ycbcr[2]).toString();

    color_disp_comp_p.textContent = "#" + Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_comp_r.textContent = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_rgb.textContent = "rgb(" + round(rgb[0]) + ", " + round(rgb[1]) + ", " + round(rgb[2]) + ")";
    color_disp_hsl.textContent = "hsl(" + round(hsl[0]) + ", " + round(hsl[1]) + "%, " + round(hsl[2]) + "%)";
    color_disp_ycbcr.textContent = "ycbcr(" + round(ycbcr[0]) + ", " + round(ycbcr[1]) + ", " + round(ycbcr[2]) + ")";

    onModBInput();
}

function onHslInput() {
    color_show.classList.remove("bgcolor");
    color_show.style.backgroundColor = "";

    color_disp_comp_p.textContent = "#000000";
    color_disp_comp_r.textContent = "000000";
    color_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    mod_color_show.classList.remove("bgcolor");
    mod_color_show.style.backgroundColor = "";

    color_mod_disp_comp_p.textContent = "#000000";
    color_mod_disp_comp_r.textContent = "000000";
    color_mod_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_mod_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    d_color = null;

    for (var input of [comp, rgb_r, rgb_g, rgb_b, ycbcr_y, ycbcr_cb, ycbcr_cr])
        input.value = "";

    if (!hsl_h.value || Number.isNaN(Number(hsl_h.value))) return;
    if (!hsl_s.value || Number.isNaN(Number(hsl_s.value)) || Number(hsl_s.value) < 0 || Number(hsl_s.value) > 100) return;
    if (!hsl_l.value || Number.isNaN(Number(hsl_l.value)) || Number(hsl_l.value) < 0 || Number(hsl_l.value) > 100) return;

    color_show.classList.add("bgcolor");
    color_show.style.backgroundColor = "hsl(" + hsl_h.value + ", " + hsl_s.value + "%, " + hsl_l.value + "%)";

    const hsl = [Number(hsl_h.value), Number(hsl_s.value), Number(hsl_l.value)] as const;

    var rgb = hsl_to_rgb(...hsl);

    d_color = [...rgb];

    comp.value = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");

    rgb_r.value = round(rgb[0]).toString();
    rgb_g.value = round(rgb[1]).toString();
    rgb_b.value = round(rgb[2]).toString();

    var ycbcr = rgb_to_ycbcr(...rgb);

    ycbcr_y.value = round(ycbcr[0]).toString();
    ycbcr_cb.value = round(ycbcr[1]).toString();
    ycbcr_cr.value = round(ycbcr[2]).toString();

    color_disp_comp_p.textContent = "#" + Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_comp_r.textContent = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_rgb.textContent = "rgb(" + round(rgb[0]) + ", " + round(rgb[1]) + ", " + round(rgb[2]) + ")";
    color_disp_hsl.textContent = "hsl(" + round(hsl[0] % 360) + ", " + round(hsl[1]) + "%, " + round(hsl[2]) + "%)";
    color_disp_ycbcr.textContent = "ycbcr(" + round(ycbcr[0]) + ", " + round(ycbcr[1]) + ", " + round(ycbcr[2]) + ")";

    onModBInput();
}

function onYcbcrInput() {
    color_show.classList.remove("bgcolor");
    color_show.style.backgroundColor = "";

    color_disp_comp_p.textContent = "#000000";
    color_disp_comp_r.textContent = "000000";
    color_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    mod_color_show.classList.remove("bgcolor");
    mod_color_show.style.backgroundColor = "";

    color_mod_disp_comp_p.textContent = "#000000";
    color_mod_disp_comp_r.textContent = "000000";
    color_mod_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_mod_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    d_color = null;

    for (var input of [comp, rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l])
        input.value = "";

    if (!ycbcr_y.value || Number.isNaN(Number(ycbcr_y.value)) || Number(ycbcr_y.value) < 0 || Number(ycbcr_y.value) > 255) return;
    if (!ycbcr_cb.value || Number.isNaN(Number(ycbcr_cb.value)) || Number(ycbcr_cb.value) < 0 || Number(ycbcr_cb.value) > 255) return;
    if (!ycbcr_cr.value || Number.isNaN(Number(ycbcr_cr.value)) || Number(ycbcr_cr.value) < 0 || Number(ycbcr_cr.value) > 255) return;

    const ycbcr = [Number(ycbcr_y.value), Number(ycbcr_cb.value), Number(ycbcr_cr.value)] as const;

    const rgb = ycbcr_to_rgb(...ycbcr);

    d_color = [...rgb];

    color_show.classList.add("bgcolor");
    color_show.style.backgroundColor = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";

    comp.value = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");

    rgb_r.value = round(rgb[0]).toString();
    rgb_g.value = round(rgb[1]).toString();
    rgb_b.value = round(rgb[2]).toString();

    var hsl = rgb_to_hsl(...rgb);

    hsl_h.value = round(hsl[0]).toString();
    hsl_s.value = round(hsl[1]).toString();
    hsl_l.value = round(hsl[2]).toString();

    color_disp_comp_p.textContent = "#" + Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_comp_r.textContent = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_disp_rgb.textContent = "rgb(" + round(rgb[0]) + ", " + round(rgb[1]) + ", " + round(rgb[2]) + ")";
    color_disp_hsl.textContent = "hsl(" + round(hsl[0]) + ", " + round(hsl[1]) + "%, " + round(hsl[2]) + "%)";
    color_disp_ycbcr.textContent = "ycbcr(" + round(ycbcr[0]) + ", " + round(ycbcr[1]) + ", " + round(ycbcr[2]) + ")";

    onModBInput();
}

function onModBInput() {
    mod_color_show.classList.remove("bgcolor");
    mod_color_show.style.backgroundColor = "";

    color_mod_disp_comp_p.textContent = "#000000";
    color_mod_disp_comp_r.textContent = "000000";
    color_mod_disp_rgb.textContent = "rgb(0, 0, 0)";
    color_mod_disp_hsl.textContent = "hsl(0, 0%, 0%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(0, 128, 128)";

    d_mod_b = null;

    if (!mod_b.value || Number.isNaN(mod_b.value)) return;

    const local_mod_b = Math.min(Math.max(Number(mod_b.value), -100), 100) / 100;

    d_mod_b = local_mod_b;

    if (d_color === null) return;

    const rgb = d_color.map(x => local_mod_b < 0 ? x * (1 + local_mod_b) : x + (255 - x) * local_mod_b) as [number, number, number];

    mod_color_show.classList.add("bgcolor");
    mod_color_show.style.backgroundColor = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";

    var hsl = rgb_to_hsl(...rgb);
    var ycbcr = rgb_to_ycbcr(...rgb);

    color_mod_disp_comp_p.textContent = "#" + Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_mod_disp_comp_r.textContent = Math.round(rgb[0]).toString(16).padStart(2, "0") + Math.round(rgb[1]).toString(16).padStart(2, "0") + Math.round(rgb[2]).toString(16).padStart(2, "0");
    color_mod_disp_rgb.textContent = "rgb(" + round(rgb[0]) + ", " + round(rgb[1]) + ", " + round(rgb[2]) + ")";
    color_mod_disp_hsl.textContent = "hsl(" + round(hsl[0]) + ", " + round(hsl[1]) + "%, " + round(hsl[2]) + "%)";
    color_mod_disp_ycbcr.textContent = "ycbcr(" + round(ycbcr[0]) + ", " + round(ycbcr[1]) + ", " + round(ycbcr[2]) + ")";
}

export function init() {
    css.addEventListener("keydown", async function (event) {
        if (event.code == "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
            if (css.value.match(/^#[0-9a-f]{6}|#[0-9a-f]{8}$/i)) {
                comp.value = css.value.slice(1, 7).toLowerCase();

                onCompInput();
            } else if (css.value.match(/rgba?\([\d\.]+(, *| +)[\d\.]+(, *| +)[\d\.]+((, *| +)[\d\.]+)?\)/)) {
                [rgb_r.value, rgb_g.value, rgb_b.value] = css.value.split("(")[1].slice(0, -1).split(/, *| +/).slice(0, 3);

                onRgbInput();
            } else if (css.value.match(/hsla?\([\d\.]+(, *| +)[\d\.]+%(, *| +)[\d\.]+%((, *| +)[\d\.]+)?\)/)) {
                [hsl_h.value, hsl_s.value, hsl_l.value] = css.value.split("(")[1].slice(0, -1).replace(/%/g, "").split(/, *| +/).slice(0, 3);

                onHslInput();
            } else {
                color_show.classList.add("bgcolor");
                color_show.style.backgroundColor = css.value;

                await new Promise((r) => setTimeout(r, 0));

                var cs = window.getComputedStyle(color_show).getPropertyValue("background-color");

                if (color_show.style.backgroundColor) {
                    [rgb_r.value, rgb_g.value, rgb_b.value] = cs.split("(")[1].slice(0, -1).split(/, *| +/).slice(0, 3);

                    onRgbInput();
                } else {
                    color_show.classList.remove("bgcolor");
                    color_show.style.backgroundColor = "";

                    for (var input of [comp, rgb_r, rgb_g, rgb_b, hsl_h, hsl_s, hsl_l, ycbcr_y, ycbcr_cb, ycbcr_cr])
                        input.value = "";
                }
            }

            css.value = "";
        }
    });

    for (var input of [rgb_r, rgb_g, rgb_b]) {
        input.addEventListener("input", onRgbInput);
    }

    for (var input of [hsl_h, hsl_s, hsl_l]) {
        input.addEventListener("input", onHslInput);
    }

    for (var input of [ycbcr_y, ycbcr_cb, ycbcr_cr]) {
        input.addEventListener("input", onYcbcrInput);
    }

    mod_b.addEventListener("input", onModBInput);

    for (const disp of [color_disp_comp_p, color_disp_comp_r, color_disp_rgb, color_disp_hsl, color_disp_ycbcr, color_mod_disp_comp_p, color_mod_disp_comp_r, color_mod_disp_rgb, color_mod_disp_hsl, color_mod_disp_ycbcr]) {
        disp.addEventListener("click", () => {
            navigator.clipboard.writeText(disp.textContent).then(() => {
                disp.style.opacity = "0%";
                setTimeout(() => { disp.style.transition = "opacity 1s linear"; disp.style.opacity = "100%"; setTimeout(() => { disp.style.transition = ""; }, 1000); }, 100);
            });
        });
    }
}