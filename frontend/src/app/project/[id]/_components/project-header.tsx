import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { type Project } from '@/types/chat';

interface ProjectHeaderProps {
  project: Project;
  currentPage: string;
  isThinking: boolean;
  onRefresh: () => void;
}

export function ProjectHeader({ project, currentPage, isThinking, onRefresh }: ProjectHeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 flex items-center px-4">
      <div className="ml-3 px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400">
        ready
      </div>
      {currentPage && (
        <div className="ml-4 text-sm text-zinc-500">
          Current page: <span className="text-zinc-300">{currentPage}</span>
        </div>
      )}
      <div className="flex-grow" />
      <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isThinking}>
        <RefreshCw size={16} className={`mr-2 ${isThinking ? 'animate-spin' : ''}`} />
        Refresh Preview
      </Button>
    </header>
  );
} 