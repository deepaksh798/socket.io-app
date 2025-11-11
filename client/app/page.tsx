"use client";

import { io, Socket } from "socket.io-client";
import { useState, useRef, useEffect } from "react";

interface ServerToClientEvents {
  message: (msg: string) => void;
}

interface ClientToServerEvents {
  "user-message": (msg: string) => void;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = io("http://localhost:9001", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("message", (msg) => {
      console.log("Received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    socketRef.current?.emit("user-message", message.trim());
    setMessages((prev) => [...prev, `You: ${message.trim()}`]);
    setMessage("");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Socket Chat</h1>

      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-64 overflow-y-auto border border-gray-200 rounded p-2 mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="mb-1">
                {msg}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Status:{" "}
        <span className={isConnected ? "text-green-600" : "text-red-500"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </p>
    </main>
  );
}
