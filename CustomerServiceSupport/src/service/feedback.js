// src/service/feedback.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const createFeedback = async ({ ticket_id, rating, tags, comment }) => {
  try {
    const response = await axios.post(`${API_BASE}/tools/createfeedback`, {
      ticket_id,
      rating,
      tags,
      comment
    });
    return response.data;
  } catch (err) {
    console.error("Error creating feedback:", err);
    throw err;
  }
};

// Fetch feedback history for a ticket
export const getFeedbackByTicket = async (ticket_id) => {
  try {
    const response = await fetch(`${API_BASE}/tools/getfeedback?ticket_id=${ticket_id}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return [];
  }
};