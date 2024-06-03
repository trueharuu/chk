import t from 'typescript';
import type { Node, Printer, Program, SourceFile } from 'typescript';
import { DiagCtxt, type Lint } from './lint';
import { LintLevel, type Config } from './types';
import { Diag, Span, from_lint_level } from './errors';
import { Typeck } from './typeck';

export class Host {
    public readonly ts: typeof t = t;
    public readonly lints: Array<Lint> = [];
    public constructor(
        public readonly program: Program,
        public readonly cfg: Config
    ) {}

    public *source_files(): Generator<SourceFile, void, unknown> {
        for (const name of this.program.getRootFileNames()) {
            const file = this.program.getSourceFile(name);
            if (file !== undefined) {
                yield file;
            }
        }
    }

    public printer(): Printer {
        return this.ts.createPrinter();
    }

    public print_node<T extends Node>(
        t: T,
        file: SourceFile = t.getSourceFile()
    ): string {
        return this.printer().printNode(this.ts.EmitHint.Unspecified, t, file);
    }

    public typeck(): Typeck {
        return new Typeck(this);
    }

    public add_lint(lint: typeof Lint): this {
        // @ts-expect-error ts2511 idgaf
        const z = new lint(this);
        this.lints.push(z);
        return this;
    }

    public add_lints(t: Iterable<typeof Lint>): this {
        for (const v of t) {
            this.add_lint(v);
        }

        return this;
    }

    private diags: Array<Diag> = [];
    public run(): void {
        for (const file of this.source_files()) {
            // console.info(`linting ${file.fileName}`);
            for (const lint of this.lints) {
                if (lint.cfg().level === LintLevel.Allow) {
                    continue;
                }
                // console.log(`running ${lint.meta.name}`);
                for (const match of lint.match(file)) {
                    let span: Span;
                    let n: Node;
                    if (Array.isArray(match)) {
                        [n, span] = match;
                    } else {
                        n = match;
                        span = Span.of_node(match, file);
                    }
                    const diag = new Diag(file, span).with_level(
                        from_lint_level(lint.cfg().level)
                    );

                    const ctxt = new DiagCtxt(span, n, file);
                    lint.diagnostic(diag, ctxt);
                    this.diags.push(diag);
                }
            }
        }

        for (const diag of this.diags) {
            console.log(diag.to_string());
        }
    }
}
