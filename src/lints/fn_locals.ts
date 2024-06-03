import { type Node, type SourceFile } from 'typescript';
import type { Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const fn_locals = class extends Lint {
    public meta: Metadata = {
        name: 'fn_locals',
        category: Category.Suspicious,
        def: { level: LintLevel.Warn },
    };

    public *match(file: SourceFile): Generator<Node> {
        for (const c of this.children(file)) {
            if (this.host.ts.isBlock(c)) {
                if (this.host.ts.isModuleBlock(c)) {
                    continue;
                }
                for (const i of c.statements) {
                    if (this.host.ts.isFunctionDeclaration(i)) {
                        yield i;
                    }
                }
            }
        }
    }

    public diagnostic(diag: Diag): Diag {
        return diag.with_message('declaration of local function');
    }
};
