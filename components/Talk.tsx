// create a functional react component with a start, stop, and send button along with a text box below it

import React, { useState } from "react";
import { Button, Input, Text, Textarea } from "@chakra-ui/react";
import { useSpeechRecognition } from "react-speech-kit";
import { useSpeechSynthesis, SpeechSynthesisVoice } from "react-speech-kit";

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
  // const synth = window.speechSynthesis;
  function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX"; // Set the language to Spanish
    utterance.rate = 0.6; // Set the speed to 1.2
    // synth.speak(utterance);
  }

  async function sendToGpt(prompt: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/gpt2`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();

    speak(data);
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
