'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  href?: string;
}

const LOGO_SRC = '/logo/logo.png';

const sizeMap = {
  sm: { width: 16, height: 16 },
  md: { width: 32, height: 32 },
  lg: { width: 64, height: 64 },
  xl: { width: 128, height: 128 },
};

export function Logo({
  size = 'md',
  className,
  showText = true,
  textClassName,
  href
}: LogoProps) {
  const t = useTranslations('logo');
  const { width, height } = sizeMap[size];

  const logoContent = (
    <div className={cn('flex items-center space-x-2', className)}>
      <Image
        src={LOGO_SRC}
        alt={t('imageAlt')}
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <div className={textClassName}>
          <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-bold text-lg inline-block">
            {t('name')}
          </h1>
          <p className="text-white/70 text-xs">{t('tagline')}</p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
