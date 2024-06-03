import { createProgram } from 'typescript';

import { globSync } from 'fast-glob';
import { Host } from './host';
import { parse } from 'toml';
import { assert } from './tools';
import { readFileSync } from 'fs';
import { repo } from './repo';

const options = parse(readFileSync(assert(process.argv[2]), 'utf-8'));
const program = createProgram({
    options: {},
    rootNames: globSync(options.path),
});

const host = new Host(program, options);
repo(host);

host.run();
