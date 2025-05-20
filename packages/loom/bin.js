#!/usr/bin/env node
// This import is crucial to upgrade Node.js to Typescript.
// See https://tsx.is/dev-api/entry-point#entry-point
import 'tsx';

await import('./entrypoint.ts');
