import type { SourceFile } from 'typescript';
import type { Span } from './span';

import type { Color } from 'kleur';
import kleur from 'kleur';

import { Subdiag } from './subdiag';

export class Diag extends Subdiag {
    public constructor(
        public readonly file: SourceFile,
        public readonly span: Span
    ) {
        super();
    }

    public location_label(): string {
        return (
            this.file.fileName +
            kleur.dim(
                `${this.chars.colon}${this.span.start_line()}${
                    this.chars.colon
                }${this.span.start_col()}`
            )
        );
    }

    public format_backticks(t: string): string {
        return t.replace(/`(.+?)`/g, (_, $1) => {
            return kleur.magenta(`\`${$1}\``);
        });
    }

    public line_len(): number {
        return Math.max(
            this.span.start_line().toString().length,
            this.span.end_line().toString().length
        );
    }

    public pad(n: number): string {
        return ' '.repeat(n);
    }

    public highlight(
        slice: string,
        color: Color,
        start: number,
        end: number
    ): string {
        return (
            slice.slice(0, start) +
            color(slice.slice(start, end)) +
            slice.slice(end)
        );
    }

    public get margin_color(): Color {
        return kleur.blue().bold;
    }

    // the single most hacky function in this entire codebase.
    public to_string(): string {
        let v = '';
        v += `${this.level_label()}${this.chars.colon} ${kleur.bold(
            this.format_backticks(this.message)
        )}\n`;
        const mar = this.pad(this.line_len());
        v += `${mar}${this.margin_color(
            this.chars.arrow
        )} ${this.location_label()}\n`;
        let displayed_ellipsis = false;

        // main diagnostic
        {
            v += `${mar} ${this.margin_color(this.chars.vbar)}\n`;
            for (
                let l = this.span.start_line();
                l <= this.span.end_line();
                l++
            ) {
                if (
                    l !== this.span.start_line() &&
                    l !== this.span.end_line()
                ) {
                    if (!displayed_ellipsis) {
                        v += `${mar} ${this.margin_color().dim(
                            this.chars.vbar
                        )}\n`;
                        v += `${mar} ${this.margin_color().dim(
                            this.chars.vbar
                        )} ${kleur.dim('...')}\n`;
                        v += `${mar} ${this.margin_color().dim(
                            this.chars.vbar
                        )}\n`;
                        v += `${mar} ${this.margin_color(this.chars.vbar)}\n`;

                        displayed_ellipsis = true;
                    }
                    continue;
                }
                const txt = this.span.read_line(l);
                const arrow_ct = this.span.span_for_line(l);
                const arrows =
                    ' '.repeat(arrow_ct.start) +
                    this.level_color()(this.chars.up.repeat(arrow_ct.len()));
                v += `${this.margin_color(l)} ${this.margin_color(
                    this.chars.vbar
                )} ${txt}\n`;

                v += `${mar} ${this.margin_color(this.chars.vbar)} ${arrows}\n`;

                if (l === this.span.end_line()) {
                    if (this.label !== '') {
                        const t1 = `${' '.repeat(
                            arrow_ct.start_col()
                        )}${' '.repeat(
                            this.pad_attach(arrow_ct.len())
                        )}${this.level_color()(this.chars.vbar)}`;
                        const t2 = `${' '.repeat(
                            arrow_ct.start_col()
                        )}${' '.repeat(
                            this.pad_attach(arrow_ct.len())
                        )}${this.level_color()(this.label)}`;
                        v += `${mar} ${this.margin_color().dim(
                            this.chars.vbar
                        )}${t1}\n`;
                        v += `${mar} ${this.margin_color().dim(
                            this.chars.vbar
                        )}${t2}\n`;
                    }
                }
            }
            if (this.subdiags.length !== 0) {
                v += `${mar} ${this.margin_color().dim(this.chars.vbar)}\n`;
            }
        }

        // subdiags

        for (const sub of this.subdiags) {
            v += `${sub.level_label()}: ${this.format_backticks(
                sub.message
            )}\n`;

            if (sub.subdiags.length !== 0) {
                v += `${mar} ${this.margin_color(this.chars.vbar)}\n`;
            }
            // sub-sub diags
            for (const bus of sub.subdiags) {
                v += `${mar} ${this.margin_color(
                    this.chars.eq
                )} ${bus.level_label(true)}: ${this.format_backticks(
                    bus.message
                )}\n`;
            }
        }

        return v;
    }
}
