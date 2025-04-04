
import React from 'react';
import { cn } from '@/lib/utils';

export type MessageType = 'user' | 'ai';

export interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  type,
  timestamp = new Date(),
}) => {
  return (
    <div
      className={cn(
        'flex flex-col animate-slide-up',
        type === 'user' ? 'items-end' : 'items-start'
      )}
    >
      <div
        className={cn(
          'message-bubble',
          type === 'user' ? 'message-user' : 'message-ai'
        )}
      >
        <p className="text-sm sm:text-base leading-relaxed">{content}</p>
      </div>
      <span className="text-xs text-muted-foreground mt-1 px-2">
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatMessage;
