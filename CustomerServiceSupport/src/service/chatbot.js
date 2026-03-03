const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function sendChatMessage(message, threadId) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      thread_id: threadId
    }),
  });

  if (!response.ok) {
    throw new Error("Network error");
  }

  return response.json();
}