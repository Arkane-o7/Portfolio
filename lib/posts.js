import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'public', 'posts');
const DEFAULT_GRADIENT = 'bg-gradient-to-br from-[#0a0a1a] to-[#00001c]';

function toTitleCaseFromSlug(slug) {
  return slug
    .split('-')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function toDisplayDate(rawDate) {
  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return rawDate || 'Undated';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function toExcerpt(markdownBody) {
  const cleaned = markdownBody
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[>#*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 160) {
    return cleaned;
  }

  return `${cleaned.slice(0, 157)}...`;
}

async function readPostFromDisk(fileName) {
  const id = path.basename(fileName, '.md');
  const filePath = path.join(POSTS_DIR, fileName);
  const markdown = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(markdown);

  const rawDate = typeof data.date === 'string' ? data.date : '';
  const parsedDate = new Date(rawDate);
  const dateISO = Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();

  return {
    id,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : toTitleCaseFromSlug(id),
    excerpt:
      typeof data.excerpt === 'string' && data.excerpt.trim()
        ? data.excerpt.trim()
        : toExcerpt(content),
    date: toDisplayDate(rawDate),
    dateISO,
    category: typeof data.category === 'string' && data.category.trim() ? data.category.trim() : 'Notes',
    readTime:
      typeof data.readTime === 'string' && data.readTime.trim() ? data.readTime.trim() : '5 min read',
    gradientClass:
      typeof data.gradientClass === 'string' && data.gradientClass.trim()
        ? data.gradientClass.trim()
        : DEFAULT_GRADIENT,
    coverImage:
      typeof data.coverImage === 'string' && data.coverImage.trim() ? data.coverImage.trim() : null,
    published: data.published !== false,
  };
}

export async function getAllPosts() {
  const files = await fs.readdir(POSTS_DIR);
  const markdownFiles = files.filter((fileName) => fileName.endsWith('.md'));

  const posts = await Promise.all(markdownFiles.map((fileName) => readPostFromDisk(fileName)));

  return posts
    .filter((post) => post.published)
    .sort((a, b) => {
      const aTime = a.dateISO ? new Date(a.dateISO).getTime() : 0;
      const bTime = b.dateISO ? new Date(b.dateISO).getTime() : 0;
      return bTime - aTime;
    });
}

export async function getPostMeta(id) {
  const posts = await getAllPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function getPostHtml(id) {
  const filePath = path.join(process.cwd(), 'public', 'posts', `${id}.md`);
  const markdown = await fs.readFile(filePath, 'utf8');
  const { content } = matter(markdown);
  return marked.parse(content);
}
