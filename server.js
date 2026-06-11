// Custom Node server entry for Phusion Passenger (InMotion cPanel "Setup Node.js App").
// Passenger sets process.env.PORT and expects the startup file to create an HTTP
// server that listens on it. We hand requests to Next.js's production handler.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Next.js ready on port ${port}`);
  });
});
