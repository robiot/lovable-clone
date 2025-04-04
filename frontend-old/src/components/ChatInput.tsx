
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div className="input-container">
      <div className="relative flex items-end rounded-lg border bg-background transition-all">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-10 border-0 resize-none px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-sm sm:text-base leading-relaxed scrollbar-thin",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-200"
          )}
          style={{ maxHeight: "200px" }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          size="icon"
          className={cn(
            "absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground",
            "opacity-90 hover:opacity-100 transition-opacity",
            "shadow-sm hover:shadow",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
