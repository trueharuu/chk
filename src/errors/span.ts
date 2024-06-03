import type { Node, SourceFile } from 'typescript';

export class Span {
    public constructor(
        public slice: string,
        public start: number,
        public end: number
    ) {}

    public len(): number {
        return this.end - this.start;
    }

    public is_empty(): boolean {
        return this.len() === 0;
    }

    public read(s: string): string {
        return s.slice(this.start, this.end);
    }

    public with_start(start: number): Span {
        return new Span(this.slice, start, this.end);
    }

    public with_end(end: number): Span {
        return new Span(this.slice, this.start, end);
    }

    public static of_node(node: Node, file: SourceFile): Span {
        return new this(file.text, node.getStart(file), node.end);
    }

    public lines(): Array<string> {
        return this.slice.split('\n');
    }

    public line_of(pos: number): number {
        let current = 0;
        const lines = this.lines();
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i] || '';
            const next_pos = current + line.length + 1;
            if (pos < next_pos) {
                return i + 1;
            }

            current = next_pos;
        }

        return -1;
    }

    public col_of(pos: number): number {
        const lines = this.lines();

        let current = 0;
        for (const line of lines) {
            const next_pos = current + line.length + 1;
            if (pos < next_pos) {
                return pos - current + 1;
            }
            current = next_pos;
        }

        return -1;
    }

    public start_line(): number {
        return this.line_of(this.start);
    }
    public start_col(): number {
        return this.col_of(this.start);
    }
    public end_line(): number {
        return this.line_of(this.end);
    }
    public end_col(): number {
        return this.col_of(this.end);
    }

    public *iter(): Generator<number> {
        for (let i = this.start; i < this.end; i++) {
            yield i;
        }
    }

    public read_line(line: number): string {
        return this.lines()[line - 1] as string;
    }

    public span_for_line(line: number): Span {
        const l = this.read_line(line);
        if (this.start_line() === line && this.end_line() === line) {
            return new Span(l, this.start_col() - 1, this.end_col() - 1);
        }
        if (this.start_line() < line && this.end_line() > line) {
            return new Span(l, 0, l.length - 1);
        }

        if (this.start_line() === line) {
            return new Span(l, this.start_col() - 1, l.length - 1);
        }

        return new Span(l, 0, this.end_col() - 1);
    }
}
