import chalk from 'chalk';

export function doShowWelcome(): void {
    console.log(`       ${chalk.greenBright('.')}                              
      ${chalk.yellow('.')}  ${chalk.blueBright('o')}
       ${chalk.greenBright('o')}     
     ${chalk.blueBright('o')}   ${chalk.redBright('.')}      
   ${chalk.blue('_________')}                       ${chalk.cyan('/|         .|')}             
 ${chalk.yellow('c')}${chalk.blue('(\`       \'\)')}${chalk.yellow('o')}  ${chalk.cyan(',---.,---..    ,  / |---.,---..|    ,---.,---.')}
   ${chalk.blue('\\.     ,/')}    ${chalk.cyan('|---\'|   | \\  /  /  |   ||   |||    |---\'|')}    
  ${chalk.yellow('_//')}${chalk.blue('^---^')}${chalk.yellow('\\\\_')}   ${chalk.cyan('\`---\'\`   \'  \`\'  /   \`---\'\`---\'\`\`---\'\`---\'\`')}
  
${chalk.bold('Build your own docker environments with ease!')}

To create your environment, please answer the following questions:
`);
}
