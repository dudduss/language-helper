import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { ImprovementResponse } from "../../public/schemas";

type ImprovementRequest = {
  message: string;
};

var configuration: Configuration;
var openai: OpenAIApi;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImprovementResponse>
) {
  if (req.method === "POST") {
    const improvementRequest = req.body as ImprovementRequest;
    const improvement = await generateImprovement(improvementRequest.message);

    res.status(200).json(improvement);
  }
}

function constructPrompt(message: string): string {
  let prompt = `Correct the Spanish sentence below in Spanish on one line. Mention what you changed in the correction and why in a simple manner on a separate line. If there are no issues, just say \"Looks good!\".\n\nSpanish Sentence: En mi opinion, me gusta la chocolate.\n\nEn mi opinión, me gusta el chocolate.\n(Changed \"la\" to \"el\" because \"chocolate\" is a masculine noun.)\n\nSpanish Sentence:${message}`;
  return prompt;
}

async function generateImprovement(
  message: string
): Promise<ImprovementResponse> {
  if (!configuration) {
    configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  }

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: constructPrompt(message),
    temperature: 0.16,
    max_tokens: 256,
    n: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const choices: string[] = response.data.choices.map((choice) => choice.text!);

  if (choices.length === 0) {
    return {
      improvement: "",
      reason: "",
    };
  }

  const trimmedResponse = choices[0].replace(/\n/g, "");

  if (trimmedResponse.includes("Looks good!")) {
    return {
      improvement: "",
      reason: "",
    };
  }

  const regex = /^(.*)\((.*)\)/;
  const regexParts = trimmedResponse.match(regex) as RegExpMatchArray;

  const improvement = regexParts[1];
  const reason = regexParts[2];

  return {
    improvement,
    reason,
  };
}
