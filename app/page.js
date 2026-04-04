import fs from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';

function extractBodyInfo(html) {
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    return { className: '', content: '<main></main>' };
  }

  const attrs = bodyMatch[1] || '';
  const classMatch = attrs.match(/class\s*=\s*"([^"]*)"/i);
  const className = classMatch ? classMatch[1] : '';
  const content = bodyMatch[2].replace(/<script>[\s\S]*?<\/script>\s*$/i, '');

  return { className, content };
}

export default async function HomePage() {
  const indexPath = path.join(process.cwd(), 'index.html');
  const rawHtml = await fs.readFile(indexPath, 'utf8');
  const bodyInfo = extractBodyInfo(rawHtml);

  return (
    <>
      <div className={bodyInfo.className} dangerouslySetInnerHTML={{ __html: bodyInfo.content }} />
      <Script src="/js/light-sky-pattern.js" strategy="afterInteractive" />
      <Script src="/js/home-interactions.js" strategy="afterInteractive" />
    </>
  );
}
