import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type Gpt2Request = {
  message: string;
};

var configuration: Configuration;
var openai: OpenAIApi;
var conversation: string[] = []; // conversation history

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === "POST") {
    const gpt2Request = req.body as Gpt2Request;
    conversation.push(gpt2Request.message);

    const nextMessage = await generateNextResponse();

    conversation.push(nextMessage);

    console.log("conversation: ", conversation);

    res.status(200).json(nextMessage);
  }
}

function constructPrompt(): string {
  let prompt = "";
  for (let i = 0; i < conversation.length; i++) {
    prompt += conversation[i] + "\n\n";
  }
  return prompt;
}

async function generateNextResponse(): Promise<string> {
  if (!configuration) {
    configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: constructPrompt(),
    temperature: 0.75,
    max_tokens: 256,
    n: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const choices: string[] = completion.data.choices.map(
    (choice) => choice.text!
  );

  return choices[0];
}
