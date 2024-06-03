import type { BinaryExpression, Identifier } from 'typescript';
import { type Node, type SourceFile } from 'typescript';
import type { DiagCtxt, Metadata } from '../lint';
import { Category, Lint } from '../lint';

import { LintLevel } from '../types';
import { Span, type Diag } from '../errors';
import { assume, filter, windows } from '../tools';

export const almost_swap = class extends Lint {
    public meta: Metadata = {
        name: 'almost_swap',
        category: Category.Suspicious,
        def: { level: LintLevel.Warn },
    };

    // eslint-disable-next-line require-yield
    public *match(file: SourceFile): Generator<Node | [Node, Span]> {
        for (const [a, b] of windows(
            filter(file.statements, (x) => !this.host.ts.isEmptyStatement(x)),
            2
        )) {
            if (
                a !== undefined &&
                b !== undefined &&
                this.host.ts.isExpressionStatement(a) &&
                this.host.ts.isExpressionStatement(b) &&
                this.host.ts.isBinaryExpression(a.expression) &&
                this.host.ts.isBinaryExpression(b.expression) &&
                a.expression.operatorToken.kind ===
                    this.host.ts.SyntaxKind.EqualsToken &&
                b.expression.operatorToken.kind ===
                    this.host.ts.SyntaxKind.EqualsToken &&
                this.host.ts.isIdentifier(a.expression.left) &&
                this.host.ts.isIdentifier(a.expression.right) &&
                this.host.ts.isIdentifier(b.expression.left) &&
                this.host.ts.isIdentifier(b.expression.right) &&
                a.expression.left.text === b.expression.right.text &&
                a.expression.right.text === b.expression.left.text
            ) {
                yield [b.expression, Span.of_node(a, file).with_end(b.end)];
            }
        }
    }

    public diagnostic(diag: Diag, ctxt: DiagCtxt): Diag {
        assume<BinaryExpression>(ctxt.node);
        assume<Identifier>(ctxt.node.left);
        assume<Identifier>(ctxt.node.right);
        
        return diag
            .with_message('failed attempt to swap variables')
            .attach_subdiag((t) =>
                t.help().with_message('use destructuring instead')
            );
    }
};
