import { Button } from "@/components/ui/button";
import { LogoSVG } from "@/components/ui/logo-svg";
import { Terminal, Code, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-16 bg-zinc-900 flex flex-col items-center py-4">
      <Link href="/">
        <LogoSVG size={32} className="mb-8" />
      </Link>
      <div className="flex-1 flex flex-col gap-4 items-center">
        <Button
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Messages"
        >
          <MessageCircle size={20} />
        </Button>

        <Button
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Files"
        >
          <Code size={20} />
        </Button>
      </div>
    </div>
  );
}
