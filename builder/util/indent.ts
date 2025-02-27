export function indent(content: string, level?: number) {
    const lines = content.split('\n');
    const indent = '    '.repeat(level ?? 1);
    return lines.map(line => indent + line).join('\n');
}
