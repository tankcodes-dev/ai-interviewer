import "dotenv/config";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.js";
import { zodTextFormat } from "openai/helpers/zod.js";
import { z } from "zod";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const InterviewerResponse = z.object({
	intro: z.string().optional().nullable(),
	user_response: z.string(),
	analysis: z.object({
		overall_feedback: z.string(),
		breakdown: z.array(
			z.object({
				category: z.string(),
				feedback: z.string(),
			})
		),
	}),
	improved_sample_response: z.string(),
	nextQuestion: z.string(),
});

export function buildBaseHistory(resume: string, jd: string): ResponseInput {
	const baseHistory: ResponseInput = [
		{
			role: "system",
			content: `Act as a strict interviewer coach. Based on the job description and the user's resume, conduct a high-pressure mock interview. Critically analyze each response, identify weaknesses, and push the user to clarify vague or shallow answers. Provide improved sample response where necessary. Continously adapt your questions based on previous answers, targeting gaps in knowledge, communication, and experience. The objective is to prepare the user for the tough real-world interviews.`,
		},
		{
			role: "user",
			content: [
				{
					type: "input_image",
					image_url: `data:image/jpeg;base64,${jd}`,
					detail: "auto",
				},
				{
					type: "input_file",
					filename: "resume.pdf",
					file_data: `data:application/pdf;base64,${resume}`,
				},
			],
		},
		{
			role: "developer",
			content:
				"Begin the mock interview after the user sends their first text message.",
		},
	];

	return baseHistory;
}

export async function aiResponse(history: ResponseInput) {
	console.log("Inside ai response");
	const response = await openai.responses.parse({
		model: "gpt-5-nano-2025-08-07",
		input: history,
		text: {
			format: zodTextFormat(InterviewerResponse, "analysis"),
		},
		prompt_cache_key: "tankcodes-ai-interviewer",
	});
	console.log("response generated");

	console.log(JSON.stringify(response.output_parsed));

	return response;
}

/* const jbImage = fs.readFileSync("C:/Users/Dell/OneDrive/Desktop/jd.jpg");
const dataImage = jbImage.toString("base64");
const data = fs.readFileSync("C:/Users/Dell/OneDrive/Desktop/resume.pdf");
const resume = data.toString("base64");

const history = buildBaseHistory(resume, dataImage); */

/* try {
	const response = aiResponse(history);
	console.log(JSON.stringify(response));
} catch (error) {
	console.log(error);
} */
