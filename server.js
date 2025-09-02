const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store player info: playerId -> { ws, color, position }
let clients = {};

/**
 * Send a message to a WebSocket safely.
 */
function safeSend(ws, msgObj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msgObj));
  }
}

/**
 * Broadcast a message to all clients except `exceptId` (if given).
 */
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

    // JOIN message: { type: "join", playerId: "...", color: 0x.... }
    if (data.type === 'join' && typeof data.playerId === 'string') {
      playerId = data.playerId;
      playerColor = typeof data.color === 'number' ? data.color : 0xff44ff;
      clients[playerId] = { ws, color: playerColor, position: { x: 0, y: 0 } };

      // Notify others about the new player
      broadcast({ type: 'player_join', playerId, color: playerColor }, playerId);

      // Send all existing players to the new player
      const existingPlayers = Object.entries(clients)
        .filter(([id]) => id !== playerId)
        .map(([id, client]) => ({
          playerId: id,
          color: client.color,
          position: client.position
        }));
      safeSend(ws, { type: 'player_list', players: existingPlayers });
      return;
    }

    // MOVE message: { type: "move", move: { x, y } }
    if (data.type === 'move' && playerId && data.move &&
        typeof data.move.x === 'number' && typeof data.move.y === 'number') {
      // Update server-side position
      clients[playerId].position = { x: data.move.x, y: data.move.y };

      // Broadcast movement
      broadcast({
        type: 'player_move',
        playerId,
        position: clients[playerId].position
      }, playerId);
      return;
    }

    // Explicit LEAVE: { type: "leave" }
    if (data.type === 'leave' && playerId) {
      broadcast({ type: 'player_leave', playerId }, playerId);
      delete clients[playerId];
      playerId = null;
      return;
    }

    // Legacy move support: { move: { x, y } }
    if (data.move && !data.type && playerId &&
        typeof data.move.x === 'number' && typeof data.move.y === 'number') {
      clients[playerId].position = { x: data.move.x, y: data.move.y };
      broadcast({
        type: 'player_move',
        playerId,
        position: clients[playerId].position
      }, playerId);
      return;
    }

    // Unknown or malformed message
    safeSend(ws, { type: "error", message: "Unknown message type or missing fields" });
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
