import { API_BASE_URL } from "@/lib/apiConfig";

export type ContactMessageStatus = "new" | "read" | "replied";

export interface ContactMessageReply {
  subject: string;
  body: string;
  includeOriginal: boolean;
  sentAt: string;
  sentBy: "admin";
  toEmail: string;
}

export interface SubmitContactPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactMessageStatus;
  ip: string;
  userAgent: string;
  lastRepliedAt: string | null;
  replies: ContactMessageReply[];
  createdAt: string;
  updatedAt: string;
}

export interface SendReplyPayload {
  subject: string;
  body: string;
  includeOriginal?: boolean;
}

interface ContactApiErrorResponse {
  ok?: false;
  error?: string;
}

const getErrorMessage = (fallback: string, data: unknown): string => {
  if (typeof data === "object" && data !== null && "error" in data) {
    const errorValue = (data as ContactApiErrorResponse).error;
    if (typeof errorValue === "string" && errorValue.trim()) {
      return errorValue;
    }
  }

  return fallback;
};

export const contactApi = {
  submitContactMessage: async (payload: SubmitContactPayload): Promise<{ ok: true }> => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      throw new Error(getErrorMessage("Unable to send your message right now.", data));
    }

    return { ok: true };
  },

  getMessages: async (token: string): Promise<ContactMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/contact/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      throw new Error(getErrorMessage("Failed to load contact messages.", data));
    }

    return Array.isArray(data.messages) ? data.messages : [];
  },

  updateMessageStatus: async (
    token: string,
    id: string,
    status: ContactMessageStatus,
  ): Promise<ContactMessage> => {
    const response = await fetch(`${API_BASE_URL}/contact/messages/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok || !data.message) {
      throw new Error(getErrorMessage("Failed to update message status.", data));
    }

    return data.message;
  },

  sendReply: async (
    token: string,
    id: string,
    payload: SendReplyPayload,
  ): Promise<ContactMessage> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok || !data.message) {
      throw new Error(getErrorMessage("Failed to send reply.", data));
    }

    return data.message;
  },
};
