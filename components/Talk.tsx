// create a functional react component with a start, stop, and send button along with a text box below it

import React, { useState } from "react";
import { Button, Input, Text, Textarea } from "@chakra-ui/react";
import { useSpeechRecognition } from "react-speech-kit";
import { useSpeechSynthesis, SpeechSynthesisVoice } from "react-speech-kit";
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";
import Transcriber from "../lib/Transcriber";

export default function Talk() {
  const [value, setValue] = useState("");
  const [gptResponse, setGptResponse] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);

  var messages: string[] = [];

  const transcriber = new Transcriber(function (captions) {
    console.log("captions:", captions);
    console.log("messages: ", messages);
    messages.push(captions.original);

    /// combine values of string array into one string with spaces in one line
    function concat() {
      var result = "";
      for (var i = 0; i < messages.length; i++) {
        result += messages[i] + " ";
      }
      return result;
    }

    setValue(concat());
  });

  // Listening Logic

  function continuousListenting() {
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const speechConfig = SpeechConfig.fromSubscription(
      "7038612654d54cff9f9246acf3efea7c",
      "westus"
    );
    speechConfig.speechRecognitionLanguage = "es-MX";

    var recognizer: SpeechRecognizer | undefined;
    var message: string = "";

    recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        message += e.result.text;
        setValue(message);
      } else if (e.result.reason === ResultReason.NoMatch) {
        console.log(`NOMATCH: Speech could not be recognized.`);
      }
    };

    function start() {
      recognizer!.startContinuousRecognitionAsync(
        () => {
          console.log("Listening");
        },
        (err) => {
          console.log(err);
        }
      );
    }

    function stop() {
      recognizer!.stopContinuousRecognitionAsync(
        () => {
          console.log("Closing");
          message = "";
          recognizer!.close();
          recognizer = undefined;
        },
        (err) => {
          console.log(err);
        }
      );
    }

    return { start, stop };
  }

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
          setIsRecognizing(true);
          transcriber.start({
            fromLanguage: "es-MX",
            key: "7038612654d54cff9f9246acf3efea7c",
            region: "westus",
          });
          // start();
        }}
        disabled={isRecognizing}
      >
        Start
      </Button>
      <Button
        onClick={() => {
          setIsRecognizing(false);
          transcriber.stop();
          // sendToGpt(concat());
          setValue("");
          stop();
        }}
        disabled={!isRecognizing}
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
