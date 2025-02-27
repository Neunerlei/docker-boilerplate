export function replaceMarkerWithIndent(marker: string, replacement: string, content: string) {
    const lines = content.split('\n');
    const indent = lines.find(line => line.includes(marker))?.match(/^\s*/)?.[0] || '';
    const replacementLines = replacement.split('\n').map(line => indent + line);
    return content.replace(marker, replacementLines.join('\n').trimStart());
}
