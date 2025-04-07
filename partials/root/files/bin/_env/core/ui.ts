import type {Context} from './Context.js';
import PrettyError from 'pretty-error';

export function getHeader(): string {
    return `|    .        /                
|---..,---.  / ,---.,---..    ,
|   |||   | /  |---'|   | \\  / 
\`---'\`\`   '/   \`---'\`   '  \`'                             
`;
}

export function getErrorHeader(): string {
    return `
|    .        /    |              |
|---..,---.  / ,---|,---.,---.,---|
|   |||   | /  |   ||---',---||   |
\`---'\`\`   '/   \`---'\`---'\`---^\`---'
`;
}

export function getNiceIntroText(context: Context): string {
    const lang = [
        ['Guten Morgen', 'Guten Tag', 'Guten Abend'], // German
        ['Good morning', 'Good day', 'Good evening'], // English
        ['Buenos días', 'Buenos días', 'Buenas noches'], // Spanish
        ['Bonjour', 'Bonne journée', 'Bonsoir'], // French
        ['Godmorgen', 'God dag', 'God aften'], // Danish
        ['Buongiorno', 'Buona giornata', 'Buonasera'], // Italian
        ['Dobro jutro', 'Dobar dan', 'Dobra večer'], // Croatian
        ['Maidin mhaith', 'Dea-lá', 'Dea-oíche'], // Irish
        ['Günaydın', 'Iyi günler', 'İyi aksamlar'], // Turkish
        ['Dobroho ranku', 'Dobroho dnya', 'Dobroho vechora'], // Ukrainian
        ['Dobroye utro', 'Dobryy den\'', 'Dobryy vecher'], // Russian (save for CLI without cyrillic font),
        ['Zǎoshang hǎo', 'měihǎo de yītiān', 'wǎnshàng hǎo'], // Chinese simplified (save for CLI without chinese font),
        ['Bonum mane', 'Bonus dies', 'Bonum vesperam'], // Latin
        ['Sawubona', 'Usuku oluhle', 'Sawubona'], // Zulu
        ['Madainn mhath', 'Latha math', 'Feasgar math'], // Scots Gaelic
        ['Hyvää huomenta', 'Hyvää päivää', 'Hyvää iltaa'], // Finnish
        ['Kaliméra', 'Kalíméra', 'Kaló apógevma'], // Greek
        ['Goeie more', 'Goeie dag', 'Goeienaand'], // Afrikaans,
        ['صبح بخیر', 'روز بخیر', 'عصر بخیر'], // Persian
        ['صباح الخير', 'نهارك سعيد', 'مساء الخير'], // Arabic
        ['おはようございます', 'こんにちは', 'こんばんは'], // Japanese
        ['좋은 아침입니다', '안녕하세요', '안녕하세요'], // Korean
        ['God morgon', 'God dag', 'God kväll'], // Swedish
        ['Bom dia', 'Boa tarde', 'Boa noite'], // Portuguese
        ['Goedemorgen', 'Goedendag', 'Goedenavond'], // Dutch
        ['Dzień dobry', 'Dzień dobry', 'Dobry wieczór'], // Polish
        ['सुप्रभात', 'नमस्ते', 'शुभ संध्या'], // Hindi
        ['בוקר טוב', 'יום טוב', 'ערב טוב'] // Hebrew
    ];
    const h = new Date().getHours();
    const timeKey = h < 12 ? 0 : (h < 18 ? 1 : 2);
    const langKey = (Math.floor(Math.random() * lang.length));
    const prefix = lang[langKey][timeKey];

    return prefix + ', you are using ' + context.getPkg().name + ' v' + context.getPkg().version;
}

export function showNiceIntro(context: Context): void {
    if (context.flags.quiet) {
        return;
    }

    console.log(getNiceIntroText(context));
}

export function getPrettyHelpHeader(context: Context): string {
    return `${getHeader()}
${getNiceIntroText(context)}    
`;
}

export function showPrettyError(error: Error): void {
    if (error.message.includes('User force closed the prompt')) {
        return;
    }

    const header = getErrorHeader();
    console.error('\x1b[31m%s\x1b[0m', header, '\x1b[0m');
    const pe = new PrettyError();
    console.error(pe.render(error));
}
