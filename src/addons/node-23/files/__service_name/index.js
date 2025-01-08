console.log("PROJECT_ENV: " + process.env.PROJECT_ENV + " | NODE_ENV: " + process.env.NODE_ENV);
console.log("ARGS: ", process.argv);

if (process.argv.includes('build')) {
    console.log("Building the project...");
    require('fs').writeFileSync('/var/www/html/dist/index.js', 'console.log("Build finished");');
    process.exit(0);
}

setInterval(() => {
    console.log("Node app is still running! Waiting 10 seconds...");
}, 10000);

import { Server } from 'http';

const port = '8000';

const app = new Server();

app.on('request', (_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World');
    res.end('\n');
});

app.listen(port, () => {
    console.log(`Node app is listening on port ${port}`);
});