import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoSVG } from '@/components/ui/logo-svg';

export default function StaticProjectPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <LogoSVG size={80} className="mb-8" />

      <h1 className="text-4xl font-bold mb-6 text-center">
        This is a demo version
      </h1>

      <Link href="/">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
