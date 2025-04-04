import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Project } from "@/types/chat";
import { IframeInfo } from "./project-view";

interface PreviewPanelProps {
  project: Project;
  iframe: IframeInfo;
  iframeKey: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onIframeLoad: () => void;
  setInput: (value: string) => void;
}

export function PreviewPanel({
  project,
  iframe,
  iframeKey,
  iframeRef,
  onIframeLoad,
  setInput,
}: PreviewPanelProps) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex-1 bg-zinc-950 relative">
        <>
          {iframe.loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80">
              <div className="text-center">
                <Loader2
                  size={40}
                  className="mx-auto mb-4 text-purple-500 animate-spin"
                />
                <h3 className="text-xl font-semibold mb-2">Loading Preview</h3>
              </div>
            </div>
          )}

          {iframe.url && (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={iframe.url || ""}
              className="w-full h-full border-none"
              title="Project Preview"
              onLoad={onIframeLoad}
            />
          )}
        </>
      </div>
    </div>
  );
}
