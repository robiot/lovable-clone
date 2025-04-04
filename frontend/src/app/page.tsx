"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "@/components/ui/logo-svg";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Check if we're in production or development
      if (process.env.NODE_ENV === "production") {
        // In production (static export), just show a message
        setMessage(
          "This is a demo. In the full version, this would create a new project."
        );
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } else {
        // In development, actually create the project
        const response = await fetch("/api/createproject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create project");
        }

        // Redirect to project page
        router.push(`/project/${data.projectId}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center">
          <LogoSVG className="mb-8" />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-6">
            Idea to app in seconds.
          </h1>

          <p className="text-lg text-zinc-400 text-center mb-12">
            Webai is your superhuman fullstack engineer
          </p>

          {message && (
            <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-4">
              {message}
            </div>
          )}

          {/* Input Card */}
          <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden mb-8">
            <form onSubmit={handleCreateProject}>
              <div className="p-5">
                <p className="text-zinc-400 mb-4">create</p>
                <div className="flex flex-col gap-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the app you want to build..."
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  {error && (
                    <div className="text-red-500 text-sm py-2">{error}</div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="button-outline"
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                        </svg>
                        Attach
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="button-outline"
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Import
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={isLoading || !prompt.trim()}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="button-outline"
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                        Public
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Access Demo Project */}
          <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 mb-8 text-center">
            <h3 className="text-lg font-medium mb-2">Try the Demo Project</h3>
            <p className="text-zinc-400 mb-4">
              Experience the fully functional chat interface with our
              pre-configured demo project
            </p>
            <Link href="/project/demo-project">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Open Demo Project
              </Button>
            </Link>
          </div>

          {/* Template Cards */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3">
            <TemplateCard name="3D product viewer" />
            <TemplateCard name="Bill splitter" />
            <TemplateCard name="E-commerce store" />
            <TemplateCard name="Slidev presentation" />
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Tabs */}
          <div className="w-full flex gap-4 mb-6">
            <button className="button-dark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
              </svg>
              My Projects
            </button>
            <button className="button-outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" x2="22" y1="12" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Latest
            </button>
            <button className="button-outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </button>
          </div>

          {/* No Projects Message */}
          <div className="text-zinc-500 text-center py-12">
            No projects found
          </div>
        </div>
      </main>
    </div>
  );
}

function TemplateCard({ name }: { name: string }) {
  return (
    <button className="card-template p-3 flex items-center justify-between group">
      <span className="text-sm text-zinc-300 group-hover:text-white">
        {name}
      </span>
      <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300" />
    </button>
  );
}
