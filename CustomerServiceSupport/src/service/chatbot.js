const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function sendChatMessage(message, threadId = null) {
  const text = (message || "").trim();
  if (!text) throw new Error("message cannot be empty");

  const body = {
    message:  text,
    ...(threadId && { thread_id: threadId }),
  };

  const response = await fetch(`${API_BASE}/api/chat`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Chat API error ${response.status}`);
  }

  return response.json(); // { reply: string, thread_id: string }
}