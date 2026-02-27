import { useEffect, useRef, useState, type FC, type FormEvent } from "react";
import { Bot, Mic, Send, Square } from "lucide-react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatApiResponse {
  reply?: string;
  error?: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript?: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const SUGGESTIONS = [
  "Convert 15 kilometers to miles",
  "What is 24% of 875?",
  "Solve: (35 * 1.8) + 32",
  "Convert 2.5 hours into seconds",
  "Calculate simple interest for 1200 at 8% for 3 years",
  "Find area of a circle with radius 7",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "I can help with calculations and conversions only. Ask arithmetic, percentages, formulas, or unit conversions.",
};

const CalculationChatbotSection: FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const playReplyBeep = () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const AudioContextCtor = window.AudioContext;
      if (!AudioContextCtor) {
        return;
      }

      const audioContext = new AudioContextCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.05;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      const stopAt = audioContext.currentTime + 0.12;
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      oscillator.stop(stopAt);

      oscillator.onended = () => {
        void audioContext.close();
      };
    } catch {
      // Audio can fail on some browsers due to autoplay restrictions.
    }
  };

  useEffect(() => {
    if (!chatScrollRef.current) {
      return;
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const RecognitionCtor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setSpeechError(event.error ? `Mic error: ${event.error}` : "Mic input failed.");
    };

    recognition.onresult = (event) => {
      let combinedTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript ?? "";
        combinedTranscript += transcript;
      }

      const normalizedTranscript = combinedTranscript.trim();
      if (normalizedTranscript) {
        setInput(normalizedTranscript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleMicListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setSpeechError("Voice input is not available in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      setSpeechError(null);
      recognition.start();
    } catch {
      setSpeechError("Unable to start microphone. Please allow mic permission.");
    }
  };

  const handleSendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();

    if (!message || isLoading) {
      return;
    }

    const updatedMessages = [...messages, { role: "user", content: message } as ChatMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/calculation-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok || !data.reply) {
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.error ??
              "I could not process that calculation right now. Please try again.",
          },
        ]);
        playReplyBeep();
        return;
      }

      setMessages((previous) => [...previous, { role: "assistant", content: data.reply ?? "" }]);
      playReplyBeep();
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Connection error while reaching the calculation assistant. Please try again.",
        },
      ]);
      playReplyBeep();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSendMessage(input);
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <Bot className="text-gray-700 dark:text-gray-300 shrink-0" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">
          Calculation AI Assistant
        </h2>
      </div>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
        Ask calculation and conversion questions only.
      </p>

      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              void handleSendMessage(suggestion);
            }}
            className="shrink-0 px-3 py-2 rounded-full text-sm border transition
              border-gray-300 text-gray-700 hover:bg-gray-100
              dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div
        ref={chatScrollRef}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 h-[52vh] max-h-[520px] sm:h-80 overflow-y-auto space-y-3 sm:space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[95%] sm:max-w-[88%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm whitespace-pre-wrap ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            {message.content}
          </div>
        ))}

        {isLoading ? (
          <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 max-w-[95%] sm:max-w-[88%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm inline-flex items-center gap-2">
            <span>Assistant is typing</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:240ms]" />
            </span>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: Convert 250 cm to meters"
          className="w-full flex-1 p-3 rounded-xl border outline-none
            border-gray-300 bg-white text-gray-900
            dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <div className="w-full sm:w-auto flex gap-3">
          {speechSupported ? (
            <button
              type="button"
              onClick={toggleMicListening}
              aria-label={isListening ? "Stop microphone" : "Start microphone"}
              className={`w-full sm:w-auto justify-center px-4 py-3 rounded-xl font-medium transition inline-flex items-center gap-2 border
                ${
                  isListening
                    ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                    : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                }`}
            >
              {isListening ? <Square size={16} /> : <Mic size={16} />}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto justify-center px-5 py-3 rounded-xl font-medium transition inline-flex items-center gap-2
              bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </form>
      {speechSupported ? (
        <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {isListening
            ? "Listening... speak your calculation question."
            : "Tap the mic icon to speak your question."}
        </p>
      ) : (
        <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Voice input is not supported in this browser.
        </p>
      )}
      {speechError ? (
        <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400">{speechError}</p>
      ) : null}
    </div>
  );
};

export default CalculationChatbotSection;
