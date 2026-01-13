import "dotenv/config";
import { WebSocketServer } from "ws";
import { aiResponse, buildBaseHistory } from "./service.js";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import fs from "fs";

const PORT = Number(process.env.WS_PORT || 8081);
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on port ${PORT}`);

wss.on("connection", (socket) => {
	console.log("Client connected");

	let resumeBinary: string | null = null;
	let jdBinary: string | null = null;
	let interviewHistory: ResponseInput | null = null;

	const handleAIResponse = async (userMessage?: string) => {
		if (!interviewHistory) return;

        // Add user's message first
        if (userMessage) {
            interviewHistory.push({ role: "user", content: userMessage });
        }
        
		const response = await aiResponse(interviewHistory);
        
		if (!response || response.error) {
            socket.send("Interviewer is exhausted! Try again later.");
			return;
		}
        
		// Update history with AI output
		interviewHistory = [
            ...interviewHistory,
			...response.output.map((el) => {
                delete el.id;
				return el;
			}),
		];
        

		// Send parsed output to client
		socket.send(
			JSON.stringify({
				type: "AI_RESPONSE",
				data: response.output_parsed,
			})
		);
	};

	let pendingDocs = 2;
	socket.on("message", async (data, isBinary) => {
		if (isBinary) {
			if (pendingDocs === 2) {
				resumeBinary = data.toString("base64");
				pendingDocs--;
                return
			}
			if (pendingDocs === 1) {
                
                jdBinary = data.toString("base64");
                fs.writeFileSync(
					"./text3.txt",
					JSON.stringify(jdBinary)
				);
				pendingDocs--;
                return;
			}
		}

		const msg = JSON.parse(data.toString());

		switch (msg.type) {
			case "START":
				if (!resumeBinary || !jdBinary) {
					socket.send(
						JSON.stringify({
							type: "ERROR",
							message: "Please upload both resume and JD first.",
						})
					);
					return;
				}
				interviewHistory = buildBaseHistory(resumeBinary, jdBinary);
                fs.writeFileSync("./text2.json", JSON.stringify(interviewHistory))
				socket.send(
					JSON.stringify({
						type: "STARTED",
						message: "Interview session started.",
					})
				);
				break;

			case "CHAT":
				if (!interviewHistory) {
					socket.send(
						JSON.stringify({
							type: "ERROR",
							message:
								"Interview not started yet. Send START first.",
						})
					);
					return;
				}
				await handleAIResponse(msg.message);
				break;

			default:
				socket.send(
					JSON.stringify({
						type: "ERROR",
						message: "Unknown message type.",
					})
				);
		}
	});
});
