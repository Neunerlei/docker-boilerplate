import chalk from 'chalk';

const uiInfoOnceMap = new Map<string, boolean>();

/**
 * Prints the given message to the console with a yellow "🤓" prefix.
 * @param message
 * @param title
 */
export function uiLogInfo(message: string, title?: string): void {
    message = chalk.blue(message);
    if (title) {
        message = `${chalk.blueBright.bold(title)}\n${message}`;
    }
    console.log(`${chalk.blueBright.bold('!?')} ${message}`);
}

/**
 * Prints the given message to the console with a yellow "🤓" prefix, but only once for each unique key.
 * @param key
 * @param message
 * @param title
 */
export function uiLogInfoOnce(key: string, message: string, title?: string): void {
    if (uiInfoOnceMap.has(key)) {
        return;
    }

    uiInfoOnceMap.set(key, true);
    uiLogInfo(message, title);
}

/**
 * Formats a block of text to fit within 100 characters per line.
 * It also normalizes whitespace and handles paragraphs.
 * @param rawText
 *
 * @example
 *
 * ```ts
 * const text = uiTextBlock(`This is a long text that should be formatted to fit within 100 characters per line.
 * It also handles paragraphs and normalizes whitespace.
 *
 * This is a new paragraph.
 * It should be separated by a double newline.
 * `);
 * ```
 */
export function uiTextBlock(rawText: string): string {
    const maxWidth = 100;

    const visibleLength = (str: string): number => {
        // This regex matches ANSI color/formatting codes
        return str.replace(/\u001b\[\d+(;\d+)*m/g, '').length;
    };

    const paragraphs = rawText.split(/\n\s*\n/);

    return paragraphs.map(paragraph => {
        const normalizedText = paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

        const words = normalizedText.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        let visibleLineLength = 0;

        words.forEach(word => {
            const wordVisibleLength = visibleLength(word);

            if (!currentLine) {
                currentLine = word;
                visibleLineLength = wordVisibleLength;
            } else if (visibleLineLength + wordVisibleLength + 1 <= maxWidth) {
                currentLine += ' ' + word;
                visibleLineLength += wordVisibleLength + 1; // +1 for the space
            } else {
                lines.push(currentLine);
                currentLine = word;
                visibleLineLength = wordVisibleLength;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.join('\n');
    }).join('\n\n');
}

/**
 * Formats a text by prefixing it with a namespace for easier identification in the console.
 * @param namespace
 * @param text
 */
export function uiTextNs(namespace: string, text: string): string {
    return `[${namespace}] ${text}`;
}

/**
 * Returns a function that formats a text by prefixing it with a namespace for easier identification in the console.
 * The resulting function does the same as `uiTextNs`, but does not need to pass the namespace each time.
 * @param namespace
 */
export function uiTextNsGetter(namespace: string): (text: string) => string {
    return (text: string) => uiTextNs(namespace, text);
}
