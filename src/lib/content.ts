import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  type: 'report' | 'blog';
  tags?: string[];
  readTime?: string;
  slug?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

export function getAllPosts(): Post[] {
  const posts: Post[] = [];

  // Get reports
  const reportsDir = path.join(CONTENT_DIR, 'reports');
  if (fs.existsSync(reportsDir)) {
    const reportFiles = fs.readdirSync(reportsDir);
    for (const fileName of reportFiles) {
      if (fileName.endsWith('.mdx')) {
        const slug = fileName.replace('.mdx', '');
        const filePath = path.join(reportsDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        
        posts.push({
          slug,
          frontmatter: { ...data, type: 'report', slug } as PostFrontmatter,
          content
        });
      }
    }
  }

  // Get blog posts
  const blogDir = path.join(CONTENT_DIR, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir);
    for (const fileName of blogFiles) {
      if (fileName.endsWith('.mdx')) {
        const slug = fileName.replace('.mdx', '');
        const filePath = path.join(blogDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        
        posts.push({
          slug,
          frontmatter: { ...data, type: 'blog', slug } as PostFrontmatter,
          content
        });
      }
    }
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
}

export function getPostBySlug(type: 'report' | 'blog', slug: string): Post | null {
  try {
    const filePath = path.join(CONTENT_DIR, type === 'report' ? 'reports' : 'blog', `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      frontmatter: { ...data, type, slug } as PostFrontmatter,
      content
    };
  } catch (error) {
    console.error(`Error reading ${type}/${slug}:`, error);
    return null;
  }
}

export function getPostsByType(type: 'report' | 'blog'): Post[] {
  return getAllPosts().filter(post => post.frontmatter.type === type);
}

export function getAllSlugs(): { type: 'report' | 'blog'; slug: string }[] {
  const posts = getAllPosts();
  return posts.map(post => ({
    type: post.frontmatter.type,
    slug: post.slug
  }));
}