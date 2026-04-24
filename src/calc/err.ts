export type ErrType = (
    "unbalanced" |
    "syntax" |
    "unit_syntax" |
    "unk_const" |
    "unk_fn" |
    "unk_unit" |
    "ambig_unit" |
    "unit_pow_rhs" |
    "domain" |
    "pow_rhs" |
    "incompat" |
    "no_inputs" |
    "missing_input" |
    "cascade"
);

export class CalcError extends Error {
    private type: ErrType;

    constructor(type: ErrType, msg?: string) {
        super(type.toUpperCase() + (msg === undefined ? "" : ": " + msg));

        Object.setPrototypeOf(this, CalcError.prototype);

        this.type = type;
    }

    public getType() {
        return this.type;
    }
}