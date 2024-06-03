import type { Color } from 'kleur';
import kleur from 'kleur';
import { Level } from './level';
import { Chars } from './chars';

export class Subdiag {
    public message: string = '';
    protected level: Level = Level.Unspecified;
    public chars: Chars = new Chars();
    public subdiags: Array<Subdiag> = [];
    protected label: string = '';
    protected label_attach: LabelAttach = LabelAttach.Left;
    public with_level(level: Level): this {
        this.level = level;
        return this;
    }

    public with_message(message: string): this {
        this.message = message;
        return this;
    }

    public label_attach_to(attach: LabelAttach): this {
        this.label_attach = attach;
        return this;
    }

    public level_label(white: boolean = false): string {
        const c = white ? kleur.white().bold : this.level_color()().bold;
        if (this.level === Level.Error) {
            return c('error');
        } else if (this.level === Level.Warning) {
            return c('warning');
        } else if (this.level === Level.Help) {
            return c('help');
        } else if (this.level === Level.Note) {
            return c('note');
        } else {
            return c('unspecified');
        }
    }

    public with_subdiag(subdiag: Subdiag): this {
        this.subdiags.push(subdiag);
        return this;
    }

    public with_subdiags(i: Iterable<Subdiag>): this {
        for (const j of i) {
            this.with_subdiag(j);
        }

        return this;
    }

    public attach_subdiag(f: (t: Subdiag) => Subdiag): this {
        return this.with_subdiag(f(new Subdiag()));
    }

    public with_label(label: string): this {
        this.label = label;
        return this;
    }

    public level_color(): Color {
        if (this.level === Level.Error) {
            return kleur.red;
        } else if (this.level === Level.Warning) {
            return kleur.yellow;
        } else if (this.level === Level.Help) {
            return kleur.cyan;
        } else if (this.level === Level.Note) {
            return kleur.green;
        } else {
            return kleur.white;
        }
    }

    public error(): this {
        return this.with_level(Level.Error);
    }

    public warning(): this {
        return this.with_level(Level.Warning);
    }

    public note(): this {
        return this.with_level(Level.Note);
    }

    public help(): this {
        return this.with_level(Level.Help);
    }

    protected pad_attach(len: number): number {
        if (this.label_attach === LabelAttach.Left) {
            return 0;
        } else if (this.label_attach === LabelAttach.Center) {
            return Math.round((len - 1) / 2);
        } else {
            return len - 1;
        }
    }
}

export enum LabelAttach {
    Left,
    Center,
    Right,
}
