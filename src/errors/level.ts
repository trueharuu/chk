export enum Level {
    Error,
    Warning,
    Help,
    Note,
    Unspecified,
}

import { LintLevel } from '../types';
export function from_lint_level(level: LintLevel): Level {
    if (level === LintLevel.Allow) {
        throw new Error('unreachable');
    } else if (level === LintLevel.Warn) {
        return Level.Warning;
    } else {
        return Level.Error;
    }
}
