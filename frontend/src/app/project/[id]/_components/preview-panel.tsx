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
        {project.status === "ready" ? (
          <>
            {iframe.loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80">
                <div className="text-center">
                  <Loader2
                    size={40}
                    className="mx-auto mb-4 text-purple-500 animate-spin"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    Loading Preview
                  </h3>
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
        ) : project.status === "error" ? (
          <div className="text-center p-8 h-full flex flex-col items-center justify-center">
            <XCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">
              Error Starting Project
            </h3>
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
            <Loader2
              size={48}
              className="mx-auto mb-4 text-purple-500 animate-spin"
            />
            <h3 className="text-xl font-semibold mb-2">
              Setting Up Your Project
            </h3>
            <p className="text-zinc-400">
              This might take a minute. We're installing dependencies...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
