import type {IFs} from 'memfs';

export function textUtils(content: string, level?: number) {
    const lines = content.split('\n');
    const indent = '    '.repeat(level ?? 1);
    return lines.map(line => indent + line).join('\n');
}

export function replaceInFile(fs: IFs, path: string, search: string | string[], replace: string | string[]): void {
    if (!Array.isArray(search)) {
        search = [search];
    }
    if (!Array.isArray(replace)) {
        replace = [replace];
    }

    if (search.length !== replace.length) {
        throw new Error('Search and replace arrays must have the same length');
    }

    let content = fs.readFileSync(path, 'utf8').toString();

    for (let i = 0; i < search.length; i++) {
        content = content.replace(search[i], replace[i]);
    }

    fs.writeFileSync(path, content);
}
