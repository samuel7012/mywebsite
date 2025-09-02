const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

/**
 * Structure:
 * clients = {
 *   playerId: { ws: WebSocket, color: Number }
 * }
 */
let clients = {};

// Helper: Send a message to one client safely
function safeSend(ws, msgObj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msgObj));
  }
}

// Helper: Broadcast a message to all clients except 'exceptId'
function broadcast(msgObj, exceptId = null) {
  Object.entries(clients).forEach(([id, client]) => {
    if (id !== exceptId) {
      safeSend(client.ws, msgObj);
    }
  });
}

wss.on('connection', function connection(ws) {
  let playerId = null;
  let playerColor = null;

  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      safeSend(ws, { type: "error", message: "Invalid JSON" });
      return;
    }

    // Handle player joining
    if (data.type === 'join' && typeof data.playerId === 'string') {
      playerId = data.playerId;
      playerColor = typeof data.color === 'number' ? data.color : 0xff44ff;
      clients[playerId] = { ws, color: playerColor };

      // Notify all other clients about the new player
      broadcast({ type: 'player_join', playerId, color: playerColor }, playerId);

      // Send current player list to the new player
      const currentPlayers = Object.entries(clients)
        .filter(([id]) => id !== playerId)
        .map(([id, client]) => ({ playerId: id, color: client.color }));
      safeSend(ws, { type: 'player_list', players: currentPlayers });
      return;
    }

    // Handle player movement
    if (data.type === 'move' && playerId && data.move) {
      // Broadcast movement to all except sender
      broadcast({ type: 'player_move', playerId, move: data.move }, playerId);
      return;
    }

    // Handle player leaving (explicit)
    if (data.type === 'leave' && playerId) {
      broadcast({ type: 'player_leave', playerId }, playerId);
      delete clients[playerId];
      playerId = null;
      return;
    }

    // Unknown message type
    safeSend(ws, { type: "error", message: "Unknown message type or not joined" });
  });

  ws.on('close', function() {
    if (playerId) {
      broadcast({ type: 'player_leave', playerId }, playerId);
      delete clients[playerId];
      playerId = null;
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
