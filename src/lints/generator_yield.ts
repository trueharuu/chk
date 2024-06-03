import { type Node, type SourceFile } from 'typescript';
import type { Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const generator_yield = class extends Lint {
    public meta: Metadata = {
        name: 'generator_yield',
        category: Category.Pedantic,
        def: { level: LintLevel.Warn },
    };

    public *match(file: SourceFile): Generator<Node> {
        a: for (const c of this.children(file)) {
            if (this.host.ts.isFunctionDeclaration(c)) {
                if (c.asteriskToken !== undefined) {
                    if (c.body !== undefined) {
                        for (const stmt of c.body.statements) {
                            if (this.host.ts.isExpressionStatement(stmt)) {
                                if (
                                    this.host.ts.isYieldExpression(
                                        stmt.expression
                                    )
                                ) {
                                    continue a;
                                }
                            }
                        }

                        yield c;
                    }
                }
            }
        }
    }

    public diagnostic(diag: Diag): Diag {
        return diag.with_message('generator does not use `yield`');
    }
};
