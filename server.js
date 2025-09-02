const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = {}; // playerId -> ws

wss.on('connection', function connection(ws) {
  let playerId = null;

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.join) {
      playerId = data.join;
      clients[playerId] = ws;

      // Notify all other clients about the new player
      broadcast({ join: playerId, color: data.color }, playerId);

      // Send all existing players to the new player
      Object.keys(clients).forEach(id => {
        if (id !== playerId) {
          ws.send(JSON.stringify({ join: id, color: 0xff44ff }));
        }
      });
    }

    if (data.move) {
      // Broadcast movement to all except sender
      broadcast(data, playerId);
    }

    if (data.leave) {
      broadcast({ leave: data.leave }, playerId);
      delete clients[data.leave];
    }
  });

  ws.on('close', function() {
    if (playerId) {
      broadcast({ leave: playerId }, playerId);
      delete clients[playerId];
    }
  });
});

function broadcast(msg, exceptId) {
  Object.entries(clients).forEach(([id, clientWs]) => {
    if (id !== exceptId && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify(msg));
    }
  });
}

console.log('WebSocket server running on ws://localhost:8080');
