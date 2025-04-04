"use client";

import { useState, useEffect, useRef } from "react";
import { type Project, type Message } from "@/types/chat";
import { generateId } from "@/lib/utils";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { QuickPrompts } from "./quick-prompts";
import { PreviewPanel } from "./preview-panel";
import { ProjectHeader } from "./project-header";
import { Sidebar } from "./sidebar";
import { StartServer } from "@/types/server";
import { useRouter, useSearchParams } from "next/navigation";

export interface IframeInfo {
  url: string | null;
  loading: boolean;
  error: string | null;
}

interface CommandResult {
  command: string;
  output: string;
  error: string;
  success: boolean;
}

export default function ProjectView({ project }: { project: Project }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframe, setIframe] = useState<IframeInfo>({
    url: null,
    loading: true,
    error: null,
  });
  const [activeTools, setActiveTools] = useState<{
    reading?: boolean;
    writing?: boolean;
    running?: boolean;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentPage, _setCurrentPage] = useState("/");

  const searchParams = useSearchParams();

  const initPrompt = searchParams.get("initialPrompt");

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: `Welcome to your project: ${project.name}\n\nI'm your AI assistant ready to help you build and modify your application. You can ask me questions, request changes, or give commands to modify the code.\n
        \nWhat would you like to do with your project today?`,
        timestamp: Date.now(),
      },
    ]);

    startDevServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // This is a bit wack but that'll do since it's just a super MVP
  useEffect(() => {
    if (!isLoading) {
      if (initPrompt && typeof initPrompt == "string") {
        sendMessage(initPrompt);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initPrompt]);

  const handleIframeLoad = () => {
    setIframe((prev) => ({ ...prev, loading: false }));
  };

  const startDevServer = async () => {
    setIsThinking(true);
    try {
      console.log("Starting server frontend");
      const response = await fetch("/api/startserver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      const data = (await response.json()) as StartServer;

      console.log({ data });

      setIframe({
        url: `http://localhost:${data.port}`,
        loading: true,
        error: null,
      });
    } catch (error) {
      console.error("Error starting dev server:", error);
      setIframe({
        url: "",
        loading: false,
        error: "Failed to start development server",
      });

      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Failed to start the development server. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle command results
  const handleCommandResult = (commandResult: CommandResult) => {
    const { command, output, error, success } = commandResult;

    const commandContent = `**Command executed**: \`${command}\`\n\n${
      success
        ? `✅ **Success**\n\n${output || "Command executed successfully."}`
        : `❌ **Error**\n\n${
            error || "Command failed without specific error message."
          }`
    }`;

    const commandMessage: Message = {
      id: generateId(),
      role: "system",
      content: commandContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, commandMessage]);

    // Refresh the iframe if the command was successful
    if (
      success &&
      !command.includes("npm install") &&
      !command.includes("yarn install")
    ) {
      setTimeout(() => refreshIframe(), 1000);
    }
  };

  const sendMessage = async (data?: string) => {
    const content = data || input;
    
    if (!content.trim() || isLoading) return;
  
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content,
      timestamp: Date.now(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: userMessage.role, content: userMessage.content },
          ],
          current_page: currentPage,
        }),
      });
  
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
  
      const decoder = new TextDecoder();
      let currentToolStatus = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
  
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === "tool_status") {
                if (parsed.status === "started") {
                  currentToolStatus = parsed.tool;
                  setActiveTools((prev) => ({
                    ...prev,
                    [parsed.tool === "read_file" ? "reading" : 
                     parsed.tool === "write_file" ? "writing" : 
                     parsed.tool === "run_command" ? "running" : ""]: true,
                  }));
                } else if (parsed.status === "completed") {
                  setActiveTools((prev) => ({
                    ...prev,
                    [currentToolStatus === "read_file" ? "reading" : 
                     currentToolStatus === "write_file" ? "writing" : 
                     currentToolStatus === "run_command" ? "running" : ""]: false,
                  }));
  
                  const toolMessage: Message = {
                    id: generateId(),
                    role: "system",
                    content: `🛠️ Tool Operation Result:\n\`\`\`\n${parsed.result}\n\`\`\``,
                    timestamp: Date.now(),
                  };
                  setMessages((prev) => [...prev, toolMessage]);
                }
              } else if (parsed.type === "message") {
                const aiMessage: Message = {
                  id: generateId(),
                  role: "assistant",
                  content: parsed.content,
                  timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, aiMessage]);
                handleAutomaticActions(parsed.content);
              } else if (parsed.type === "error") {
                const errorMessage: Message = {
                  id: generateId(),
                  role: "assistant",
                  content: parsed.content,
                  timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, errorMessage]);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setActiveTools({});
    }
  };

  // Handle automatic actions based on AI response
  const handleAutomaticActions = (response: string) => {
    // If the AI suggests refreshing the page
    if (/refresh(ing)? the (page|preview|iframe|browser)/i.test(response)) {
      refreshIframe();
    }

    // If the AI mentions an error that was fixed
    if (/fix(ed)? the (error|issue|problem)/i.test(response)) {
      refreshIframe();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Add messagesEndRef to MessageList component
  const MessageListWithRef = () => (
    <>
      <MessageList messages={messages} isThinking={isThinking} activeTools={activeTools} />
      <div ref={messagesEndRef} />
    </>
  );

  const refreshIframe = () => {
    setIframe((prev) => ({
      ...prev,
      loading: true,
    }));
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <ProjectHeader
          project={project}
          currentPage={currentPage}
          isThinking={isThinking}
          onRefresh={refreshIframe}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 flex flex-col border-r border-zinc-800">
            <MessageListWithRef />
            <QuickPrompts onPromptSelect={setInput} isLoading={isLoading} />
            <ChatInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          </div>

          <PreviewPanel
            project={project}
            iframe={iframe}
            iframeKey={iframeKey}
            iframeRef={iframeRef}
            onIframeLoad={handleIframeLoad}
            setInput={setInput}
          />
        </div>
      </div>
    </div>
  );
}
