import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';
import BackButton from '../components/backButton';
import Layout from '../components/layout';
import SEO from '../components/seo';

export default function NewsTemplate({
  data: {
    mdx: { frontmatter, body },
  },
}) {
  return (
    <Layout>
      <SEO title={frontmatter.title} />
      <div className="content" style={{ marginBottom: 160 }}>
        <BackButton />

        <h1 className="title">{frontmatter.title}</h1>

        <p className="text-gray-500" title={frontmatter.fullDate}>
          {frontmatter.date}
        </p>

        <MDXRenderer>{body}</MDXRenderer>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    mdx(fields: { path: { eq: $path } }) {
      frontmatter {
        title
        fullDate: date
        date(fromNow: true)
      }
      body
    }
  }
`;
