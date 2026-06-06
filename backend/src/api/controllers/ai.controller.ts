import { NextFunction, Request, Response } from "express";
import { AIService } from "../../services/ai.service";

export class AIController {
    private aiService: AIService

    constructor(aiService: AIService) {
        this.aiService = aiService
    }

    chatHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { role, prompt } = req.body;

            if (!role || !prompt) {
                res.status(400).json({
                    error: "role and prompt are required",
                });
                return;
            }

            const answer = await this.aiService.getAnswer(role, prompt);

            res.json({
                success: true,
                answer,
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error: "Failed to generate response",
            });
        }
    }


    streamHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { role, prompt } = req.body;

            if (!role || !prompt) {
                res.status(400).json({
                    error: "role and prompt are required",
                });
                return;
            }

            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // can store in buffer with a chunk size and if the buffer size >= chunk size send the data using write


            const stream = await this.aiService.streamAnswer(role, prompt);

            for await (const part of stream) {
                res.write(
                    `data: ${JSON.stringify({
                        content: part.message.content
                    })}\n\n`
                );
            }

            res.write("event: done\ndata: {}\n\n");
            res.end();

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error: "Failed to generate response",
            });
        }
    }
}