const WebSocket = require("ws");

function startWsServer(server, getSnapshot) {
  const wss = new WebSocket.Server({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "hello", ts: Date.now() }));
  });
  setInterval(() => {
    const snapshot = getSnapshot();
    if (!snapshot) return;
    const msg = JSON.stringify({ type: "indices", data: snapshot });
    wss.clients.forEach((c) => c.readyState === WebSocket.OPEN && c.send(msg));
  }, 10000);
}
module.exports = { startWsServer };
