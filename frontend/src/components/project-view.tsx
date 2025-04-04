"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { type Project, type Message, MessageRole } from '@/types/chat';
import { generateId, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Terminal, XCircle, CheckCircle2, RefreshCw, Clipboard, Code, Image, Link as LinkIcon, Smile, Paperclip } from 'lucide-react';
import { LogoSVG } from '@/components/ui/logo-svg';
import { useRouter } from 'next/navigation';

// Simple Markdown Renderer Component
function MarkdownContent({ content }: { content: string }) {
  // Check if content is undefined or null
  if (!content) {
    return <div className="prose prose-invert prose-sm max-w-none">No content available</div>;
  }

  // Format message content for display
  const formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      // Note: In a production app, you would use a proper markdown renderer
      // library like react-markdown for security reasons rather than dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}

interface IframeInfo {
  url: string;
  loading: boolean;
  error: string | null;
}

export default function ProjectView({ project }: { project: Project }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframe, setIframe] = useState<IframeInfo>({
    url: 'http://localhost:3000',
    loading: true,
    error: null
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState('/');
  const [executing, setExecuting] = useState<string | null>(null);

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: `# Welcome to your project: ${project.name}\n\nI'm your AI assistant ready to help you build and modify your application. You can ask me questions, request changes, or give commands to modify the code.\n\n**Current Status**: ${
          project.status === 'ready'
            ? '✅ Project is ready to use'
            : project.status === 'error'
            ? `❌ Error: ${project.error}`
            : '⏳ Setting up your environment...'
        }\n\nWhat would you like to do with your project today?`,
        timestamp: Date.now(),
      },
    ]);

    // Start the development server if project is ready
    if (project.status === 'ready') {
      startDevServer();
    }
  }, [project]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  // Track iframe navigation
  const handleIframeLoad = () => {
    setIframe(prev => ({ ...prev, loading: false }));
    try {
      if (iframeRef.current?.contentWindow?.location.pathname) {
        setCurrentPage(iframeRef.current.contentWindow.location.pathname);
      }
    } catch (error) {
      console.error('Error accessing iframe content:', error);
    }
  };

  // Function to start the development server
  const startDevServer = async () => {
    setIsThinking(true);
    try {
      // Start a local dev server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          messages: [{ role: 'user', content: 'Start the development server and explain what the project does.' }],
        }),
      });

      const data = await response.json();

      // Add response to messages
      const newMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // If command was executed, add system message
      if (data.commandResult) {
        handleCommandResult(data.commandResult);
      }

      // Set iframe URL
      setIframe({
        url: "http://localhost:3000",
        loading: true,
        error: null
      });
    } catch (error) {
      console.error('Error starting dev server:', error);
      setIframe({
        url: "",
        loading: false,
        error: "Failed to start development server"
      });

      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Failed to start the development server. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle command results
  const handleCommandResult = (commandResult: { command: string; output: string; error: string; success: boolean }) => {
    const { command, output, error, success } = commandResult;

    const commandContent = `**Command executed**: \`${command}\`\n\n${
      success
        ? `✅ **Success**\n\n${output || 'Command executed successfully.'}`
        : `❌ **Error**\n\n${error || 'Command failed without specific error message.'}`
    }`;

    const commandMessage: Message = {
      id: generateId(),
      role: 'system',
      content: commandContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, commandMessage]);

    // Refresh the iframe if the command was successful
    if (success && !command.includes('npm install') && !command.includes('yarn install')) {
      setTimeout(() => refreshIframe(), 1000);
    }
  };

  // Function to handle sending messages
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    try {
      // Get the current page from the iframe
      const currentPageValue = currentPage;

      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: userMessage.role, content: userMessage.content },
          ],
          current_page: currentPageValue,
        }),
      });

      const data = await response.json();

      // Add AI response to messages
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If a command was executed, add a system message with the result
      if (data.commandResult) {
        handleCommandResult(data.commandResult);
      }

      // Check if we need to execute any specific action based on the message
      handleAutomaticActions(data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
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

  // Function to refresh the preview
  const refreshIframe = () => {
    setIframe(prev => ({
      ...prev,
      loading: true
    }));
    setIframeKey(prev => prev + 1);
  };

  // Open file input
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a full implementation, you would upload each file
    // For now, we'll just mention the filenames in the chat
    const fileNames = Array.from(files).map(file => file.name).join(', ');

    setInput(prev => `${prev}${prev ? '\n' : ''}I'm uploading: ${fileNames}`);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle quick prompts
  const quickPrompts = [
    { label: 'Fix errors', prompt: 'There seems to be an error in the application. Can you help fix it?' },
    { label: 'Add feature', prompt: 'Can you add a new feature to allow users to search content?' },
    { label: 'Improve UI', prompt: 'The UI needs some improvements. Can you make it more visually appealing?' },
    { label: 'Optimize code', prompt: 'Can you optimize the code for better performance?' },
  ];

  const sendQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left sidebar */}
      <div className="w-16 bg-zinc-900 flex flex-col items-center py-4">
        <LogoSVG size={32} className="mb-8" />
        <div className="flex-1 flex flex-col gap-4 items-center">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            onClick={() => router.push('/')}
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Terminal"
          >
            <Terminal size={20} />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Files"
          >
            <Code size={20} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center px-4">
          <h1 className="font-semibold">{project.name}</h1>
          <div className="ml-3 px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400">
            {project.status}
          </div>
          {currentPage && (
            <div className="ml-4 text-sm text-zinc-500">
              Current page: <span className="text-zinc-300">{currentPage}</span>
            </div>
          )}
          <div className="flex-grow" />
          <Button variant="ghost" size="sm" onClick={refreshIframe} disabled={isThinking}>
            <RefreshCw size={16} className={`mr-2 ${isThinking ? 'animate-spin' : ''}`} />
            Refresh Preview
          </Button>
        </header>

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat section */}
          <div className="w-1/2 flex flex-col border-r border-zinc-800">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.role === 'system'
                        ? 'bg-zinc-800 text-zinc-300 w-full'
                        : 'bg-zinc-800 text-white'
                  }`}>
                    <div className="flex items-center mb-1">
                      <span className="font-medium">{
                        message.role === 'user'
                          ? 'You'
                          : message.role === 'system'
                            ? 'System'
                            : 'AI'
                      }</span>
                      <span className="ml-2 text-xs opacity-70">{formatDate(message.timestamp)}</span>
                    </div>
                    <MarkdownContent content={message.content ?? ""} />
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex items-center space-x-2 text-zinc-400 p-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 border-t border-zinc-800 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  onClick={() => sendQuickPrompt(prompt.prompt)}
                  disabled={isLoading}
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question or give instructions..."
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 pr-10 outline-none resize-none min-h-[80px]"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                      multiple
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleAttachClick}
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      disabled={isLoading}
                    >
                      <Paperclip size={20} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      disabled={isLoading}
                    >
                      <Code size={20} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      disabled={isLoading}
                    >
                      <Smile size={20} />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 px-4"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview section */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 bg-zinc-950 relative">
              {project.status === 'ready' ? (
                <>
                  {iframe.loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80">
                      <div className="text-center">
                        <Loader2 size={40} className="mx-auto mb-4 text-purple-500 animate-spin" />
                        <h3 className="text-xl font-semibold mb-2">Loading Preview</h3>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    src={iframe.url}
                    className="w-full h-full border-none"
                    title="Project Preview"
                    onLoad={handleIframeLoad}
                  />
                </>
              ) : project.status === 'error' ? (
                <div className="text-center p-8 h-full flex flex-col items-center justify-center">
                  <XCircle size={48} className="mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-semibold mb-2">Error Starting Project</h3>
                  <p className="text-zinc-400 mb-4 max-w-md">{project.error}</p>
                  <Button
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setInput(`Fix the error: ${project.error}`);
                    }}
                  >
                    Ask AI to Fix Error
                  </Button>
                </div>
              ) : (
                <div className="text-center p-8 h-full flex flex-col items-center justify-center">
                  <Loader2 size={48} className="mx-auto mb-4 text-purple-500 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2">Setting Up Your Project</h3>
                  <p className="text-zinc-400">
                    This might take a minute. We're installing dependencies...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
