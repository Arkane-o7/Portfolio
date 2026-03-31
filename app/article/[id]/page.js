import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostHtml, getPostMeta } from '../../../lib/posts';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPostMeta(id);
  return { title: post?.title ?? 'Article Not Found' };
}

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

function patchArticleTemplate(content, post, renderedMarkdown) {
  let out = content;

  out = out.replace(
    /<article id="markdown-container" class="article-content">[\s\S]*?<\/article>/i,
    `<article id="markdown-container" class="article-content">\n${renderedMarkdown}\n        </article>`
  );

  out = out.replace(
    /<script type="module">[\s\S]*?<\/script>\s*$/i,
    ''
  );

  out = out.replace(
    /<h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-\[5rem\] font-serif text-white tracking-tight leading-\[1\.05\] mt-2 mb-4">[\s\S]*?<\/h1>/i,
    `<h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-serif text-white tracking-tight leading-[1.05] mt-2 mb-4">\n                ${post.title}\n            </h1>`
  );

  out = out.replace(
    /<span class="text-xs font-mono text-\[#FF1F1F\] bg-\[#FF1F1F\]\/10 uppercase tracking-widest px-3 py-1\.5 rounded-full">[\s\S]*?<\/span>/i,
    `<span class="text-xs font-mono text-[#FF1F1F] bg-[#FF1F1F]/10 uppercase tracking-widest px-3 py-1.5 rounded-full">${post.category}</span>`
  );

  out = out.replace(
    /<span class="text-xs font-mono text-\[#4A4A4A\] tracking-widest uppercase">[A-Za-z]{3} \d{2}, \d{4}<\/span>/i,
    `<span class="text-xs font-mono text-[#4A4A4A] tracking-widest uppercase">${post.date}</span>`
  );

  out = out.replace(
    /<span class="text-xs font-mono text-\[#4A4A4A\] tracking-widest uppercase">\d+ min read<\/span>/i,
    `<span class="text-xs font-mono text-[#4A4A4A] tracking-widest uppercase">${post.readTime}</span>`
  );

  out = out.replace(/href="blogs\.html"/g, 'href="/blogs"');
  out = out.replace(/href="index\.html#about"/g, 'href="/#about"');
  out = out.replace(/href="index\.html#works"/g, 'href="/#works"');
  out = out.replace(/href="index\.html"/g, 'href="/"');

  return out;
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const post = await getPostMeta(id);

  if (!post) {
    notFound();
  }

  let renderedMarkdown;
  try {
    renderedMarkdown = await getPostHtml(id);
  } catch {
    notFound();
  }

  const articlePath = path.join(process.cwd(), 'article.html');
  const rawTemplate = await fs.readFile(articlePath, 'utf8');
  const bodyInfo = extractBodyInfo(rawTemplate);
  const html = patchArticleTemplate(bodyInfo.content, post, renderedMarkdown);

  return <div className={bodyInfo.className} dangerouslySetInnerHTML={{ __html: html }} />;
}
