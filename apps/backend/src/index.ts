import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import multer from "multer";

const PORT = process.env.PORT;
const app: Application = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors(), express.json());

//upload documents
app.post(
	"/upload-documents",
	upload.fields([
		{ name: "resume", maxCount: 1 },
		{ name: "jd", maxCount: 1 },
	]),
	(req: Request, res: Response) => {
		const files = req.files;
		// @ts-ignore
		const jbBuffer = req.files!.jd[0].buffer.toString("base64");
		// @ts-ignore
		const resumeBuffer = req.files!.resume[0].buffer.toString("base64");
		res.send("Uploaded");
	}
);

//start chat

//end chat

app.listen(PORT, (err) => {
	console.log(`Server started at port: ${PORT}`);
});
