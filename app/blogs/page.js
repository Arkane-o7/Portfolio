import fs from 'node:fs/promises';
import path from 'node:path';
import { getAllPosts } from '../../lib/posts';

export const metadata = {
  title: 'Blogs - Abhilaksh Chauhan',
};

function extractBodyInfo(html) {
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    return { className: '', content: '<main></main>' };
  }

  const attrs = bodyMatch[1] || '';
  const classMatch = attrs.match(/class\s*=\s*"([^"]*)"/i);

  return {
    className: classMatch ? classMatch[1] : '',
    content: bodyMatch[2],
  };
}

function patchBlogCardLinks(content) {
  const ids = getAllPosts().map((post) => post.id);
  let i = 0;

  return content.replace(/href="article\.html"/g, () => {
    const id = ids[i] ?? ids[ids.length - 1] ?? 'ascii-canvases';
    i += 1;
    return `href="/article/${id}"`;
  });
}

export default async function BlogsPage() {
  const blogsPath = path.join(process.cwd(), 'blogs.html');
  const rawHtml = await fs.readFile(blogsPath, 'utf8');
  const bodyInfo = extractBodyInfo(rawHtml);
  const patchedHtml = patchBlogCardLinks(bodyInfo.content);

  return (
    <div className={bodyInfo.className} dangerouslySetInnerHTML={{ __html: patchedHtml }} />
  );
}
