import type { StringLiteralType } from 'typescript';
import { TypeFlags, type Node, type Type, type TypeChecker } from 'typescript';
import type { Host } from './host';

export class Typeck {
    public constructor(public readonly host: Host) {}

    public ctx(): TypeChecker {
        return this.host.program.getTypeChecker();
    }

    public ty_of(n: Node): Ty<Type> {
        return new Ty(this, this.ctx().getTypeAtLocation(n));
    }
}

export class Ty<T extends Type> {
    public constructor(
        public readonly typeck: Typeck,
        public readonly type: T
    ) {}

    public to_string(): string {
        return this.typeck.ctx().typeToString(this.type);
    }

    public has_flag(f: TypeFlags): boolean {
        return this.type.flags === f;
    }

    public has_any_flag(i: Iterable<TypeFlags>): boolean {
        for (const v of i) {
            if (this.has_flag(v)) {
                return true;
            }
        }

        return false;
    }

    public is_string(): boolean {
        return this.has_any_flag([TypeFlags.String, TypeFlags.StringLiteral]);
    }

    public is_string_literal(): this is Ty<StringLiteralType> {
        return this.has_flag(TypeFlags.StringLiteral);
    }

    public is_boolean(): boolean {
        return this.has_any_flag([TypeFlags.Boolean, TypeFlags.BooleanLiteral]);
    }

    public is_number(): boolean {
        return this.has_any_flag([TypeFlags.Number, TypeFlags.NumberLiteral]);
    }

    public widen(): Ty<Type> {
        if (this.is_string()) {
            return new Ty(this.typeck, this.typeck.ctx().getStringType());
        }

        return this;
    }
}
