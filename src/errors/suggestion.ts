import type { Span } from './span';

export class Suggestion {
    public substitutions: Array<Substitution> = [];
    public style: SubstitutionStyle = SubstitutionStyle.ShowAlways;
    public applicability: Applicability = Applicability.Unspecified;
}

export enum SubstitutionStyle {
    HideCodeInline,
    HideCodeAlways,
    CompletelyHidden,
    ShowCode,
    ShowAlways,
}

export class Substitution {
    public constructor(public parts: Array<SubstitutionPart> = []) {}
}

export class SubstitutionPart {
    public constructor(
        public readonly span: Span,
        public readonly snippet: string
    ) {}

    public is_addition(): boolean {
        return this.snippet !== '' && !this.replaces_meaningful_content();
    }

    public is_deletion(): boolean {
        return this.snippet === '' && this.replaces_meaningful_content();
    }

    public is_replacement(): boolean {
        return this.snippet !== '' && this.replaces_meaningful_content();
    }

    public replaces_meaningful_content(): boolean {
        return (
            this.span.read(this.span.slice).trim() !== '' ||
            !this.span.is_empty()
        );
    }
}

export enum Applicability {
    MachineApplicable,
    HasPlaceholders,
    MaybeIncorrect,
    Unspecified,
}
