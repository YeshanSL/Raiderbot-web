// Add to your bot project as src/status-server.js, then in index.js (after creating `client`):
//   require('./src/status-server')(client);
// Hosts like Railway/Render give you a public URL and set process.env.PORT automatically.
const http = require('http');

module.exports = (client, port = process.env.PORT || 3000) => {
  http.createServer((req, res) => {
    if (req.url.startsWith('/status')) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({
        online: client.isReady(),
        ping: Math.round(client.ws.ping),
        servers: client.guilds.cache.size,
        users: client.guilds.cache.reduce((n, g) => n + g.memberCount, 0),
        uptime: Math.floor((client.uptime || 0) / 1000), // seconds
      }));
    }
    res.writeHead(404); res.end();
  }).listen(port, () => console.log(`Status endpoint on :${port}/status`));
};
