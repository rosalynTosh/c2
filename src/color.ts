import { CompColor, compToRGB, HSLColor, hslToRGB, RGBColor, rgbToComp, rgbToHSL, rgbToYCbCr, roundToThousandths, strsToHSL, strsToRGB, strsToYCbCr, strToComp, YCbCrColor, ycbcrToRGB } from "./color-utils";

export class ColorModule {
    private colorShowDiv = document.getElementById("color_show") as HTMLDivElement;

    private colorDispCSSCompSpan = document.getElementById("color_disp_comp_p") as HTMLSpanElement;
    private colorDispCompSpan = document.getElementById("color_disp_comp_r") as HTMLSpanElement;
    private colorDispRGBDiv = document.getElementById("color_disp_rgb") as HTMLDivElement;
    private colorDispHSLDiv = document.getElementById("color_disp_hsl") as HTMLDivElement;
    private colorDispYCbCrDiv = document.getElementById("color_disp_ycbcr") as HTMLDivElement;

    private cssInput = document.getElementById("color_css") as HTMLInputElement;

    private compInput = document.getElementById("color_comp") as HTMLInputElement;

    private rgbRInput = document.getElementById("color_rgb_r") as HTMLInputElement;
    private rgbGInput = document.getElementById("color_rgb_g") as HTMLInputElement;
    private rgbBInput = document.getElementById("color_rgb_b") as HTMLInputElement;

    private hslHInput = document.getElementById("color_hsl_h") as HTMLInputElement;
    private hslSInput = document.getElementById("color_hsl_s") as HTMLInputElement;
    private hslLInput = document.getElementById("color_hsl_l") as HTMLInputElement;

    private ycbcrYInput = document.getElementById("color_ycbcr_y") as HTMLInputElement;
    private ycbcrCbInput = document.getElementById("color_ycbcr_cb") as HTMLInputElement;
    private ycbcrCrInput = document.getElementById("color_ycbcr_cr") as HTMLInputElement;

    private modColorShowDiv = document.getElementById("color_mod_show") as HTMLDivElement;

    private modColorDispCSSCompSpan = document.getElementById("color_mod_disp_comp_p") as HTMLSpanElement;
    private modColorDispCompSpan = document.getElementById("color_mod_disp_comp_r") as HTMLSpanElement;
    private modColorDispRGBDiv = document.getElementById("color_mod_disp_rgb") as HTMLDivElement;
    private modColorDispHSLDiv = document.getElementById("color_mod_disp_hsl") as HTMLDivElement;
    private modColorDispYCbCrDiv = document.getElementById("color_mod_disp_ycbcr") as HTMLDivElement;

    private modBrightnessInput = document.getElementById("color_mod_b") as HTMLInputElement;

    private color: RGBColor | null = null;
    private modBrightness: number | null = null;

    constructor() {
        this.cssInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                this.onCSSInput();
            }
        });

        this.compInput.addEventListener("input", this.onCompInput.bind(this));

        this.rgbRInput.addEventListener("input", this.onRGBInput.bind(this));
        this.rgbGInput.addEventListener("input", this.onRGBInput.bind(this));
        this.rgbBInput.addEventListener("input", this.onRGBInput.bind(this));

        this.hslHInput.addEventListener("input", this.onHSLInput.bind(this));
        this.hslSInput.addEventListener("input", this.onHSLInput.bind(this));
        this.hslLInput.addEventListener("input", this.onHSLInput.bind(this));
        
        this.ycbcrYInput.addEventListener("input", this.onYCbCrInput.bind(this));
        this.ycbcrCbInput.addEventListener("input", this.onYCbCrInput.bind(this));
        this.ycbcrCrInput.addEventListener("input", this.onYCbCrInput.bind(this));

        this.modBrightnessInput.addEventListener("input", this.onModBrightnessInput.bind(this));

        this.setCopyable(this.colorDispCSSCompSpan);
        this.setCopyable(this.colorDispCompSpan);
        this.setCopyable(this.colorDispRGBDiv);
        this.setCopyable(this.colorDispHSLDiv);
        this.setCopyable(this.colorDispYCbCrDiv);

        this.setCopyable(this.modColorDispCSSCompSpan);
        this.setCopyable(this.modColorDispCompSpan);
        this.setCopyable(this.modColorDispRGBDiv);
        this.setCopyable(this.modColorDispHSLDiv);
        this.setCopyable(this.modColorDispYCbCrDiv);
    }

    private setCopyable(disp: HTMLElement) {
        disp.addEventListener("click", () => {
            navigator.clipboard.writeText(disp.textContent).then(() => {
                disp.style.opacity = "0%";
                setTimeout(() => { disp.style.transition = "opacity 1s linear"; disp.style.opacity = "100%"; setTimeout(() => { disp.style.transition = ""; }, 1000); }, 100);
            });
        });
    }

    private clearPrimaryDisp() {
        this.colorShowDiv.classList.remove("bgcolor");
        this.colorShowDiv.style.backgroundColor = "";

        this.colorDispCSSCompSpan.textContent = "#000000";
        this.colorDispCompSpan.textContent = "000000";
        this.colorDispRGBDiv.textContent = "rgb(0, 0, 0)";
        this.colorDispHSLDiv.textContent = "hsl(0, 0%, 0%)";
        this.colorDispYCbCrDiv.textContent = "ycbcr(0, 128, 128)";
    }

    private clearModDisp() {
        this.modColorShowDiv.classList.remove("bgcolor");
        this.modColorShowDiv.style.backgroundColor = "";

        this.modColorDispCSSCompSpan.textContent = "#000000";
        this.modColorDispCompSpan.textContent = "000000";
        this.modColorDispRGBDiv.textContent = "rgb(0, 0, 0)";
        this.modColorDispHSLDiv.textContent = "hsl(0, 0%, 0%)";
        this.modColorDispYCbCrDiv.textContent = "ycbcr(0, 128, 128)";
    }

    private clearDisps() {
        this.clearPrimaryDisp();
        this.clearModDisp();
    }

    private clearCompInput() {
        this.compInput.value = "";
    }

    private clearRGBInputs() {
        this.rgbRInput.value = "";
        this.rgbGInput.value = "";
        this.rgbBInput.value = "";
    }

    private clearHSLInputs() {
        this.hslHInput.value = "";
        this.hslSInput.value = "";
        this.hslLInput.value = "";
    }

    private clearYCbCrInputs() {
        this.ycbcrYInput.value = "";
        this.ycbcrCbInput.value = "";
        this.ycbcrCrInput.value = "";
    }

    private setCompInput(comp: CompColor) {
        this.compInput.value = comp;
    }

    private setRGBInputs(rgb: RGBColor) {
        this.rgbRInput.value = roundToThousandths(rgb.r).toString();
        this.rgbGInput.value = roundToThousandths(rgb.g).toString();
        this.rgbBInput.value = roundToThousandths(rgb.b).toString();
    }

    private setHSLInputs(hsl: HSLColor) {
        this.hslHInput.value = roundToThousandths(hsl.h).toString();
        this.hslSInput.value = roundToThousandths(hsl.s).toString();
        this.hslLInput.value = roundToThousandths(hsl.l).toString();
    }

    private setYCbCrInputs(ycbcr: YCbCrColor) {
        this.ycbcrYInput.value = roundToThousandths(ycbcr.y).toString();
        this.ycbcrCbInput.value = roundToThousandths(ycbcr.cb).toString();
        this.ycbcrCrInput.value = roundToThousandths(ycbcr.cr).toString();
    }

    private setColorDisp(comp: CompColor, rgb: RGBColor, hsl: HSLColor, ycbcr: YCbCrColor) {
        this.colorDispCSSCompSpan.textContent = "#" + comp;
        this.colorDispCompSpan.textContent = comp;
        this.colorDispRGBDiv.textContent = "rgb(" + roundToThousandths(rgb.r) + ", " + roundToThousandths(rgb.g) + ", " + roundToThousandths(rgb.b) + ")";
        this.colorDispHSLDiv.textContent = "hsl(" + roundToThousandths(hsl.h) + ", " + roundToThousandths(hsl.s) + "%, " + roundToThousandths(hsl.l) + "%)";
        this.colorDispYCbCrDiv.textContent = "ycbcr(" + roundToThousandths(ycbcr.y) + ", " + roundToThousandths(ycbcr.cb) + ", " + roundToThousandths(ycbcr.cr) + ")";
    }

    private async onCSSInput() {
        if (this.cssInput.value.match(/^#[0-9a-f]{6}|#[0-9a-f]{8}$/i)) {
            this.compInput.value = this.cssInput.value.slice(1, 7);

            this.onCompInput();
        } else if (this.cssInput.value.match(/rgba?\([\d\.]+(, *| +)[\d\.]+(, *| +)[\d\.]+((, *| +)[\d\.]+)?\)/)) {
            const rgb = this.cssInput.value.split("(")[1].slice(0, -1).split(/, *| +/).slice(0, 3);

            this.rgbRInput.value = rgb[0];
            this.rgbGInput.value = rgb[1];
            this.rgbBInput.value = rgb[2];

            this.onRGBInput();
        } else if (this.cssInput.value.match(/hsla?\([\d\.]+(, *| +)[\d\.]+%(, *| +)[\d\.]+%((, *| +)[\d\.]+)?\)/)) {
            const hsl = this.cssInput.value.split("(")[1].slice(0, -1).replace(/%/g, "").split(/, *| +/).slice(0, 3);

            this.hslHInput.value = hsl[0];
            this.hslSInput.value = hsl[1];
            this.hslLInput.value = hsl[2];

            this.onHSLInput();
        } else {
            this.colorShowDiv.classList.add("bgcolor");
            this.colorShowDiv.style.backgroundColor = this.cssInput.value;

            await new Promise((r) => setTimeout(r, 0));

            const cs = window.getComputedStyle(this.colorShowDiv).getPropertyValue("background-color");

            if (this.colorShowDiv.style.backgroundColor !== "") {
                const rgb = cs.split("(")[1].slice(0, -1).split(/, *| +/).slice(0, 3);

                this.rgbRInput.value = rgb[0];
                this.rgbGInput.value = rgb[1];
                this.rgbBInput.value = rgb[2];

                this.onRGBInput();
            } else {
                this.clearDisps();
                this.clearCompInput();
                this.clearRGBInputs();
                this.clearHSLInputs();
                this.clearYCbCrInputs();

                this.color = null;
            }
        }

        this.cssInput.value = "";
    }

    private onCompInput() {
        this.clearDisps();
        this.clearRGBInputs();
        this.clearHSLInputs();
        this.clearYCbCrInputs();

        this.color = null;

        const comp = strToComp(this.compInput.value);

        if (comp === null) return;

        const rgb = compToRGB(comp);
        const hsl = rgbToHSL(rgb);
        const ycbcr = rgbToYCbCr(rgb);

        this.colorShowDiv.classList.add("bgcolor");
        this.colorShowDiv.style.backgroundColor = "#" + comp;

        this.color = { ...rgb };

        this.setRGBInputs(rgb);
        this.setHSLInputs(hsl);
        this.setYCbCrInputs(ycbcr);

        this.setColorDisp(comp, rgb, hsl, ycbcr);

        this.onModBrightnessInput();
    }

    private onRGBInput() {
        this.clearDisps();
        this.clearCompInput();
        this.clearHSLInputs();
        this.clearYCbCrInputs();

        this.color = null;

        const rgb = strsToRGB(this.rgbRInput.value, this.rgbGInput.value, this.rgbBInput.value);

        if (rgb === null) return null;

        const comp = rgbToComp(rgb);
        const hsl = rgbToHSL(rgb);
        const ycbcr = rgbToYCbCr(rgb);

        this.colorShowDiv.classList.add("bgcolor");
        this.colorShowDiv.style.backgroundColor = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";

        this.color = { ...rgb };

        this.setCompInput(comp);
        this.setHSLInputs(hsl);
        this.setYCbCrInputs(ycbcr);

        this.setColorDisp(comp, rgb, hsl, ycbcr);

        this.onModBrightnessInput();
    }

    private onHSLInput() {
        this.clearDisps();
        this.clearCompInput();
        this.clearRGBInputs();
        this.clearYCbCrInputs();

        this.color = null;

        const hsl = strsToHSL(this.hslHInput.value, this.hslSInput.value, this.hslLInput.value);

        if (hsl === null) return;

        this.colorShowDiv.classList.add("bgcolor");
        this.colorShowDiv.style.backgroundColor = "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";

        const rgb = hslToRGB(hsl);
        const comp = rgbToComp(rgb);
        const ycbcr = rgbToYCbCr(rgb);

        this.color = { ...rgb };

        this.setCompInput(comp);
        this.setRGBInputs(rgb);
        this.setYCbCrInputs(ycbcr);

        this.setColorDisp(comp, rgb, hsl, ycbcr);

        this.onModBrightnessInput();
    }

    private onYCbCrInput() {
        this.clearDisps();
        this.clearCompInput();
        this.clearRGBInputs();
        this.clearHSLInputs();

        this.color = null;

        const ycbcr = strsToYCbCr(this.ycbcrYInput.value, this.ycbcrCbInput.value, this.ycbcrCrInput.value);

        if (ycbcr === null) return;

        const rgb = ycbcrToRGB(ycbcr);
        const comp = rgbToComp(rgb);
        const hsl = rgbToHSL(rgb);

        this.color = { ...rgb };

        this.colorShowDiv.classList.add("bgcolor");
        this.colorShowDiv.style.backgroundColor = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";

        this.setCompInput(comp);
        this.setRGBInputs(rgb);
        this.setHSLInputs(hsl);

        this.setColorDisp(comp, rgb, hsl, ycbcr);

        this.onModBrightnessInput();
    }

    private onModBrightnessInput() {
        this.clearModDisp();

        this.modBrightness = null;

        const modBrightnessStr = this.modBrightnessInput.value;
        const modBrightnessUnclamped = Number(modBrightnessStr);

        if (modBrightnessStr === "" || Number.isNaN(modBrightnessUnclamped)) return;

        const modBrightness = Math.min(Math.max(Number(modBrightnessUnclamped), -100), 100) / 100;

        this.modBrightness = modBrightness;

        if (this.color === null) return;

        function applyBrightnessMod(orig: RGBColor): RGBColor {
            function darken(x: number): number {
                return x * (1 + modBrightness);
            }

            function lighten(x: number): number {
                return x + (255 - x) * modBrightness;
            }

            return modBrightness < 0 ? {
                r: darken(orig.r),
                g: darken(orig.g),
                b: darken(orig.b)
            } : {
                r: lighten(orig.r),
                g: lighten(orig.g),
                b: lighten(orig.b)
            };
        }

        const rgb = applyBrightnessMod(this.color);

        this.modColorShowDiv.classList.add("bgcolor");
        this.modColorShowDiv.style.backgroundColor = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";

        const comp = rgbToComp(rgb);
        const hsl = rgbToHSL(rgb);
        const ycbcr = rgbToYCbCr(rgb);

        this.modColorDispCSSCompSpan.textContent = "#" + comp;
        this.modColorDispCompSpan.textContent = comp;
        this.modColorDispRGBDiv.textContent = "rgb(" + roundToThousandths(rgb.r) + ", " + roundToThousandths(rgb.g) + ", " + roundToThousandths(rgb.b) + ")";
        this.modColorDispHSLDiv.textContent = "hsl(" + roundToThousandths(hsl.h) + ", " + roundToThousandths(hsl.s) + "%, " + roundToThousandths(hsl.l) + "%)";
        this.modColorDispYCbCrDiv.textContent = "ycbcr(" + roundToThousandths(ycbcr.y) + ", " + roundToThousandths(ycbcr.cb) + ", " + roundToThousandths(ycbcr.cr) + ")";
    }
}