import { type Node, type SourceFile } from 'typescript';
import type { DiagCtxt, Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { type Diag } from '../errors';

export const eqeqeq = class extends Lint {
    public meta: Metadata = {
        name: 'eqeqeq',
        category: Category.Suspicious,
        def: { level: LintLevel.Warn },
    };

    public *match(file: SourceFile): Generator<Node> {
        for (const c of this.children(file)) {
            // a ? b
            if (this.host.ts.isBinaryExpression(c)) {
                // a == b
                if (
                    c.operatorToken.kind ===
                        this.host.ts.SyntaxKind.EqualsEqualsToken ||
                    c.operatorToken.kind ===
                        this.host.ts.SyntaxKind.ExclamationEqualsToken
                ) {
                    yield c.operatorToken;
                }
            }
        }
    }

    public diagnostic(diag: Diag, ctxt: DiagCtxt): Diag {
        return diag
            .with_message('use of non-strict equality')
            .attach_subdiag((t) =>
                t
                    .help()
                    .with_message(
                        `use \`${ctxt.node.getFullText(ctxt.file)}=\` instead`
                    )
            );
    }
};
