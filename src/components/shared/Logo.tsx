import Link from 'next/link';
import { Music2 } from 'lucide-react'; // Using Music2 as a generic music icon

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-2xl" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Music2 size={iconSize} className="text-accent" />
      <span className={`font-bold ${textSize} text-primary`}>
        Tricion Studio
      </span>
    </Link>
  );
}
