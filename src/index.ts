import { init as initColor } from "./color";
import { init as initCalc } from "./calc";

initColor();
initCalc();

/*(() => {
    var vars = new Map();
    var p_output = null;
    
    async function run_calc(code, stack, vars) {
        var parts = code.match(/[a-zA-Z_]\w*|-?(0b[01]*([01]|\.[01]+)?|0o[0-7]*([0-7]|\.[0-7]+)|0x[0-9a-fA-F]*([0-9a-fA-F]|\.[0-9a-fA-F]+)|\d*(\d|\.\d+)?)|\s+|"([^\\]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\.)*"|'([^\\]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\.)*'|\*\*|./g).filter(p => p.match(/\S/));
        
        if (parts.includes("\"") || parts.includes("'") || parts.includes("\\"))
            return [1];
        
        var group_stack = [];
        var group = [];
        
        for (var p of parts) {
            if (p == "(" || p == "[" || p == "{") {
                group_stack.push(group);
                group = [p];
            } else if (p == ")" || p == "]" || p == "}") {
                if (!group_stack.length)
                    return [1];
                if (p.charCodeAt() - group[0].charCodeAt() > 2)
                    return [1];
                
                group = group_stack.pop().concat([group.concat([p])]);
            } else {
                group.push(p);
            }
        }
        
        if (group_stack.length)
            return [1];
        
        /*var put = null;
        var colon_idx = parts.findIndex(p => p[0] != "\"" && p[0] != "'" && p.includes(":"));
        
        if (colon_idx != -1) {
            if (!parts[colon_idx - 1][0].match(/[a-zA-Z_]/))
                return [1];
            if (!parts[colon_idx]
        }* /
        
        function parse(group) {
            if (group[0] == "{")
                return [{
                    type: "fn",
                    body: parse(group.slice(1, -1))
                }];
            if (group[0] == "[")
                return [{
                    type: "array",
                    items: group.slice(1, -1).reduce((is, x) => x == "," ? is.concat([[]]) : [is.slice(0, -1), is[is.length - 1].concat([x])], [[]]).filter(i => i.length).map(parse)
                }];
            
            if (group[0] == "(") group = group.slice(1, -1);
            
            function parse_numeric(str) {
                var sign = 1;
                
                if (str[0] == "-") {
                    sign = -1;
                    str = str.slice(1);
                }
                
                if (str.startsWith("0b") || str.startsWith("0o") || str.startsWith("0x")) {
                    var base = ({
                        "b": 2,
                        "o": 8,
                        "x": 16
                    })[str[1]];
                    
                    var int = parseInt(str.slice(2).split(".")[0], base);
                    var low = 0;
                    
                    if (str.includes(".")) {
                        var low_str = str.split(".")[1].replace(/0+$/, "");
                        
                        low = parseInt(low_str, base) / (base ** low_str.length);
                    }
                    
                    return sign * (int + low);
                }
                
                return sign * Number(str);
            }
            
            function parse_string(str) {
                return str.slice(1, -1).replace(/\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\./g, (c) => c[1] == "x" || c[1] == "u" ? String.fromCodePoint(parseInt(c.slice(2), 16)) : ({
                    "0": "\0",
                    "n": "\n",
                    "r": "\r",
                    "b": "\b",
                    "t": "\t",
                    "f": "\f"
                })[c[1]] || c[1]);
            }
            
            return group.map(g => g.match(/^-?.?\d/) ? parse_numeric(g) : g.startsWith("\"") || g.startsWith("'") ? parse_string(g) : ({
                type: "id",
                id: g
            }));
        }
        
        return [0, JSON.stringify(parse(group))];
    }
    
    var log = document.getElementById("calc_log");
    var input = document.getElementById("calc_input");
    
    input.onkeydown = async (info) => {
        if (info.code != "Enter" || info.ctrlKey || info.altKey || info.metaKey || info.shiftKey)
            return;
        
        var div = document.createElement("div");
        
        var code = document.createElement("span");
        var output = document.createElement("div");
        
        code.classList.add("calc_code");
        output.classList.add("calc_output");
        
        code.textContent = input.value;
        
        var out;
        
        try {
            out = await run_calc(input.value);
        } catch (info) {
            out = [1, info];
        }
        
        if (out[0] == 0) {
            for (var o of out[1]) {
                var d = document.createElement("div");
                
                d.textContent = o;
                
                output.appendChild(d);
            }
        } else {
            output.style.color = "hsl(0, 80%, 60%)";
            
            output.textContent = 1 in out ? out[1]?.stack || String(out[1]) || "!" : "!";
        }
        
        div.appendChild(code);
        div.appendChild(output);
        
        log.appendChild(div);
        
        log.scrollTo(0, log.scrollHeight);
        
        info.preventDefault();
        
        input.value = "";
        input.oninput();
    };
})();*/

