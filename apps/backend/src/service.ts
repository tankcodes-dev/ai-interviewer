import "dotenv/config";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.js";
import { zodTextFormat } from "openai/helpers/zod.js";
import { z } from "zod";
import PromptSync from "prompt-sync";

const prompt = PromptSync();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const InterviewerResponse = z.object({
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

let history: ResponseInput = [
	{
		role: "system",
		content: `Act as a strict interviewer coach. Based on the job description and the user's resume, conduct a high-pressure mock interview. Critically analyze each response, identify weaknesses, and push the user to clarify vague or shallow answers. Provide improved sample response where necessary. Continously adapt your questions based on previous answers, targeting gaps in knowledge, communication, and experience. The objective is to prepare the user for the tough real-world interviews`,
	},
	{
		role: "user",
		content: [
			{
				type: "input_image",
				image_url:
					"https://oujyvjxywxhipuabxmvj.supabase.co/storage/v1/object/public/resumes/Screenshot%202026-01-13%20125437.jpg",
				detail: "auto",
			},
			{
				type: "input_file",
				file_url:
					"https://oujyvjxywxhipuabxmvj.supabase.co/storage/v1/object/public/resumes/Shwetank%20Agarwal%20Resume%20Latest-2%20(1).pdf",
			},
			{
				type: "input_text",
				text: "Start with the mock interview now.",
			},
		],
	},
	{
		role: "assistant",
		content: ``,
	},
];

let count = 0;

while (count < 5) {
	const response = await openai.responses.parse({
		model: "gpt-4o-mini",
		input: history,
		text: {
			format: zodTextFormat(InterviewerResponse, "analysis"),
		},
	});

	console.log(JSON.stringify(response.output_parsed));

	history = [
		...history,
		...response.output.map((el) => {
			delete el.id;
			return el;
		}),
	];

	const user_input = prompt("Your answer: ");

	history.push({
		role: "user",
		content: `${user_input}`,
	});

	count++;
}
