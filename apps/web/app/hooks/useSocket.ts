// ws.ts
export const ws = new WebSocket(`ws://localhost:8081`);

ws.onopen = () => console.log("WebSocket connected");
ws.onclose = () => console.log("WebSocket disconnected");
ws.onerror = (err) => console.error("WebSocket error:", err);
