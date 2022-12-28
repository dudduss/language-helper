import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === "GET") {
    const { name } = req.query;
    if (name === "azure") {
      res.status(200).json(process.env.AZURE_SPEECH_SUBSCRIPTION_KEY!);
    } else {
      res.status(200).json("No other keys");
    }
  }
}
