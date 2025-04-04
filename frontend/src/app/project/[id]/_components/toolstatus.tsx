import { Loader2 } from "lucide-react";

interface ToolStatusProps {
  activeTools: {
    reading?: boolean;
    writing?: boolean;
    running?: boolean;
  };
}

export function ToolStatus({ activeTools }: ToolStatusProps) {
  if (!Object.values(activeTools).some(Boolean)) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
      <Loader2 size={14} className="animate-spin" />
      {activeTools.reading && <span>Reading file...</span>}
      {activeTools.writing && <span>Writing file...</span>}
      {activeTools.running && <span>Running command...</span>}
    </div>
  );
}
