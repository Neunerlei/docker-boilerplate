import * as path from "path";

export const builderDir = path.join(import.meta.dirname!, '..');
export const rootDir = path.join(builderDir, '..');
export const srcDir = path.join(rootDir, 'src')
export const definitionDir = path.join(srcDir, 'boilerplates');
export const baseDir = path.join(srcDir, 'base');
export const addonDir = path.join(srcDir, 'addons');
export const distDir = path.join(rootDir, 'out');
