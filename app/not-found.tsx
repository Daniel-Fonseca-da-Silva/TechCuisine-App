'use client';

/**
 * Root 404 page. Rendered when the request path does not match any route
 * and does not fall under [locale] (e.g. unrecognized or non-locale path).
 * For paths under a valid locale, app/[locale]/not-found.tsx is used instead.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';

const content = {
  en: {
    title: 'Page Not Found',
    subtitle: "Oops! Looks like you got lost in digital space",
    description:
      "The page you're looking for doesn't exist or has been moved. But don't worry, we'll help you find what you need!",
    goHome: 'Go Home',
    errorCode: '404',
  },
};

const goHomeLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  minWidth: '12rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  color: 'white',
  background: 'linear-gradient(to right, #a855f7, #3b82f6)',
  border: 'none',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
} as const;

const rootStyle = {
  position: 'fixed' as const,
  inset: 0,
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden' as const,
  background: 'linear-gradient(to bottom, #581c87 0%, #6b21a8 50%, #5b21b6 100%)',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  padding: '1rem',
};

const centerWrapperStyle = {
  position: 'absolute' as const,
  inset: 0,
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  padding: '1rem',
};

const cardStyle = {
  position: 'relative' as const,
  zIndex: 10,
  width: '100%',
  maxWidth: 'min(90vw, 48rem)',
  textAlign: 'center' as const,
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '1.5rem',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '2rem',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export default function NotFound() {
  const t = content.en;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .not-found-root { margin: 0; box-sizing: border-box; }
          .not-found-root * { box-sizing: border-box; }
        `,
      }} />
      <div className="not-found-root" style={rootStyle}>
        <div style={centerWrapperStyle}>
          <div style={cardStyle}>
            {!mounted ? (
              <div style={{ minHeight: '12rem' }} aria-hidden />
            ) : (
              <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{t.errorCode}</span>
              </div>
            </div>

            <h1
              style={{
                marginBottom: '0.75rem',
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {t.title}
            </h1>

            <h2
              style={{
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {t.subtitle}
            </h2>

            <p
              style={{
                margin: '0 auto 2rem',
                maxWidth: '28rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {t.description}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Link
                href="/"
                style={goHomeLinkStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #2563eb)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #3b82f6)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                }}
              >
                {t.goHome} →
              </Link>
            </div>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '2.5rem',
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.2), rgba(96, 165, 250, 0.2)',
            filter: 'blur(24px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '2.5rem',
            width: '8rem',
            height: '8rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(192, 132, 252, 0.2)',
            filter: 'blur(24px)',
          }}
        />
      </div>
    </>
  );
}
