import type { Host } from './host';
import { almost_swap } from './lints/almost_swap';
import { eqeqeq } from './lints/eqeqeq';
import { fn_locals } from './lints/fn_locals';
import { generator_yield } from './lints/generator_yield';
import { non_bool_condition } from './lints/non_bool_condition';
import { string_to_string } from './lints/string_to_string';
import { vthrow } from './lints/throw';

export function repo(h: Host): void {
    h.add_lints([
        string_to_string,
        non_bool_condition,
        vthrow,
        fn_locals,
        eqeqeq,
        almost_swap,
        generator_yield,
    ]);
}
