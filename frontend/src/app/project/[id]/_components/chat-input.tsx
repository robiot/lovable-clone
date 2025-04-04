import { Button } from '@/components/ui/button';
import { Paperclip, Code, Smile, Send, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ input, setInput, isLoading, onSubmit }: ChatInputProps) {
  return (
    <div className="p-4 border-t border-zinc-800">
      <form onSubmit={onSubmit} className="space-y-3">
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
                onSubmit(e);
              }
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
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
  );
} 