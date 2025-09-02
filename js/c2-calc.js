(() => {
    var log = document.getElementById("calc_log");
    var input_std = document.getElementById("calc_input_std");
    var input_fp = document.getElementById("calc_input_fp");
    
    function run_calc(ast) {}
    
    function parse_std(input) {
        var toks = input.match(/([0-9]*\.)?[0-9]+(e-?[0-9]+)?|[a-zA-Z]+|\*\*|\/\/|\&\&|\|\||[=!<>]=|\{[^}]*\}|\s+|./);
    }
    
    function parse_fp(input) {
        
    }
})();