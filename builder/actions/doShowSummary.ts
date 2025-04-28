import chalk from 'chalk';
import type {BuildContext} from '@builder/util/BuildContext.js';

export async function doShowSummary(context: BuildContext): Promise<void> {
    const {paths, partials: {app: {name: appPartialName}}, summary} = context;

    const {global, standalonePartials, partials} = await summary.render(context.partials);
    console.log(`🕺 ${chalk.bold('We did it!')} 🎉`);
    console.log(chalk.green('Your environment has been successfully built.'));
    console.log(chalk.bold('The finished environment can be found here: ' + paths.outputDir));
    console.log(chalk.bold('Your app partial is: ' + appPartialName));
    if (global.length > 0) {
        console.log('');
        console.log('🌍 Global messages:');
        console.log(global);
    }

    if (standalonePartials.length > 0) {
        console.log('');
        console.log('🧪 Technologies:');
        console.log(standalonePartials);
    }

    if (partials.length > 0) {
        console.log('');
        console.log('🔨 Tools:');
        console.log(partials);
    }
}
