const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const ticketService = {
  getTicketById: async (ticketId) => {
    const res = await fetch(`${API_BASE}/tools/tickets/${ticketId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Ticket not found");
    }
    return res.json();
  },
};