import { Message, MessageRole } from '@/types/chat';
import { formatDate } from '@/lib/utils';
import { MarkdownContent } from './markdown-content';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

export function MessageList({ messages, isThinking }: MessageListProps) {
  return (
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
    </div>
  );
} 