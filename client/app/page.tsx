"use client";

import { use, useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { connectWebSocket } from "@/utils/ws";

export default function Home() {
  const timer = useRef<any>(null);
  const socket = useRef<any>(null);
  const [userName, setUserName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: string; text: string; time: string }>
  >([]);
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [typers, setTypers] = useState<any[]>([]);

  // NEW: ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // typing indicator
  useEffect(() => {
    if (inputValue) {
      socket.current.emit("typing", userName);
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      socket.current.emit("stopTyping", userName);
    }, 1000);

    return () => clearTimeout(timer.current);
  }, [inputValue, userName]);

  // NEW: auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    socket.current = connectWebSocket();

    socket.current.on("connect", () => {
      socket.current.on("roomNotice", (userName: string) => {
        console.log(`${userName} has joined the group.`);
      });

      socket.current.on("chatMessage", (message: string) => {
        // const { sender, text, time } = messageData;
        console.log("Received message:", message);
        setMessages((prev: any) => [...prev, message]);
      });

      socket.current.on("typing", (username: any) => {
        setTypers((prev) => {
          const isExist = prev.find((typer: any) => typer === username);
          if (!isExist) {
            return [...prev, username];
          }
          return prev;
        });
      });

      socket.current.on("stopTyping", (username: any) => {
        setTypers((prev) => prev.filter((typer) => typer !== username));
      });
    });

    return () => {
      socket.current.off("roomNotice");
      socket.current.off("chatMessage");
      socket.current.off("typing");
      socket.current.off("stopTyping");
      socket.current.disconnect();
    };
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowNamePopup(false);
      socket.current.emit("joinRoom", userName.trim());
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputValue.trim(),
        sender: userName,
        time: currentTime,
      },
    ]);

    socket.current.emit("chatMessage", {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: userName,
      time: currentTime,
    });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {showNamePopup ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-teal-500 to-teal-600">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-teal-500 rounded-full p-4">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Join Chat Room
            </h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your username"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition-colors font-semibold"
              >
                Join Chat
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Main chat area
        <div className="flex flex-col h-screen max-w-5xl mx-auto bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Dev Team Chat</h1>
                <p
                  className={`text-xs text-teal-100 ${
                    typers.length > 0 ? "italic" : ""
                  }`}
                >
                  {typers.length > 0
                    ? `${typers.join(", ")} is typing...`
                    : `${userName} (You)`}
                </p>
              </div>
            </div>
            <div className=""></div>
          </div>

          {/* Chat Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: "#f0f2f5",
            }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="bg-teal-50 text-teal-700 px-6 py-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isOwnMessage = msg.sender === userName;
                return (
                  <div
                    key={i}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                        isOwnMessage
                          ? "bg-teal-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold text-teal-600 mb-1">
                          {msg.sender}
                        </p>
                      )}
                      <p className="text-sm wrap-break-words">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          isOwnMessage ? "text-teal-100" : "text-gray-500"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {/* NEW: sentinel element to scroll into view */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-gray-100 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:border-teal-500 transition-colors"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
