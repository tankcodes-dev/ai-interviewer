"use client";

import { ws } from "./hooks/useSocket";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Upload,
	FileText,
	Zap,
	Shield,
	Target,
	ArrowRight,
} from "lucide-react";

export default function Home() {
	const formRef = useRef<HTMLFormElement | null>(null);
	const router = useRouter();

	// State for UI feedback only (to show selected filenames)
	const [resumeName, setResumeName] = useState<string | null>(null);
	const [jdName, setJdName] = useState<string | null>(null);

	const uploadFiles = async (formData: FormData) => {
		const resume = formData.get("resume") as File;
		const jd = formData.get("jd") as File;

		if (!resume || !jd || resume.size === 0 || jd.size === 0) {
			alert("Both files are required");
			return;
		}

		try {
			const resumeBuffer = await resume.arrayBuffer();
			const jdBuffer = await jd.arrayBuffer();

			ws.send(resumeBuffer);
			ws.send(jdBuffer);

			// Start interview after sending files
			ws.send(JSON.stringify({ type: "START" }));

			router.push("/interview");
		} catch (error) {
			console.error("Upload failed", error);
			alert("Failed to upload files");
		}
	};

	return (
		<main className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-teal-500/30">
			{/* Background Gradient Effect */}
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c4e] via-[#0B1120] to-[#0B1120] -z-10" />

			<div className="container mx-auto px-4 py-12 max-w-5xl flex flex-col items-center">
				{/* Header Section */}
				<div className="text-center mb-12 space-y-6">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-teal-400 text-xs font-medium backdrop-blur-sm">
						<Zap size={12} />
						<span>AI-Powered Interview Prep</span>
					</div>

					<h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
						Mock Interview <br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
							Platform
						</span>
					</h1>

					<p className="max-w-2xl mx-auto text-slate-400 text-lg">
						Upload your resume and job description. Our AI
						interviewer will conduct a high-pressure mock interview
						to prepare you for the real thing.
					</p>
				</div>

				{/* Main Form Card */}
				<div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
					<h2 className="text-xl font-semibold text-white text-center mb-8">
						Upload Your Documents
					</h2>

					<form
						ref={formRef}
						onSubmit={(e) => {
							e.preventDefault();
							if (formRef.current) {
								const formData = new FormData(formRef.current);
								uploadFiles(formData);
							}
						}}
						className="space-y-8"
					>
						<div className="grid md:grid-cols-2 gap-6">
							{/* Job Description Input */}
							<div className="relative group">
								<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-slate-800/50 transition-all duration-300">
									<div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
										<div className="p-3 bg-slate-800 rounded-lg mb-3 group-hover:bg-slate-700 transition">
											<FileText className="w-6 h-6 text-teal-400" />
										</div>
										<p className="mb-1 text-sm font-semibold text-white">
											{jdName
												? jdName
												: "Job Description"}
										</p>
										<p className="text-xs text-slate-500">
											{jdName
												? "Ready to upload"
												: "PNG only (max 10MB)"}
										</p>
									</div>
									<input
										type="file"
										name="jd"
										accept="image/png, image/jpeg, .jpg" 
										required
										className="hidden"
										onChange={(e) =>
											setJdName(
												e.target.files?.[0]?.name ||
													null
											)
										}
									/>
								</label>
							</div>

							{/* Resume Input */}
							<div className="relative group">
								<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-slate-800/50 transition-all duration-300">
									<div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
										<div className="p-3 bg-slate-800 rounded-lg mb-3 group-hover:bg-slate-700 transition">
											<FileText className="w-6 h-6 text-teal-400" />
										</div>
										<p className="mb-1 text-sm font-semibold text-white">
											{resumeName
												? resumeName
												: "Your Resume"}
										</p>
										<p className="text-xs text-slate-500">
											{resumeName
												? "Ready to upload"
												: "PDF only (max 10MB)"}
										</p>
									</div>
									<input
										type="file"
										name="resume"
										accept="application/pdf"
										required
										className="hidden"
										onChange={(e) =>
											setResumeName(
												e.target.files?.[0]?.name ||
													null
											)
										}
									/>
								</label>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] shadow-lg shadow-teal-900/20"
						>
							Start Interview Prep
							<ArrowRight size={18} />
						</button>
					</form>
				</div>

				{/* Features Footer */}
				<div className="grid md:grid-cols-3 gap-6 mt-16 w-full">
					{[
						{
							icon: Target,
							title: "Role-Specific Questions",
							desc: "AI tailors questions based on your job description",
						},
						{
							icon: Zap,
							title: "Real-Time Feedback",
							desc: "Get instant critiques on your responses",
						},
						{
							icon: Shield,
							title: "High-Pressure Simulation",
							desc: "Prepare for the toughest interview scenarios",
						},
					].map((feature, i) => (
						<div
							key={i}
							className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center hover:bg-slate-800/30 transition duration-300"
						>
							<div className="p-3 bg-slate-950 rounded-lg mb-4 text-teal-400 border border-slate-800">
								<feature.icon size={24} />
							</div>
							<h3 className="text-white font-semibold mb-2">
								{feature.title}
							</h3>
							<p className="text-sm text-slate-500 leading-relaxed">
								{feature.desc}
							</p>
						</div>
					))}
				</div>

				<footer className="mt-16 text-slate-600 text-xs">
					Powered by advanced AI to give you the competitive edge
				</footer>
			</div>
		</main>
	);
}
