import React, { useState } from "react";
import { Button, Textarea } from "@chakra-ui/react";
import { useSpeechRecognition } from "react-speech-kit";

export default function Talk() {
  const [value, setValue] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setValue(result);
    },
  });

  // Listening Logic

  // Speaking logic

  async function sendToGpt(prompt: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/gpt2`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();

    // speak(data);
    setGptResponse(data);
  }

  return (
    <div>
      <Button
        onClick={() => {
          listen({ interimResults: true, continuous: true, language: "es-MX" });
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
