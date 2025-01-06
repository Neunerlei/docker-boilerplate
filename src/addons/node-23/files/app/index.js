console.log("PROJECT_ENV: " + process.env.PROJECT_ENV + " | NODE_ENV: " + process.env.NODE_ENV);
console.log("ARGS: ", process.argv);
setInterval(() => {
    console.log("Node app is still running! Waiting 10 seconds...");
}, 10000);

const http = require('http');

const port = '8000';

const app = new http.Server();

app.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World');
    res.end('\n');
});

app.listen(port, () => {
    console.log(`Node app is listening on port ${port}`);
});