import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrimlyLogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
  href?: string;
}

export function TrimlyLogo({
  size = 32,
  showText = true,
  textClassName,
  className,
  href,
}: TrimlyLogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/logo-icon.svg"
        alt="Trimly"
        width={size}
        height={size}
        className="flex-shrink-0"
        priority
      />
      {showText && (
        <span className={cn('font-display font-bold text-text-primary tracking-tight', textClassName)}>
          Trimly
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
