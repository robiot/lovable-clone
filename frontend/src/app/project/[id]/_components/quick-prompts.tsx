interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
  isLoading: boolean;
}

export function QuickPrompts({ onPromptSelect, isLoading }: QuickPromptsProps) {
  const quickPrompts = [
    { label: 'Fix errors', prompt: 'There seems to be an error in the application. Can you help fix it?' },
    { label: 'Add feature', prompt: 'Can you add a new feature to allow users to search content?' },
    { label: 'Improve UI', prompt: 'The UI needs some improvements. Can you make it more visually appealing?' },
    { label: 'Optimize code', prompt: 'Can you optimize the code for better performance?' },
  ];

  return (
    <div className="px-4 py-2 border-t border-zinc-800 flex flex-wrap gap-2">
      {quickPrompts.map((prompt) => (
        <button
          key={prompt.label}
          className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          onClick={() => onPromptSelect(prompt.prompt)}
          disabled={isLoading}
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
} 