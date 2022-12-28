import React, { useState, useEffect } from "react";
import {
  Button,
  Textarea,
  Box,
  Text,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { BsFillMicFill, BsStopCircleFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { BiSend } from "react-icons/bi";

import createSpeechServicesPonyfill from "web-speech-cognitive-services";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { Message } from "../public/schemas";
import MessageBox from "./MessageBox";
import axios from "axios";

export default function Talk() {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [value, setValue] = useState<string>("");
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getAzureCreds() {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL!}/api/creds?name=azure`
      );
      const { SpeechRecognition: AzureSpeechRecognition } =
        createSpeechServicesPonyfill({
          credentials: {
            region: "westus",
            subscriptionKey: response.data,
          },
        });
      SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
    }
    getAzureCreds();
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
      (result) => {},
      (err) => {
        console.log(err);
      }
    );
  }

  async function addMessageToConversation(text: string, isFromGpt: boolean) {
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

  function isSendingDisabled() {
    if (isListening) {
      return true;
    }
    if (transcript.length === 0) {
      return true;
    }
    return false;
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
      <Box marginTop={20} width={600} margin={"auto"}>
        <HStack justifyContent={"space-between"}>
          <Button
            bg={isListening ? "red.100" : "green.100"}
            leftIcon={
              isListening ? (
                <BsStopCircleFill></BsStopCircleFill>
              ) : (
                <BsFillMicFill></BsFillMicFill>
              )
            }
            disabled={!isListening && transcript.length > 0}
            onClick={() => {
              if (isListening) {
                setIsListening(false);
                stopListening();
                if (transcript.length === 0) {
                  resetTranscript();
                } else {
                  setValue(transcript);
                }
              } else {
                setIsListening(true);
                startListening();
              }
            }}
          >
            {" "}
            {isListening ? "Stop" : "Record"}
          </Button>
          <Box>
            {/* rewrite these icon button as buttons with left icons instead */}
            <Button
              aria-label="Send"
              bg="blue.100"
              leftIcon={<BiSend>Send</BiSend>}
              onClick={() => {
                addMessageToConversation(value, false);
                sendToGpt(value);
                resetTranscript();
                setValue("");
              }}
              disabled={isSendingDisabled()}
              margin={1}
            >
              Send
            </Button>
            <Button
              aria-label="Delete"
              bg="red.100"
              leftIcon={<AiFillCloseCircle></AiFillCloseCircle>}
              onClick={() => {
                resetTranscript();
                setValue("");
              }}
              disabled={isSendingDisabled()}
            >
              Reset
            </Button>
          </Box>
        </HStack>
        <Textarea
          value={isListening ? transcript : value}
          size="lg"
          resize={"vertical"}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          borderWidth={5}
          marginTop={5}
        ></Textarea>
      </Box>
    </Box>
  );
}
