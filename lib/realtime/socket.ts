import { io, type Socket } from "socket.io-client";
import { getPublicWsUrl } from "@/lib/env";

let socket: Socket | null = null;

export function getRealtimeSocket(sessionId?: string): Socket {
  if (socket?.connected) return socket;

  socket = io(`${getPublicWsUrl()}/realtime`, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    auth: sessionId ? { sessionId } : undefined,
  });

  return socket;
}

export function joinCartRoom(sessionId: string) {
  const client = getRealtimeSocket(sessionId);
  client.emit("cart:join", { sessionId });
  return client;
}

export function subscribeProduct(slug: string) {
  const client = getRealtimeSocket();
  client.emit("product:subscribe", { slug });
  return client;
}

export type RealtimeEvents = {
  "product:updated": (payload: unknown) => void;
  "stock:changed": (payload: unknown) => void;
  "cart:updated": (payload: unknown) => void;
  "price:changed": (payload: unknown) => void;
  "order:created": (payload: unknown) => void;
  "notification:created": (payload: unknown) => void;
};
