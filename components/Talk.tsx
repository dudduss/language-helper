// create a functional react component with a start, stop, and send button along with a text box below it

import React, { useState } from "react";
import { Button, Input, Text, Textarea } from "@chakra-ui/react";
import { useSpeechRecognition } from "react-speech-kit";

export default function Talk() {
  const [value, setValue] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setValue(result);
    },
  });

  async function sendToGpt(prompt: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/chat`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();
    console.log(data);
    setGptResponse(data);
  }

  return (
    <div>
      <Button
        onClick={() => {
          listen({ interimResults: true, continuous: true, language: "es-US" });
        }}
        disabled={listening}
      >
        Start
      </Button>
      <Button
        onClick={() => {
          sendToGpt(value);
          setValue("");
          stop();
        }}
        disabled={!listening}
      >
        Stop
      </Button>
      <Textarea
        value={value}
        size="lg"
        resize={"vertical"}
        onChange={(event) => setValue(event.target.value)}
      ></Textarea>
      <p>{gptResponse}</p>
    </div>
  );
}
