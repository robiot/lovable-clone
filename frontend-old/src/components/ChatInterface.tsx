
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage, { ChatMessageProps, MessageType } from './ChatMessage';
import ChatInput from './ChatInput';
import AuthModal from './AuthModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface Message extends Omit<ChatMessageProps, 'timestamp'> {
  id: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  apiEndpoint: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiEndpoint }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string>('http://localhost:3000');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Check for existing auth on mount
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('userToken');
    
    if (storedId && storedToken) {
      setUserId(storedId);
      setUserToken(storedToken);
      setIsAuthenticated(true);
    } else {
      setShowAuthModal(true);
    }
    
    // Welcome message
    setMessages([
      {
        id: 'welcome',
        content: 'Hello! How can I assist you today? Send me prompts to modify the Hero component.',
        type: 'ai',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthenticate = (id: string, token: string) => {
    // Store credentials
    setUserId(id);
    setUserToken(token);
    localStorage.setItem('userId', id);
    localStorage.setItem('userToken', token);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    toast({
      title: "Authentication successful",
      description: "Environment variables updated successfully.",
      duration: 3000,
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to /api/change endpoint
      const response = await fetch('http://localhost:3001/api/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: content })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.success 
          ? "I've updated the Hero component based on your request. You can see the changes in the preview." 
          : data.error || "I'm sorry, I couldn't process that request.",
        type: 'ai',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Trigger iframe refresh
      refreshIframe();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      toast({
        title: "Error",
        description: "Failed to update Hero component. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, there was an error processing your request. Please try again.",
        type: 'ai',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.location.reload();
      
      toast({
        title: "Refreshing preview",
        description: "The preview is being updated with your changes.",
        duration: 3000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    setUserId('');
    setUserToken('');
    setIsAuthenticated(false);
    setShowAuthModal(true);
    setMessages([]);
  };

  return (
    <>
      <div className="chat-container flex h-screen">
        {/* Left Panel - Chat */}
        <div className="chat-panel w-[35rem] flex flex-col border-r border-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-medium">Hero Component Editor</h2>
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            )}
          </div>
          
          {/* Messages */}
          <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                type={message.type}
                timestamp={message.timestamp}
              />
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-2 animate-pulse message-bubble bg-secondary text-secondary-foreground self-start">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || !isAuthenticated}
            placeholder={isAuthenticated ? "Describe changes to the Hero component..." : "Please authenticate to continue..."}
          />
        </div>
        
        {/* Right Panel - Iframe */}
        <div className="w-full h-full relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshIframe}
              className="bg-background/80 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          
          <iframe
            ref={iframeRef}
            src="http://localhost:3000"
            className="h-full w-full"
            title="Web Preview"
            sandbox="allow-same-origin allow-scripts allow-forms"
            loading="lazy"
          />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onAuthenticate={handleAuthenticate}
      />
    </>
  );
};

export default ChatInterface;
