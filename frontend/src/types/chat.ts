export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content?: string; // Make content optional
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatRequest {
  messages: { role: MessageRole; content?: string }[]; // Make content optional
  current_page?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  previewUrl?: string;
  status: "initializing" | "ready" | "error";
  error?: string;
}

export interface CreateProjectRequest {
  prompt: string;
}

export interface CreateProjectResponse {
  projectId: string;
}

export interface ChatAction {
  type: string;
  payload: Record<string, unknown>;
}
