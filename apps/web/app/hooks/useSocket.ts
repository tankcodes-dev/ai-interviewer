// ws.ts
export const ws = new WebSocket(`${process.env.WS_URL}`);

ws.onopen = () => console.log("WebSocket connected");
ws.onclose = () => console.log("WebSocket disconnected");
ws.onerror = (err) => console.error("WebSocket error:", err);
