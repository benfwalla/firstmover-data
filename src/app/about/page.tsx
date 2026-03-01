import { compileMDXContent } from '@/lib/mdx';
import { getPage } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateMetadata() {
  const page = getPage('about');
  return {
    title: page ? `${page.frontmatter.title} | FirstMover Open Data Project` : 'About',
    description: page?.frontmatter.description,
  };
}

export default async function AboutPage() {
  const page = getPage('about');
  if (!page) notFound();

  const Content = await compileMDXContent(page.content);

  return (
    <div className="publication-section narrow">
      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>{page.frontmatter.title}</h1>
      </div>

      <article className="report-narrative">
        <Content />
      </article>
    </div>
  );
}
