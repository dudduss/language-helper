import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";
import { DiffText, DiffResponse } from "../../public/schemas";

type DiffRequest = {
  original: string;
  improvement: string;
};

type DiffCheckerAPIResponse = {
  rows: {
    end: boolean;
    left: {
      chunks: {
        value: string;
        type: string;
      }[];
      line: number;
    };
    right: {
      chunks: {
        value: string;
        type: string;
      }[];
      line: number;
    };
    insideChanged: boolean;
    start?: boolean;
  }[];
  added: number;
  removed: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiffResponse>
) {
  if (req.method === "POST") {
    const diffCheckRequest = req.body as DiffRequest;
    const data = {
      left: diffCheckRequest.original,
      right: diffCheckRequest.improvement,
      diff_level: "word",
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        output_type: "json",
        email: process.env.EMAIL_ADDRESS,
      },
    };

    await axios
      .post<DiffCheckerAPIResponse>(
        "https://api.diffchecker.com/public/text",
        data,
        config
      )
      .then((response: AxiosResponse<DiffCheckerAPIResponse>) => {
        const leftValues: DiffText[] = response.data.rows.flatMap((row) => {
          return row.left.chunks.map((chunk) => {
            return { text: chunk.value, type: chunk.type };
          });
        });

        const rightValues: DiffText[] = response.data.rows.flatMap((row) => {
          return row.right.chunks.map((chunk) => {
            return { text: chunk.value, type: chunk.type };
          });
        });

        // console.log("leftValues", leftValues);
        // console.log("rightValues", rightValues);

        res.status(200).json({
          original: leftValues,
          improvement: rightValues,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
