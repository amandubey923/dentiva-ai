"use client";

import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";

interface ConversationMessage {
  content: string;
  role: "assistant" | "user" | "system";
}

const WAVE_PATTERN = [35, 65, 90, 55, 75];

function VapiWidget() {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  const { user, isLoaded } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // auto-scroll for messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // setup event listeners for VAPI
  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const handleMessage = (message: { type: string; transcriptType?: string; transcript?: string; role?: string }) => {
      if (message.type === "transcript" && message.transcriptType === "final" && message.transcript) {
        const newMessage: ConversationMessage = {
          content: message.transcript,
          role: message.role === "assistant" ? "assistant" : "user",
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: unknown) => {
      console.error("Vapi Error:", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
      } catch (error) {
        console.error("Failed to start call", error);
        setConnecting(false);
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col overflow-hidden pb-20">
      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-mono">
          <span>Talk to Your </span>
          <span className="text-primary uppercase">AI Dental Assistant</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Have a voice conversation with our AI assistant for dental advice and guidance
        </p>
      </div>

      {/* VIDEO CALL AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI ASSISTANT CARD */}
        <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div
              className={`absolute inset-0 ${
                isSpeaking ? "opacity-30" : "opacity-0"
              } transition-opacity duration-300`}
            >
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                {WAVE_PATTERN.map((height, i) => (
                  <div
                    key={i}
                    className={`mx-1 w-1 bg-primary rounded-full transition-all duration-200 ${
                      isSpeaking ? "animate-sound-wave" : ""
                    }`}
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      height: isSpeaking ? `${height}%` : "15%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI LOGO */}
            <div className="relative size-32 mb-4">
              <div
                className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
              />

              <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-primary/5"></div>
                <Image
                  src="/logo1.png"
                  alt="AI Dental Assistant"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground">Dentiva AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Dental Assistant</p>

            {/* SPEAKING INDICATOR */}
            <div
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                isSpeaking ? "border-primary" : ""
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />

              <span className="text-xs text-muted-foreground">
                {isSpeaking
                  ? "Speaking..."
                  : callActive
                  ? "Listening..."
                  : callEnded
                  ? "Call ended"
                  : "Waiting..."}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className="bg-card/90 backdrop-blur-sm border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* User Image */}
            <div className="relative size-32 mb-4">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="User"
                  width={128}
                  height={128}
                  className="size-full object-cover rounded-full"
                />
              ) : (
                <div className="size-full bg-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.firstName?.[0] || "U"}
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground">You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Guest"}
            </p>

            {/* User Ready Text */}
            <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MESSAGE CONTAINER */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
        >
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}-${msg.content.slice(0, 10)}`}
                className="message-item animate-in fade-in duration-300"
              >
                <div className="font-semibold text-xs text-muted-foreground mb-1">
                  {msg.role === "assistant" ? "Dentiva AI" : "You"}:
                </div>
                <p className="text-foreground">{msg.content}</p>
              </div>
            ))}

            {callEnded && (
              <div className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-primary mb-1">System:</div>
                <p className="text-foreground">Call ended. Thank you for using Dentiva AI!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALL CONTROLS */}
      <div className="w-full flex justify-center gap-4">
        <Button
          className={`w-48 text-xl rounded-3xl ${
            callActive
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90"
          } text-white relative`}
          onClick={toggleCall}
          disabled={connecting}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
          )}

          <span>
            {callActive
              ? "End Call"
              : connecting
              ? "Connecting..."
              : callEnded
              ? "Start New Call"
              : "Start Call"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default VapiWidget;