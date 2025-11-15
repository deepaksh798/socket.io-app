import { io } from "socket.io-client";

export function connectWebSocket() {
  return io(process.env.NEXT_PUBLIC_API_BASE_URL);
}
