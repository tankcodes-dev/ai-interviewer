"use client";

import { ws } from "./hooks/useSocket";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Zap, Shield, Target, ArrowRight } from "lucide-react";

export default function HomeClient() {
	const formRef = useRef<HTMLFormElement | null>(null);
	const router = useRouter();

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
			ws.send(await resume.arrayBuffer());
			ws.send(await jd.arrayBuffer());
			ws.send(JSON.stringify({ type: "START" }));

			router.push("/interview");
		} catch (err) {
			console.error("Upload failed", err);
			alert("Failed to upload files");
		}
	};

	return (
		<main className="min-h-screen bg-[#0B1120] text-slate-300 selection:bg-teal-500/30">
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c4e] via-[#0B1120] to-[#0B1120] -z-10" />

			<div className="container mx-auto px-4 py-12 max-w-5xl flex flex-col items-center">
				{/* Header */}
				<div className="text-center mb-12 space-y-6">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-teal-400 text-xs">
						<Zap size={12} />
						AI-Powered Interview Prep
					</div>

					<h1 className="text-5xl md:text-6xl font-bold text-white">
						Mock Interview <br />
						<span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
							Platform
						</span>
					</h1>

					<p className="max-w-2xl mx-auto text-slate-400 text-lg">
						Upload your resume and job description. Our AI
						interviewer will conduct a high-pressure mock interview.
					</p>
				</div>

				{/* Upload Card */}
				<div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
					<h2 className="text-xl font-semibold text-white text-center mb-8">
						Upload Your Documents
					</h2>

					<form
						ref={formRef}
						onSubmit={(e) => {
							e.preventDefault();
							formRef.current &&
								uploadFiles(new FormData(formRef.current));
						}}
						className="space-y-8"
					>
						<div className="grid md:grid-cols-2 gap-6">
							{/* JD */}
							<label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 transition">
								<FileText className="w-6 h-6 text-teal-400 mb-3" />
								<p className="text-white font-semibold">
									{jdName ?? "Job Description"}
								</p>
								<p className="text-xs text-slate-500">
									PNG / JPG
								</p>
								<input
									type="file"
									name="jd"
									accept="image/png, image/jpeg"
									required
									className="hidden"
									onChange={(e) =>
										setJdName(
											e.target.files?.[0]?.name ?? null
										)
									}
								/>
							</label>

							{/* Resume */}
							<label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 transition">
								<FileText className="w-6 h-6 text-teal-400 mb-3" />
								<p className="text-white font-semibold">
									{resumeName ?? "Your Resume"}
								</p>
								<p className="text-xs text-slate-500">
									PDF only
								</p>
								<input
									type="file"
									name="resume"
									accept="application/pdf"
									required
									className="hidden"
									onChange={(e) =>
										setResumeName(
											e.target.files?.[0]?.name ?? null
										)
									}
								/>
							</label>
						</div>

						<button
							type="submit"
							className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold py-4 rounded-xl hover:scale-[1.01]"
						>
							Start Interview Prep
							<ArrowRight size={18} />
						</button>
					</form>
				</div>

				{/* Footer Features */}
				<div className="grid md:grid-cols-3 gap-6 mt-16 w-full">
					{[
						{ icon: Target, title: "Role-Specific Questions" },
						{ icon: Zap, title: "Real-Time Feedback" },
						{ icon: Shield, title: "High-Pressure Simulation" },
					].map((f, i) => (
						<div
							key={i}
							className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl text-center"
						>
							<f.icon className="mx-auto text-teal-400 mb-3" />
							<h3 className="text-white font-semibold">
								{f.title}
							</h3>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
