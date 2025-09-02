const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const players = {}; // id: {color}

wss.on('connection', function connection(ws) {
  // When a new client connects, send them the list of currently connected players
  ws.on('message', function incoming(data) {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if (msg.join) {
      players[msg.join] = msg.color || 0xffffff;
      // Notify all clients about the new player
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ join: msg.join, color: msg.color }));
        }
      });
      // Send existing players to the new client
      Object.keys(players).forEach(pid => {
        if (pid !== msg.join && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ join: pid, color: players[pid] }));
        }
      });
    }

    if (msg.move) {
      // Broadcast movement to all clients except sender
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }

    if (msg.leave) {
      delete players[msg.leave];
      // Broadcast leave to all clients
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ leave: msg.leave }));
        }
      });
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");
