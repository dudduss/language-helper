import {
  AudioConfig,
  SpeechTranslationConfig,
  SpeechRecognizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";

class Transcriber {
  private _recognizer: SpeechRecognizer | undefined;
  private _callback: (result: { original: string }) => void;

  constructor(callback: (result: { original: string }) => void) {
    this._callback = callback;
  }

  start(options: { key: string; region: string; fromLanguage: string }) {
    console.log('here in start')
    console.log(this._recognizer)
    const alreadyStarted = !!this._recognizer;
    if (alreadyStarted) {
      return;
    }

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const speechConfig = SpeechTranslationConfig.fromSubscription(
      options.key,
      options.region
    );

    speechConfig.speechRecognitionLanguage = options.fromLanguage;

    this._recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    this._recognizer.recognizing = this._recognizer.recognized =
      this.recognizerCallback.bind(this);
    this._recognizer.startContinuousRecognitionAsync();
  }

  private recognizerCallback(s: any, e: any) {
    const result = e.result;
    const reason = ResultReason[result.reason];
    if (reason !== "RecognizedSpeech") {
      return;
    }

    this._callback({
      original: result.text,
    });
  }

  stop() {
    console.log('here in stop')
    console.log(this._recognizer)
    if (!this._recognizer) {
      return;
    }
    this._recognizer.stopContinuousRecognitionAsync(
      this.stopRecognizer.bind(this),
      (err: any) => {
        this.stopRecognizer();
        console.error(err);
      }
    );
  }

  private stopRecognizer() {
    if (!this._recognizer) {
      return;
    }
    this._recognizer.close();
    this._recognizer = undefined;
    console.log("stopped");
  }
}

export default Transcriber;
