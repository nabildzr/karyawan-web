// * Hook WebSocket untuk chat real-time tiket.

import { useCallback, useEffect, useRef, useState } from "react";
import type { TicketResponse } from "../types/helpdesk.types";

const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ??
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/v1").replace(
    /^http/,
    "ws",
  );

interface UseTicketChatOptions {
  ticketId: string;
  enabled?: boolean;
}

type WsEnvelope = {
  type?: string;
  event?: string;
  data?: unknown;
  ticketId?: string;
};

export function useTicketChat({ ticketId, enabled = true }: UseTicketChatOptions) {
  const [messages, setMessages] = useState<TicketResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !ticketId) return;
    const token = localStorage.getItem("accessToken");
    const url = `${WS_BASE_URL}/tickets/ws/${ticketId}${token ? `?token=${token}` : ""}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const parsed: WsEnvelope = JSON.parse(event.data);
        const eventName = parsed.type ?? parsed.event;
        if (eventName === "new_response" && parsed.data) {
          const nextMessage = parsed.data as TicketResponse;
          setMessages((prev) =>
            prev.some((item) => item.id === nextMessage.id)
              ? prev
              : [...prev, nextMessage],
          );
        }
      } catch {
        // ignore parse error
      }
    };

    return ws;
  }, [ticketId, enabled]);

  useEffect(() => {
    const ws = connect();
    return () => {
      ws?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "send_message", message }));
    }
  }, []);

  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  return { messages, isConnected, sendMessage, ping, setMessages };
}
