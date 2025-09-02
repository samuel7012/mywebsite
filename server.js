const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map(); // playerId -> { ws, color, position }

function safeSend(ws, msgObj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msgObj));
  }
}

function broadcast(msgObj, exceptId = null) {
  for (const [id, client] of clients.entries()) {
    if (id !== exceptId) {
      safeSend(client.ws, msgObj);
    }
  }
}

function handleJoin(ws, data) {
  const { playerId, color } = data;
  if (!playerId || typeof playerId !== 'string') {
    safeSend(ws, { type: 'error', message: 'Missing or invalid playerId' });
    return;
  }

  const playerColor = typeof color === 'number' ? color : 0xff44ff;
  clients.set(playerId, { ws, color: playerColor, position: { x: 0, y: 0 } });

  console.log(`Player joined: ${playerId}`);

  broadcast({ type: 'player_join', playerId, color: playerColor }, playerId);

  const existingPlayers = [...clients.entries()]
    .filter(([id]) => id !== playerId)
    .map(([id, client]) => ({
      playerId: id,
      color: client.color,
      position: client.position
    }));

  safeSend(ws, { type: 'player_list', players: existingPlayers });

  return playerId;
}

function handleMove(playerId, data) {
  const client = clients.get(playerId);
  if (!client || !data.move || typeof data.move.x !== 'number' || typeof data.move.y !== 'number') {
    return;
  }

  client.position = { x: data.move.x, y: data.move.y };
  broadcast({ type: 'player_move', playerId, position: client.position }, playerId);
}

function handleLeave(playerId) {
  if (clients.has(playerId)) {
    broadcast({ type: 'player_leave', playerId }, playerId);
    clients.delete(playerId);
    console.log(`Player left: ${playerId}`);
  }
}

wss.on('connection', (ws) => {
  let playerId = null;

  console.log('New connection established');

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      safeSend(ws, { type: 'error', message: 'Invalid JSON format' });
      return;
    }

    switch (data.type) {
      case 'join':
        playerId = handleJoin(ws, data);
        break;

      case 'move':
        if (playerId) handleMove(playerId, data);
        break;

      case 'leave':
        if (playerId) {
          handleLeave(playerId);
          playerId = null;
        }
        break;

      default:
        // Legacy move support
        if (data.move && playerId) {
          handleMove(playerId, data);
        } else {
          safeSend(ws, { type: 'error', message: 'Unknown message type or missing fields' });
        }
    }
  });

  ws.on('close', () => {
    if (playerId) {
      handleLeave(playerId);
    }
    console.log('Connection closed');
  });
});

console.log('✅ WebSocket server running on ws://localhost:8080');
