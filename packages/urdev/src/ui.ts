const loggedErrors = new Set<string>();

function red(text: string) {
    return `\x1b[31m${text}\x1b[0m`;
}

function bold(text: string) {
    return `\x1b[1m${text}\x1b[22m`;
}

function printErrorIcon() {
    console.error(red(`│╬╗╥╬-══ ═-- ─═════ -══-══ ═-
╞╔╬│╬ ${bold('urdev.weave')}: The fabric is torn
╜╗╬╙╬═--══ ═-- ─══─═══ -══-═─═─══─═─═══ -══-`));
}

export function printError(message: string) {
    printErrorIcon();
    console.error(red(message));
}

export function logError(message: string, reason?: Error) {
    loggedErrors.add(`${message}${reason ? `: ${reason.message}` : ''}`);
}

export function hasLoggedErrors(): boolean {
    return loggedErrors.size > 0;
}

export function printLoggedErrors() {
    if (!hasLoggedErrors()) {
        return;
    }

    console.error(red(bold('Caused by:')));
    console.error(Array.from(loggedErrors).map(error => `${red(error)}`)
        .join('\n')
        .split('\n')
        .map(line => `  ${line}`).join('\n'));
}

export function showSpinner(message = 'Preparing your weave'): () => void {
    const frames = ['╔', '╠', '╚', '╩', '╝', '╣', '╗', '╦'];
    let currentFrame = 0;
    let isActive = true;

    // Hide cursor
    process.stdout.write('\u001B[?25l');

    const interval = setInterval(() => {
        if (!isActive) return;

        const frame = frames[currentFrame];
        process.stdout.write(`\r${frame} ${message}`);
        currentFrame = (currentFrame + 1) % frames.length;
    }, 100);

    // Return cleanup function
    return () => {
        isActive = false;
        clearInterval(interval);

        // Clear line and show cursor again
        process.stdout.write('\r\x1B[K\u001B[?25h');
    };
}
