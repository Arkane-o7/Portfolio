import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Abhilaksh Chauhan - Portfolio',
  description: 'Portfolio + blogs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Script id="tailwind-config" strategy="beforeInteractive">
          {`tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['"Instrument Sans"', 'sans-serif'],
                  serif: ['"Instrument Serif"', 'serif'],
                  hand: ['"Caveat"', 'cursive'],
                  mono: ['"Courier New"', 'Courier', 'monospace'],
                }
              }
            }
          }`}
        </Script>
        <Script id="netlify-invite-redirect" strategy="beforeInteractive">
          {`(() => {
            try {
              const hasInviteToken = window.location.hash.includes('invite_token=');
              const isAdminPath = window.location.pathname === '/admin' || window.location.pathname === '/admin/';

              if (hasInviteToken && !isAdminPath) {
                window.location.replace('/admin/' + window.location.hash);
              }
            } catch (_) {
              // no-op
            }
          })();`}
        </Script>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Caveat:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          html { scroll-behavior: smooth; }
          body { background-color: #000000; color: #FFFFFF; }

          .crt-overlay {
            background:
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%),
              linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04));
            background-size: 100% 4px, 3px 100%;
            animation: scanlines 10s linear infinite;
            -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
          }

          @keyframes scanlines {
            0% { background-position: 0 0, 0 0; }
            100% { background-position: 0 20px, 0 0; }
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
