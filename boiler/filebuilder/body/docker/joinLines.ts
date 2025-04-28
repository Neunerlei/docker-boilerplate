export function joinLines(lines: string[] | { toString(): string }[]): string {
    return lines
        .map((line: string | { toString(): string }) => line.toString().trim())
        .filter(line => line.length > 0)
        // If the line has at least one linebreak join with two \n, otherwise with a single one
        // However, if the next line in the list contains \n, we want this line to end with two \n as well!
        .reduce((result, line, index, array) => {
            const hasLineBreak = line.includes('\n');
            const nextLineHasBreak = index < array.length - 1 && array[index + 1].includes('\n');
            return result + line + (hasLineBreak || nextLineHasBreak ? '\n\n' : '\n');
        }, '')
        .trim();
}
