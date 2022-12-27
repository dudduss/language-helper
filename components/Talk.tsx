import React, { useState, useEffect } from "react";
import { Button, Textarea, Box, Text } from "@chakra-ui/react";
import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { Message } from "../public/schemas";

export function MessageBox({ message }: { message: Message }) {
  const backgroundColor = message.isFromGpt ? "gray.200" : "blue.200";
  const sender = message.isFromGpt ? "Linda" : "Me";

  return (
    <Box marginTop={10} marginBottom={10}>
      <Text fontSize="2xl"> {sender} </Text>
      <Box bg={backgroundColor} padding={10} borderRadius={20} marginTop={2}>
        <Text fontSize="2xl">{message.text}</Text>
      </Box>
    </Box>
  );
}

export default function Talk() {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);

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

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "es-MX",
    });
  };

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

  function addMessageToConversation(text: string, isFromGpt: boolean) {
    const message: Message = {
      id: Math.random().toString(),
      text,
      isFromGpt: isFromGpt,
    };

    setConversation((prev) => [...prev, message]);
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTo(0, messagesBoxRef.current.scrollHeight);
    }
  }

  async function sendToGpt(prompt: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/gptResponse`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();
    speak(data);
    addMessageToConversation(data, true);
  }

  return (
    <Box>
      <Box
        overflow={"scroll"}
        maxHeight={700}
        width={"70%"}
        margin={"auto"}
        ref={messagesBoxRef}
      >
        {conversation.map((message, index) => (
          <MessageBox key={index} message={message} />
        ))}
      </Box>
      <Box marginTop={20} width={"70%"} margin={"auto"}>
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
            if (transcript.length > 0) {
              addMessageToConversation(transcript, false);
              sendToGpt(transcript);
            }
            resetTranscript();
          }}
          disabled={!isListening}
        >
          Stop
        </Button>
        <Textarea value={transcript} size="lg" resize={"vertical"}></Textarea>
      </Box>
    </Box>
  );
}
