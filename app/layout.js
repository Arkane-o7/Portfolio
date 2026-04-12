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
            const MOON_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3c0 .18-.01.36-.01.54A7.5 7.5 0 0 0 20.46 12c.18 0 .36-.01.54-.01z" /></svg>';
            const SUN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-4 h-4"><circle cx="12" cy="12" r="4.5" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 1.75v2.25m0 16v2.25m10.25-10.25H20m-16 0H1.75m16.36 7.46-1.6-1.6M7.49 7.49 5.9 5.9m12.21 0-1.6 1.6M7.49 16.51l-1.6 1.6" /></svg>';

            const resolveTheme = () =>
              document.documentElement.getAttribute('data-theme') === LIGHT ? LIGHT : DARK;

            const applyTheme = (theme) => {
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.style.colorScheme = theme;
            };

            const updateToggleUi = () => {
              const isDark = resolveTheme() === DARK;
              const label = isDark ? 'Dark mode' : 'Light mode';
              const iconState = isDark ? DARK : LIGHT;
              document.querySelectorAll('[data-theme-toggle-label]').forEach((el) => {
                if (el.textContent !== label) {
                  el.textContent = label;
                }
              });

              document.querySelectorAll('[data-theme-toggle-icon]').forEach((el) => {
                if (el.getAttribute('data-theme-icon-state') !== iconState) {
                  el.innerHTML = isDark ? MOON_ICON : SUN_ICON;
                  el.setAttribute('data-theme-icon-state', iconState);
                }
              });

              document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
                toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
                toggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
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
        <Script id="mobile-nav-handler" strategy="afterInteractive">
          {`(() => {
            const compactQuery = window.matchMedia('(max-width: 767px), (max-height: 700px)');

            const getMenuForToggle = (toggle) => {
              const targetId = toggle.getAttribute('data-nav-target');
              if (targetId) {
                return document.getElementById(targetId);
              }
              return document.querySelector('[data-nav-menu]');
            };

            const setOpen = (menu, open) => {
              if (!menu) return;
              menu.setAttribute('data-mobile-open', open ? 'true' : 'false');
            };

            const sync = () => {
              const isCompact = compactQuery.matches;

              document.querySelectorAll('[data-nav-menu]').forEach((menu) => {
                if (!isCompact) {
                  setOpen(menu, true);
                  menu.removeAttribute('data-mobile-initialized');
                  return;
                }

                if (!menu.hasAttribute('data-mobile-initialized')) {
                  setOpen(menu, false);
                  menu.setAttribute('data-mobile-initialized', 'true');
                }
              });

              document.querySelectorAll('[data-mobile-nav-toggle]').forEach((toggle) => {
                const menu = getMenuForToggle(toggle);
                const expanded = !!menu && menu.getAttribute('data-mobile-open') === 'true';
                toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                toggle.setAttribute('data-mobile-open', expanded ? 'true' : 'false');
                toggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
              });
            };

            document.addEventListener('click', (event) => {
              const toggle = event.target.closest('[data-mobile-nav-toggle]');

              if (toggle) {
                event.preventDefault();
                const menu = getMenuForToggle(toggle);
                if (!menu) return;
                const currentlyOpen = menu.getAttribute('data-mobile-open') === 'true';
                setOpen(menu, !currentlyOpen);
                sync();
                return;
              }

              if (!compactQuery.matches) return;

              const clickedInsideMenu = event.target.closest('[data-nav-menu]');
              if (clickedInsideMenu && event.target.closest('a, button[data-theme-toggle]')) {
                setOpen(clickedInsideMenu, false);
                sync();
                return;
              }

              if (!clickedInsideMenu) {
                document.querySelectorAll('[data-nav-menu]').forEach((menu) => {
                  setOpen(menu, false);
                });
                sync();
              }
            });

            document.addEventListener('keydown', (event) => {
              if (event.key !== 'Escape') return;
              if (!compactQuery.matches) return;

              document.querySelectorAll('[data-nav-menu]').forEach((menu) => {
                setOpen(menu, false);
              });
              sync();
            });

            if (typeof compactQuery.addEventListener === 'function') {
              compactQuery.addEventListener('change', sync);
            } else {
              compactQuery.addListener(sync);
            }

            window.addEventListener('pageshow', sync);

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', sync);
            } else {
              sync();
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

          html {
            scroll-behavior: smooth;
            overflow-x: hidden;
            overflow-x: clip;
          }

          body {
            background-color: var(--theme-bg-primary);
            color: var(--theme-text-primary);
            transition: background-color 250ms ease;
            overflow-x: hidden;
            overflow-x: clip;
          }

          html[data-theme='light'] .text-white,
          html[data-theme='light'] .text-\[\#FFFFFF\],
          html[data-theme='light'] .text-\[\#BDBDBD\],
          html[data-theme='light'] .text-\[\#4A4A4A\] {
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

          html[data-theme='light'] .group:hover .group-hover\:text-white {
            color: #000000 !important;
          }

          html[data-theme='light'] .text-\[\#C83030\],
          html[data-theme='light'] .hover\:text-\[\#C83030\]:hover,
          html[data-theme='light'] .group:hover .group-hover\:text-\[\#C83030\] {
            color: #C83030 !important;
          }

          html[data-theme='light'] .text-\[\#FF1F1F\],
          html[data-theme='light'] .hover\:text-\[\#FF1F1F\]:hover,
          html[data-theme='light'] .group:hover .group-hover\:text-\[\#FF1F1F\] {
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
            background-color: rgba(255, 255, 255, 0.84) !important;
            border-color: rgba(71, 85, 105, 0.16) !important;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05), 0 1px 4px rgba(15, 23, 42, 0.03) !important;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
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
          html[data-theme='light'] .group:focus-within .blog-card-title {
            color: #0f172a !important;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
          }

          html[data-theme='light'] .group:hover .blog-card-title {
            color: #C83030 !important;
          }

          html[data-theme='light'] #connect h3,
          html[data-theme='light'] #connect a,
          html[data-theme='light'] #connect p {
            color: #000000 !important;
          }

          html[data-theme='light'] #connect a:hover {
            color: #C83030 !important;
          }

          html[data-theme='light'] #connect button[aria-label='Back to top'],
          html[data-theme='light'] #connect button[aria-label='Back to top'] svg,
          html[data-theme='light'] #connect button[aria-label='Back to top'] svg path {
            color: #ffffff !important;
            stroke: #ffffff !important;
          }

          html[data-theme='light'] .article-content p,
          html[data-theme='light'] .article-content ul,
          html[data-theme='light'] .article-content ol,
          html[data-theme='light'] .article-content li,
          html[data-theme='light'] .article-content figcaption,
          html[data-theme='light'] .article-content small {
            color: #0f172a !important;
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

          .mobile-nav-toggle {
            display: none;
          }

          .mobile-nav-toggle .mobile-nav-toggle-icon {
            position: relative;
            width: 1.1rem;
            height: 0.9rem;
            display: inline-block;
          }

          .mobile-nav-toggle .mobile-nav-toggle-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            border-radius: 999px;
            background: currentColor;
            transform-origin: center;
            transition: top 320ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 220ms ease;
          }

          .mobile-nav-toggle .mobile-nav-toggle-line:nth-child(1) {
            top: 0;
          }

          .mobile-nav-toggle .mobile-nav-toggle-line:nth-child(2) {
            top: 50%;
            transform: translateY(-50%);
          }

          .mobile-nav-toggle .mobile-nav-toggle-line:nth-child(3) {
            top: calc(100% - 2px);
          }

          .mobile-nav-toggle[data-mobile-open='true'] .mobile-nav-toggle-line:nth-child(1) {
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
          }

          .mobile-nav-toggle[data-mobile-open='true'] .mobile-nav-toggle-line:nth-child(2) {
            opacity: 0;
            transform: translateY(-50%) scaleX(0.25);
          }

          .mobile-nav-toggle[data-mobile-open='true'] .mobile-nav-toggle-line:nth-child(3) {
            top: 50%;
            transform: translateY(-50%) rotate(-45deg);
          }

          @media (max-width: 767px), (max-height: 700px) {
            .mobile-nav-toggle {
              position: fixed;
              left: 1rem;
              bottom: 1rem;
              z-index: 60;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 3rem;
              height: 3rem;
              border-radius: 999px;
              border: 1px solid rgba(148, 163, 184, 0.38);
              background: rgba(4, 8, 28, 0.9);
              color: #ffffff;
              box-shadow: 0 14px 32px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
              transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
                          background-color 240ms ease,
                          border-color 240ms ease,
                          box-shadow 280ms ease;
              transform: translateZ(0);
            }

            .mobile-nav-toggle:hover {
              border-color: rgba(226, 232, 240, 0.52);
            }

            .mobile-nav-toggle:active {
              transform: scale(0.95);
            }

            .mobile-nav-toggle:focus-visible {
              outline: 2px solid rgba(200, 48, 48, 0.9);
              outline-offset: 2px;
            }

            [data-nav-menu] {
              left: 1rem !important;
              right: auto !important;
              width: fit-content;
              min-width: 12.5rem;
              max-width: min(17rem, calc(100vw - 2rem));
              bottom: 4.65rem !important;
              max-height: min(68vh, 24rem);
              padding: 1rem 1rem 1.1rem;
              border-radius: 1.1rem;
              border: 1px solid rgba(148, 163, 184, 0.28);
              background: rgba(4, 8, 28, 0.94);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              box-shadow: 0 20px 36px rgba(2, 6, 23, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
              overflow-y: auto;
              overflow-x: hidden;
              transform-origin: bottom left;
              will-change: transform, opacity, filter;
              transition: opacity 280ms ease, transform 340ms cubic-bezier(0.22, 1, 0.36, 1), filter 280ms ease;
            }

            [data-nav-menu][data-mobile-open='false'] {
              opacity: 0;
              transform: translateY(0.9rem) scale(0.96);
              filter: blur(2px);
              pointer-events: none;
            }

            [data-nav-menu][data-mobile-open='true'] {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
              pointer-events: auto;
            }

            [data-nav-menu] .nav-btn,
            [data-nav-menu] .theme-toggle-btn {
              font-size: 1rem !important;
              line-height: 1.35;
            }

            [data-nav-menu] > * {
              opacity: 0;
              transform: translateY(0.45rem);
              transition: opacity 220ms ease,
                          transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                          color 220ms ease;
            }

            [data-nav-menu][data-mobile-open='true'] > * {
              opacity: 1;
              transform: translateY(0);
            }

            [data-nav-menu][data-mobile-open='true'] > *:nth-child(1) { transition-delay: 45ms; }
            [data-nav-menu][data-mobile-open='true'] > *:nth-child(2) { transition-delay: 75ms; }
            [data-nav-menu][data-mobile-open='true'] > *:nth-child(3) { transition-delay: 105ms; }
            [data-nav-menu][data-mobile-open='true'] > *:nth-child(4) { transition-delay: 135ms; }
            [data-nav-menu][data-mobile-open='true'] > *:nth-child(5) { transition-delay: 165ms; }
            [data-nav-menu][data-mobile-open='true'] > *:nth-child(6) { transition-delay: 195ms; }

            [data-nav-menu][data-mobile-open='false'] > * {
              transition-delay: 0ms !important;
            }
          }

          html[data-theme='light'] .mobile-nav-toggle {
            background: rgba(255, 255, 255, 0.94);
            color: #0f172a;
            border-color: rgba(71, 85, 105, 0.34);
            box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.42) inset;
          }

          @media (max-width: 767px), (max-height: 700px) {
            html[data-theme='light'] [data-nav-menu] {
              background: rgba(255, 255, 255, 0.96);
              border-color: rgba(71, 85, 105, 0.28);
              box-shadow: 0 22px 36px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.42) inset;
            }
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
