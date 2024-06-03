import { type Node, type SourceFile } from 'typescript';
import type { Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const vthrow = class extends Lint {
    public meta: Metadata = {
        name: 'throw',
        category: Category.Restriction,
        def: { level: LintLevel.Allow },
    };

    public *match(file: SourceFile): Generator<Node> {
        for (const c of this.children(file)) {
            if (this.host.ts.isThrowStatement(c)) {
                yield c;
            }
        }
    }

    public diagnostic(diag: Diag): Diag {
        return diag.with_message('use of `throw`');
    }
};
