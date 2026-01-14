"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ws } from "../hooks/useSocket";
import {
	Send,
	User,
	Bot,
	Sparkles,
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	AlertCircle,
	BookOpen,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types for Web Speech API (needed for TypeScript) ---
declare global {
	interface Window {
		webkitSpeechRecognition: any;
		SpeechRecognition: any;
	}
}

// --- Interfaces ---
interface AIResponse {
	intro?: string;
	analysis?: {
		overall_feedback: string;
		breakdown: Array<{ category: string; feedback: string }>;
	};
	improved_sample_response?: string;
	nextQuestion?: string;
}

// --- Helper Component: AI Message (Visuals) ---
const AIMessage = ({ content }: { content: string }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	let parsedData: AIResponse | null = null;
	let isJson = false;

	try {
		parsedData = JSON.parse(content);
		isJson = true;
	} catch (e) {
		isJson = false;
	}

	if (!isJson || !parsedData) {
		return (
			<p className="text-slate-300 text-sm md:text-base whitespace-pre-wrap">
				{content}
			</p>
		);
	}

	const { intro, analysis, improved_sample_response, nextQuestion } =
		parsedData;

	return (
		<div className="flex flex-col gap-4 w-full">
			{intro && (
				<p className="text-slate-300 text-sm leading-relaxed">
					{intro}
				</p>
			)}

			{analysis && (
				<div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
					>
						<div className="flex items-center gap-2 text-amber-400">
							<AlertCircle size={16} />
							<span className="text-sm font-semibold">
								Feedback & Analysis
							</span>
						</div>
						{isExpanded ? (
							<ChevronUp size={16} />
						) : (
							<ChevronDown size={16} />
						)}
					</button>

					{isExpanded && (
						<div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
							<p className="text-slate-300 text-sm italic border-l-2 border-amber-500/30 pl-3">
								"{analysis.overall_feedback}"
							</p>
							<div className="grid gap-3">
								{analysis.breakdown?.map((item, i) => (
									<div key={i} className="text-sm">
										<span className="font-semibold text-slate-200 block mb-1 text-xs uppercase tracking-wider opacity-70">
											{item.category}
										</span>
										<p className="text-slate-400">
											{item.feedback}
										</p>
									</div>
								))}
							</div>
							{improved_sample_response && (
								<div className="mt-4 pt-4 border-t border-slate-700/50">
									<div className="flex items-center gap-2 text-teal-400 mb-2">
										<BookOpen size={14} />
										<span className="text-xs font-bold uppercase">
											Better Answer
										</span>
									</div>
									<div className="bg-teal-950/30 p-3 rounded-lg border border-teal-900/50 text-teal-100/80 text-sm">
										{improved_sample_response}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{nextQuestion && (
				<div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden group">
					<div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
					<h3 className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
						<Sparkles size={14} />
						Next Question
					</h3>
					<p className="text-white font-medium text-lg leading-relaxed">
						{nextQuestion}
					</p>
				</div>
			)}
		</div>
	);
};

// --- Main Component ---
export default function Interview() {
	const [messages, setMessages] = useState<
		{ sender: "AI" | "You"; text: string }[]
	>([]);
	const [input, setInput] = useState("");
	const [aiResponseLoader, setAiResponseLoader] = useState(false);

	// Audio State
	const [isAudioEnabled, setIsAudioEnabled] = useState(true);
	const [isRecording, setIsRecording] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false); // is the AI currently speaking?

	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const recognitionRef = useRef<any>(null);

	// Scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// --- TTS Functionality ---
	const speakText = useCallback(
		(text: string) => {
			if (!isAudioEnabled) return;

			// Cancel any current speech
			window.speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			// Optional: Configure voice (speed, pitch, voice selection)
			utterance.rate = 1;
			utterance.pitch = 1;

			utterance.onstart = () => setIsSpeaking(true);
			utterance.onend = () => setIsSpeaking(false);

			window.speechSynthesis.speak(utterance);
		},
		[isAudioEnabled]
	);

	// --- STT Functionality ---
	const toggleRecording = () => {
		if (isRecording) {
			recognitionRef.current?.stop();
			setIsRecording(false);
			return;
		}

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			alert("Your browser does not support Speech Recognition.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			setIsRecording(true);
			// Stop AI from talking if user interrupts
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		};

		recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			setInput((prev) => prev + (prev ? " " : "") + transcript);
		};

		recognition.onerror = (event: any) => {
			console.error("Speech recognition error", event.error);
			setIsRecording(false);
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognitionRef.current = recognition;
		recognition.start();
	};

	// --- Socket Handler ---
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			try {
				const msg = JSON.parse(event.data);

				if (msg.type === "AI_RESPONSE") {
					const content =
						typeof msg.data === "string"
							? msg.data
							: JSON.stringify(msg.data);
					setAiResponseLoader(false);
					setMessages((prev) => [
						...prev,
						{ sender: "AI", text: content },
					]);

					// Logic to decide what to speak
					if (typeof msg.data === "object") {
						// If it's the structured JSON, prioritize the Intro or Next Question
						const { intro, nextQuestion } = msg.data;
						const textToSpeak = nextQuestion || intro;
						if (textToSpeak) speakText(textToSpeak);
					} else {
						// If it's a plain string, read it
						speakText(content);
					}
				} else if (msg.type === "ERROR") {
					alert(msg.message);
				}
			} catch (e) {
				console.error("Failed to parse socket message", e);
			}
		};

		ws.addEventListener("message", handleMessage);
		return () => {
			ws.removeEventListener("message", handleMessage);
			window.speechSynthesis.cancel(); // Cleanup speech on unmount
		};
	}, [speakText]);

	const sendMessage = () => {
		if (!input.trim()) return;
		if (ws.readyState !== WebSocket.OPEN) {
			alert("Connection lost. Please refresh.");
			return;
		}

		// Stop TTS if user sends a message
		window.speechSynthesis.cancel();
		setIsSpeaking(false);

		ws.send(JSON.stringify({ type: "CHAT", message: input }));
		setMessages((prev) => [...prev, { sender: "You", text: input }]);
		setAiResponseLoader(true);
		setInput("");
	};

	return (
		<main className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-teal-500/30 flex flex-col">
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c4e] via-[#0B1120] to-[#0B1120] -z-10" />

			{/* Header */}
			<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
				<div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
							{isSpeaking ? (
								<Volume2 className="w-5 h-5 text-teal-400 animate-pulse" />
							) : (
								<Bot className="w-5 h-5 text-teal-400" />
							)}
						</div>
						<div>
							<h1 className="text-white font-semibold text-lg">
								AI Interviewer
							</h1>
							<p className="text-xs text-teal-400 font-medium flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
								Live Session
							</p>
						</div>
					</div>

					{/* Audio Toggle Button */}
					<button
						onClick={() => {
							setIsAudioEnabled(!isAudioEnabled);
							if (isAudioEnabled) window.speechSynthesis.cancel();
						}}
						className={`p-2 rounded-lg transition-colors border ${
							isAudioEnabled
								? "bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-700"
								: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
						}`}
						title={
							isAudioEnabled ? "Mute AI Voice" : "Enable AI Voice"
						}
					>
						{isAudioEnabled ? (
							<Volume2 size={20} />
						) : (
							<VolumeX size={20} />
						)}
					</button>
				</div>
			</header>

			{/* Chat Area */}
			<div className="flex-1 container mx-auto px-4 max-w-4xl py-8 flex flex-col gap-6">
				{messages.length === 0 && (
					<div className="text-center py-20 opacity-50">
						<Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-600" />
						<p className="text-slate-500">
							Waiting for AI to start...
						</p>
					</div>
				)}

				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex gap-4 ${msg.sender === "You" ? "flex-row-reverse" : "flex-row"}`}
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
								msg.sender === "You"
									? "bg-teal-600 text-white"
									: "bg-indigo-600 text-white"
							}`}
						>
							{msg.sender === "You" ? (
								<User size={16} />
							) : (
								<Bot size={16} />
							)}
						</div>

						<div
							className={`relative px-5 py-4 rounded-2xl max-w-[85%] shadow-sm ${
								msg.sender === "You"
									? "bg-teal-600 text-white rounded-tr-sm"
									: "bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm w-full"
							}`}
						>
							{msg.sender === "AI" ? (
								<AIMessage content={msg.text} />
							) : (
								<p className="whitespace-pre-wrap">
									{msg.text}
								</p>
							)}
						</div>
					</div>
				))}
				{aiResponseLoader && (
					<div className="space-y-2">
						<Bot size={16} />
						<Skeleton className="h-4 w-[250px] bg-slate-800/80" />
						<Skeleton className="h-4 w-[200px] bg-slate-800/80" />
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="sticky bottom-0 bg-[#0B1120]/90 backdrop-blur-lg border-t border-slate-800 p-4 z-30">
				<div className="container mx-auto max-w-4xl">
					<div className="relative flex items-center gap-3">
						{/* STT Button */}
						<button
							onClick={toggleRecording}
							className={`p-4 rounded-xl transition-all duration-200 flex items-center justify-center ${
								isRecording
									? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
									: "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white"
							}`}
							title="Speak Answer"
						>
							{isRecording ? (
								<MicOff size={20} />
							) : (
								<Mic size={20} />
							)}
						</button>

						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && sendMessage()
							}
							placeholder={
								isRecording
									? "Listening..."
									: "Type your answer here..."
							}
							className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-500"
						/>

						<button
							onClick={sendMessage}
							disabled={!input.trim()}
							className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Send size={20} />
						</button>
					</div>
					<p className="text-center text-xs text-slate-600 mt-2 flex items-center justify-center gap-2">
						{isRecording && (
							<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
						)}
						{isRecording
							? "Listening to your voice..."
							: "Press Enter to send • Toggle Mute in header"}
					</p>
				</div>
			</div>
		</main>
	);
}
