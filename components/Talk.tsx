import React, { useState, useEffect } from "react";
import { Button, Textarea } from "@chakra-ui/react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import createSpeechSynthesisPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";

export default function Talk() {
  const [gptResponse, setGptResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<string[]>([
    "hello my name is",
    "i want to practice spanish",
  ]);

  useEffect(() => {
    const { SpeechRecognition: AzureSpeechRecognition } =
      createSpeechServicesPonyfill({
        credentials: {
          region: "westus",
          subscriptionKey: "7038612654d54cff9f9246acf3efea7c",
        },
      });
    SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
  }, []);

  // Listening Logic
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const startListening = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: "es-MX",
    });

  const stopListening = () => {
    SpeechRecognition.abortListening();
  };

  // Speaking logic
  async function speak(text: string) {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      "7038612654d54cff9f9246acf3efea7c",
      "westus"
    );
    speechConfig.speechSynthesisLanguage = "es-MX";
    const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new speechsdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    synthesizer.speakTextAsync(
      text,
      (result) => {
        // console.log(result);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async function sendToGpt(prompt: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/gpt2`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();

    setGptResponse(data);
    speak(data);
  }

  return (
    <div>
      <Button
        onClick={() => {
          setIsListening(true);
          startListening();
        }}
        disabled={isListening}
      >
        Start
      </Button>
      <Button
        onClick={() => {
          setIsListening(false);
          stopListening();
          sendToGpt(transcript);
          resetTranscript();
        }}
        disabled={!isListening}
      >
        Stop
      </Button>
      <Textarea
        value={transcript}
        size="lg"
        resize={"vertical"}
        readOnly
      ></Textarea>
      <p>{gptResponse}</p>
    </div>
  );
}
