import { type Node, type SourceFile } from 'typescript';
import type { Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const string_to_string = class extends Lint {
    public meta: Metadata = {
        name: 'string_to_string',
        category: Category.Suspicious,
        def: { level: LintLevel.Warn },
    };

    public *match(file: SourceFile): Generator<Node> {
        for (const c of this.children(file)) {
            // any()
            if (this.host.ts.isCallExpression(c)) {
                // a.b()
                if (this.host.ts.isPropertyAccessExpression(c.expression)) {
                    // a.toString()
                    if (c.expression.name.text === 'toString') {
                        const ty = this.host
                            .typeck()
                            .ty_of(c.expression.expression);

                        // [string].b()
                        if (ty.is_string()) {
                            yield c;
                        }
                    }
                }
            }
        }
    }

    public diagnostic(diag: Diag): Diag {
        return diag
            .with_message('called `toString()` on a value of type `string`')
            .attach_subdiag((x) =>
                x.help().with_message('remove the `toString()` call')
            );
    }
};
