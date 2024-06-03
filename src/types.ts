import type { Category } from './lint';

export interface Config {
    path: string;
    lints: Record<string, LintConfig>;
    categories: Partial<Record<Category, LintConfig>>;
}

export interface LintConfig {
    level: LintLevel;
}

export enum LintLevel {
    Allow = 'allow',
    Warn = 'warn',
    Deny = 'deny',
}
