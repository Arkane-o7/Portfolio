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
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
            const storageKey = 'theme';
            let theme = 'dark';

            try {
              const savedTheme = localStorage.getItem(storageKey);
              if (savedTheme === 'dark' || savedTheme === 'light') {
                theme = savedTheme;
              }
            } catch (_) {
              // no-op
            }

            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.style.colorScheme = theme;
          })();`}
        </Script>
        <Script id="theme-toggle-handler" strategy="afterInteractive">
          {`(() => {
            const storageKey = 'theme';
            const DARK = 'dark';
            const LIGHT = 'light';

            const resolveTheme = () =>
              document.documentElement.getAttribute('data-theme') === LIGHT ? LIGHT : DARK;

            const applyTheme = (theme) => {
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.style.colorScheme = theme;
            };

            const updateToggleUi = () => {
              const label = resolveTheme() === DARK ? 'Light mode' : 'Dark mode';
              document.querySelectorAll('[data-theme-toggle-label]').forEach((el) => {
                if (el.textContent !== label) {
                  el.textContent = label;
                }
              });
            };

            const toggleTheme = () => {
              const nextTheme = resolveTheme() === DARK ? LIGHT : DARK;
              applyTheme(nextTheme);

              try {
                localStorage.setItem(storageKey, nextTheme);
              } catch (_) {
                // no-op
              }

              updateToggleUi();
              window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
            };

            document.addEventListener('click', (event) => {
              const toggle = event.target.closest('[data-theme-toggle]');
              if (!toggle) return;
              event.preventDefault();
              toggleTheme();
            });

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', updateToggleUi);
            } else {
              updateToggleUi();
            }

            const observer = new MutationObserver(() => {
              updateToggleUi();
            });

            if (document.body) {
              observer.observe(document.body, { childList: true, subtree: true });
            }

            window.addEventListener('pageshow', updateToggleUi);
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
          :root {
            --theme-bg-primary: #000000;
            --theme-bg-secondary: #00001c;
            --theme-text-primary: #ffffff;
            --theme-text-secondary: #bdbdbd;
            --theme-text-muted: #4a4a4a;
          }

          html[data-theme='light'] {
            --theme-bg-primary: #38bdf8;
            --theme-bg-secondary: #ffffff;
            --theme-text-primary: #000000;
            --theme-text-secondary: #000000;
            --theme-text-muted: #000000;
          }

          html { scroll-behavior: smooth; }
          body {
            background-color: var(--theme-bg-primary);
            color: var(--theme-text-primary);
            transition: background-color 250ms ease;
          }

          html[data-theme='light'] .text-white,
          html[data-theme='light'] .text-\[\#FFFFFF\] {
            color: var(--theme-text-primary) !important;
          }

          html[data-theme='light'] [class*='text-white'],
          html[data-theme='light'] [class*='text-[#FFFFFF]'],
          html[data-theme='light'] [class*='text-[#BDBDBD]'],
          html[data-theme='light'] [class*='text-[#4A4A4A]'] {
            color: #000000 !important;
          }

          html[data-theme='light'] .text-\[\#BDBDBD\] {
            color: var(--theme-text-secondary) !important;
          }

          html[data-theme='light'] .text-\[\#4A4A4A\] {
            color: var(--theme-text-muted) !important;
          }

          html[data-theme='light'] .hover\:text-white:hover {
            color: var(--theme-text-primary) !important;
          }

          html[data-theme='light'] [class*='hover:text-white']:hover,
          html[data-theme='light'] [class*='group-hover:text-white']:hover {
            color: #000000 !important;
          }

          html[data-theme='light'] [class*='text-[#C83030]'],
          html[data-theme='light'] [class*='hover:text-[#C83030]']:hover,
          html[data-theme='light'] [class*='group-hover:text-[#C83030]']:hover {
            color: #C83030 !important;
          }

          html[data-theme='light'] [class*='text-[#FF1F1F]'],
          html[data-theme='light'] [class*='hover:text-[#FF1F1F]']:hover,
          html[data-theme='light'] [class*='group-hover:text-[#FF1F1F]']:hover {
            color: #FF1F1F !important;
          }

          html[data-theme='dark'] .blog-card-shell {
            background-color: rgba(24, 31, 52, 0.48) !important;
            border-color: rgba(100, 116, 139, 0.34) !important;
          }

          html[data-theme='dark'] .blog-card-media {
            border-radius: 1.25rem !important;
            background-color: #04061d !important;
            border-color: rgba(148, 163, 184, 0.32) !important;
            box-shadow: none !important;
            outline: 1px solid rgba(226, 232, 240, 0.1);
            outline-offset: 0;
            isolation: isolate;
            contain: paint;
            clip-path: inset(0 round 1.25rem);
          }

          html[data-theme='dark'] .blog-card-media::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
            pointer-events: none;
          }

          html[data-theme='dark'] .blog-card-media > .opacity-80 {
            opacity: 0.58 !important;
          }

          html[data-theme='dark'] .blog-card-placeholder {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: linear-gradient(160deg, rgba(8, 11, 33, 0.96), rgba(4, 6, 29, 0.96));
          }

          html[data-theme='dark'] .blog-card-media > img,
          html[data-theme='dark'] .blog-card-placeholder,
          html[data-theme='dark'] .blog-card-gradient {
            clip-path: inset(0 round 1.25rem);
          }

          html[data-theme='light'] .blog-card-shell {
            background-color: rgba(226, 232, 240, 0.62) !important;
            border-color: rgba(100, 116, 139, 0.26) !important;
          }

          html[data-theme='light'] .blog-card-media {
            background-color: #d8e0ea !important;
            border-color: rgba(71, 85, 105, 0.24) !important;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16) !important;
          }

          html[data-theme='light'] .blog-card-media::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
            pointer-events: none;
          }

          html[data-theme='light'] .blog-card-media > .opacity-80 {
            opacity: 0.52 !important;
          }

          html[data-theme='light'] .blog-card-title,
          html[data-theme='light'] .group:hover .blog-card-title {
            color: #ffffff !important;
          }

          html[data-theme='light'] #connect h3,
          html[data-theme='light'] #connect a,
          html[data-theme='light'] #connect p {
            color: #000000 !important;
          }

          html[data-theme='light'] #connect a:hover {
            color: #C83030 !important;
          }

          html[data-theme='light'] .article-content p {
            color: var(--theme-text-secondary) !important;
          }

          html[data-theme='light'] .article-content h1,
          html[data-theme='light'] .article-content h2,
          html[data-theme='light'] .article-content h3,
          html[data-theme='light'] .article-content h4,
          html[data-theme='light'] .article-content strong,
          html[data-theme='light'] .article-content blockquote {
            color: var(--theme-text-primary) !important;
          }

          html[data-theme='light'] .article-content a:hover {
            color: var(--theme-text-primary) !important;
            text-decoration-color: var(--theme-text-primary) !important;
          }

          html[data-theme='light'] #canvas-container .crt-overlay {
            display: none !important;
          }

          html[data-theme='light'] #canvas-container canvas {
            filter: none !important;
          }

          .theme-bg-primary {
            background-color: var(--theme-bg-primary) !important;
          }

          .theme-bg-secondary {
            background-color: var(--theme-bg-secondary) !important;
          }

          .theme-bg-gradient-main {
            background: linear-gradient(to bottom, var(--theme-bg-primary) 0%, var(--theme-bg-secondary) 100%) !important;
          }

          .theme-bg-gradient-reverse {
            background: linear-gradient(to bottom, var(--theme-bg-secondary) 0%, var(--theme-bg-primary) 100%) !important;
          }

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
