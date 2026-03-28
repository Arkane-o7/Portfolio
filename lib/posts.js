import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

export const posts = [
  {
    id: 'ascii-canvases',
    title: 'Building High-Performance Ascii Canvases',
    excerpt:
      'Diving deep into requestAnimationFrame paradigms, managing memory footprints in heavy loops, and manipulating raw pixel buffers...',
    date: 'Mar 24, 2026',
    category: 'Engineering',
    readTime: '8 min read',
    gradientClass: 'bg-gradient-to-br from-[#0a0a1a] to-[#00001c]',
  },
  {
    id: 'ai-slop-aesthetics',
    title: "The Death of 'AI Slop' Aesthetics",
    excerpt:
      'Why building unique, brutalist, and personalized web interfaces is the only way to stand out in an era of auto-generated templates.',
    date: 'Jan 12, 2026',
    category: 'Design',
    readTime: '6 min read',
    gradientClass: 'bg-gradient-to-tl from-[#0a0a1a] to-[#00001c]',
  },
  {
    id: 'scaling-redis-rust',
    title: 'Scaling Redis with Native Rust Addons',
    excerpt:
      'A retrospective on ripping out legacy middleware and injecting native Rust extensions to process throughput up to 400% faster.',
    date: 'Nov 05, 2025',
    category: 'Rust',
    readTime: '9 min read',
    gradientClass: 'bg-gradient-to-b from-[#0a0a1a] to-[#00001c]',
  },
];

export function getAllPosts() {
  return posts;
}

export function getPostMeta(id) {
  return posts.find((post) => post.id === id) ?? null;
}

export async function getPostHtml(id) {
  const filePath = path.join(process.cwd(), 'public', 'posts', `${id}.md`);
  const markdown = await fs.readFile(filePath, 'utf8');
  return marked.parse(markdown);
}
