import type { Node, SourceFile } from 'typescript';
import type { Host } from './host';
import { recursive_children_of } from './tools';
import { type LintConfig } from './types';
import type { Diag, Span } from './errors';

export abstract class Lint {
    public abstract meta: Metadata;
    public constructor(public readonly host: Host) {}

    public abstract match(file: SourceFile): Generator<Node | [Node, Span]>;
    public abstract diagnostic(diag: Diag, ctxt: DiagCtxt): Diag;

    public *children(file: SourceFile): Generator<Node> {
        yield* recursive_children_of(file, file);
    }

    public cfg(): LintConfig {
        return Object.assign(
            {},
            this.meta.def,
            this.host.cfg.categories[this.meta.category] || {},
            this.host.cfg.lints[this.meta.name] || {}
        );
    }
}

export class DiagCtxt {
    public constructor(
        public readonly span: Span,
        public readonly node: Node,
        public readonly file: SourceFile
    ) {}
}

export interface Metadata {
    name: string;
    def: LintConfig;
    category: Category;
}



export enum Category {
    Complexity = 'complexity',
    Correctness = 'correctness',
    Nursery = 'nursery',
    Pedantic = 'pedantic',
    Perf = 'perf',
    Restriction = 'restriction',
    Style = 'style',
    Suspicious = 'suspicious',
}
