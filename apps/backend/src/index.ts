import express, { Application, Request, Response } from "express";
import cors from "cors";

const PORT = process.env.PORT;
const app: Application = express();

app.use(cors(), express.json());

//upload documents
app.post("/upload-documents", (req: Request, res: Response) => {
    const request = req
})

//start chat

//end chat

app.listen(PORT);
