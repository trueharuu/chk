import type { Node, SourceFile } from 'typescript';

/** Hints to the TypeScript Compiler that the value `T` is not undefined. */
export function hint<T>(t: T | undefined): asserts t is T {
    void t;
}

export function assume<T>(t: unknown): asserts t is T {
    void t;
}

/** Hints to the TypeScript Compiler that the one-time use of the value `T` is not undefined. */
export function assert<T>(t: T | undefined, label: string = 'value'): T {
    if (t === undefined) {
        throw new Error(`${label} was undefined`);
    }
    return t;
}

export function collect<T>(t: Iterable<T>): Array<T> {
    const v = [];
    for (const u of t) {
        v.push(u);
    }

    return v;
}

export function* recursive_children_of<T extends Node>(
    t: T,
    s: SourceFile
): Generator<Node, void, unknown> {
    for (const child of t.getChildren(s)) {
        yield child;
        yield* recursive_children_of(child, s);
    }
}

import { inspect } from 'node:util';
export function inspect2<T>(t: T): string {
    if (typeof t === 'object') {
        return inspect(fix(Object.assign({}, t)), true, Infinity, true);
    } else {
        return inspect(t, true, Infinity, true);
    }
}

function fix<T>(t: T): object {
    for (const key in t) {
        if (typeof t[key] === 'function') {
            delete t[key];
        } else if (typeof t[key] === 'object') {
            t[key] = fix(t[key]) as never;
        }
    }
    return t as never;
}

export function dbg<T>(t: T): T {
    console.log(t);
    return t;
}

export function* windows<T>(t: Iterable<T>, n: number): Generator<Array<T>> {
    const buffer: Array<T> = [];

    for (const item of t) {
        buffer.push(item);

        if (buffer.length === n) {
            yield buffer.slice();
            buffer.shift();
        }
    }

    if (n > buffer.length && buffer.length > 0) {
        yield buffer;
    }
}

export function* filter<T>(t: Iterable<T>, f: (t: T) => boolean): Generator<T> {
    for (const u of t) {
        if (f(u)) yield u;
    }
}
