import fs from 'fs';
import * as matter from 'gray-matter';
import { GetStaticProps } from 'next';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import React from 'react';
import autolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import DocPage from '../../src/components/DocPage';
import Document from '../../src/components/openapi/Document';
import { OpenAPIV3 } from 'openapi-types';
import { fetchOpenAPISpec, getApiLinks } from '../../lib/openapi';
import { OpenAPILink } from '../../src/components/menu/OpenAPILinks';

interface Props {
  metadata?: { [key: string]: unknown };
  mdxAuthenticationSource?: MDXRemoteSerializeResult;
  openapi: OpenAPIV3.Document;
  openAPILinks: OpenAPILink[];
}

export default function reference({
  mdxAuthenticationSource,
  openapi,
  openAPILinks,
  metadata = {},
}: Props) {
  return (
    <DocPage
      mdxSource={mdxAuthenticationSource}
      {...metadata}
      openAPILinks={openAPILinks}
    >
      <div className="my-12">
        <Document document={openapi} />
      </div>
    </DocPage>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const docsDirectory = path.join(process.cwd(), 'docs');
  const filePath = path.join(docsDirectory, 'rest-api/authentication.mdx');
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const openapi = await fetchOpenAPISpec({ dereference: true });
  const openAPILinks = getApiLinks(openapi);

  // @ts-ignore
  const { content, data } = matter(fileContents);
  const mdxAuthenticationSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        [rehypeSlug, {}],
        [autolinkHeadings, { behavior: 'wrap' }],
      ],
    },
  });
  return {
    props: {
      mdxAuthenticationSource,
      metadata: data,
      openapi,
      openAPILinks,
    },
  };
};
