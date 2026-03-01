import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import * as devRuntime from 'react/jsx-dev-runtime';
import remarkGfm from 'remark-gfm';
import type { ComponentType } from 'react';

const isDev = process.env.NODE_ENV !== 'production';

export async function compileMDXContent(
  source: string,
  components?: Record<string, ComponentType<any>>
): Promise<ComponentType<any>> {
  const code = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
    development: isDev,
  });

  const { default: Content } = await run(String(code), {
    ...(isDev ? devRuntime : runtime),
    baseUrl: import.meta.url,
  });

  if (components) {
    return function MDXWrapper() {
      return <Content components={components} />;
    };
  }

  return Content;
}
