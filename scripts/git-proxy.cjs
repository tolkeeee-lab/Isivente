const http = require('http');
const net = require('net');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const server = http.createServer((req, res) => {
  res.writeHead(405);
  res.end('Use CONNECT');
});

server.on('connect', (req, clientSocket, head) => {
  const [host, portStr] = req.url.split(':');
  const port = parseInt(portStr, 10) || 443;

  dns.resolve4(host, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      console.error(`DNS resolution failed for ${host}:`, err ? err.message : 'No address');
      clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      clientSocket.end();
      return;
    }

    const targetIp = addresses[0];
    const serverSocket = net.connect(port, targetIp, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length > 0) serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (e) => {
      console.error(`Socket error connecting to ${targetIp}:${port}`, e.message);
      clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      clientSocket.end();
    });

    clientSocket.on('error', () => {
      serverSocket.destroy();
    });
  });
});

server.listen(8999, '127.0.0.1', () => {
  console.log('PROXY_READY: listening on 127.0.0.1:8999');
});
