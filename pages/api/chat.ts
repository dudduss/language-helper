import type { NextApiRequest, NextApiResponse } from "next";
import { ChatGPTAPIBrowser } from "chatgpt";

type ChatRequest = {
  prompt: string;
};

let api: any;
let conversationId: string;
let parentMessageId: string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<String>
) {
  if (req.method === "POST") {
    const chatRequest = req.body as ChatRequest;
    // console.log("chatRequest", chatRequest);

    if (!api) {
      api = new ChatGPTAPIBrowser({
        email: process.env.OPENAI_EMAIL!,
        password: process.env.OPENAI_PASSWORD!,
        isGoogleLogin: true,
      });
      await api.initSession();
    }


    // add a timeout of 10 seconds here
    const result = await api.sendMessage(chatRequest.prompt, {
      conversationId: conversationId || undefined,
      parentMessageId: parentMessageId || undefined,
      timeoutMs: 2 * 60 * 1000,
    });

    console.log("result", result);

    if (!conversationId) {
      conversationId = result.conversationId;
    }

    parentMessageId = result.messageId;

    res.status(200).json(result.response);
  }
}
