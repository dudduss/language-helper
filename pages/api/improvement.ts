import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type ImprovementRequest = {
  message: string;
};

var configuration: Configuration;
var openai: OpenAIApi;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === "POST") {
    const improvementRequest = req.body as ImprovementRequest;
    const improvement = await generateImprovement(improvementRequest.message);

    res.status(200).json(improvement);
  }
}

function constructPrompt(message: string): string {
  let prompt = `Correct the Spanish sentence below in Spanish. Mention what you changed in the correction and why in a simple manner. If there are no issues, just say "Looks good!".\n\n${message}`;
  return prompt;
}

async function generateImprovement(message: string): Promise<string> {
  if (!configuration) {
    configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  }

  console.log("constructPrompt", constructPrompt(message));

  const improvement = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: constructPrompt(message),
    temperature: 0.16,
    max_tokens: 256,
    n: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const choices: string[] = improvement.data.choices.map(
    (choice) => choice.text!
  );

  console.log("choices: ", choices);

  return choices[0].includes("Looks good!") ? "" : choices[0];
}
