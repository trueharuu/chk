import { type Node, type SourceFile } from 'typescript';
import type { DiagCtxt, Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const non_bool_condition = class extends Lint {
    public meta: Metadata = {
        name: 'non_bool_condition',
        category: Category.Suspicious,
        def: { level: LintLevel.Warn },
    };

    public *match(file: SourceFile): Generator<Node> {
        for (const c of this.children(file)) {
            // if (cond) { then } [else {}]
            if (this.host.ts.isIfStatement(c)) {
                const ty = this.host.typeck().ty_of(c.expression);

                if (!ty.is_boolean()) {
                    yield c.expression;
                }
            }
        }
    }

    public diagnostic(diag: Diag, ctxt: DiagCtxt): Diag {
        const ty = this.host.typeck().ty_of(ctxt.node);
        return diag
            .with_message('condition is not of type `boolean`')
            .with_label(`this is of type \`${ty.widen().to_string()}\``);
    }
};
