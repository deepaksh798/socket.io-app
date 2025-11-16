"use client";

import { ReactNode, useState, useEffect } from "react";

interface Props {
  children: ReactNode;
}

const BackendStatus: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState<"checking" | "waking" | "error">(
    "checking"
  );

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t + 1), 1000);

    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/health`,
          {
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        clearTimeout(timeout);

        if (res.ok) {
          setReady(true);
          clearInterval(timer);
        }
      } catch (err) {
        setStatus("error");
        clearInterval(timer);
      }
    };

    checkBackend();

    return () => clearInterval(timer);
  }, []);
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Animated Loader */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>

                {/* Inner pulsing circle */}
                <div className="absolute inset-3 bg-indigo-500 rounded-full animate-pulse flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {status === "checking" && "Connecting to Server..."}
                {status === "waking" && "Waking Up Server..."}
                {status === "error" && "Connection Timeout"}
              </h2>

              <p className="text-gray-600">
                {status === "checking" && "Establishing connection"}
                {status === "waking" &&
                  "Free tier servers sleep after inactivity. This may take 30-90 seconds."}
                {status === "error" &&
                  "The server is taking longer than expected. Please refresh the page."}
              </p>
            </div>

            {/* Timer and Progress */}
            {status !== "error" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Time elapsed</span>
                  <span className="font-mono font-semibold text-indigo-600 text-lg">
                    {time}s
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min((time / 90) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                {/* Helpful Tips */}
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">💡 Tip:</span> Render's free
                    tier spins down after 15 minutes of inactivity. First
                    request after sleep takes longer.
                  </p>
                </div>
              </div>
            )}

            {/* Error Actions */}
            {status === "error" && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Refresh Page
              </button>
            )}
          </div>

          {/* Dots Animation */}
          {status !== "error" && (
            <div className="flex justify-center gap-2 mt-6">
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BackendStatus;
