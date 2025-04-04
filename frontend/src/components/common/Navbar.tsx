import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";
import { LogoSVG } from "../ui/logo-svg";
export const Navbar: FC = () => {
  return (
    <header className="container mx-auto py-4 px-4 flex items-center justify-between sticky top-0 bg-black text-white z-50">
      <div className="flex items-center gap-2">
        <LogoSVG size={24} />
        <span className="font-semibold">WEBAI</span>
      </div>

      <div className="flex items-center gap-6 ">
        <Link href="#" className="header-link ">
          Support
        </Link>
        <Link href="#" className="header-link">
          Launched
        </Link>
        <Link href="#" className="header-link">
          Learn
        </Link>

        <div className="ml-2 flex items-center">
          <Button
            variant="outline"
            className="text-sm rounded-lg bg-transparent"
          >
            Elliot <span className="ml-1">▼</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
