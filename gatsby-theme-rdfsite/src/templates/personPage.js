import { graphql, Link } from 'gatsby';
import React from 'react';
import BackButton from '../components/backButton';
import Image from '../components/image';
import Layout from '../components/layout';
import PapersFilter from '../components/papers/filter';
import Paper from '../components/papers/paper';
import SEO from '../components/seo';

export default function PersonTemplate({ data: { rdf, allRdf } }) {
  const {
    data: { name, namePrefix, role, project, phone, email, photo },
  } = rdf;
  const { edges } = allRdf;
  return (
    <Layout>
      <SEO title={`${namePrefix} ${name}`} />
      <div className="content person-page">
        <BackButton />

        <h1 className="title">Profile page</h1>

        <div className="is-flex person-info">
          <div className="person-image">
            <Image
              filename={photo}
              alt={`${namePrefix} ${name} photo`}
              style={{ width: 300 }}
            />
          </div>

          <div className="is-flex is-flex-vertical">
            <h2>
              {namePrefix} {name}
            </h2>
            <p className="role">{role.data.name}</p>
            {email && (
              <div className="is-flex meta">
                <div className="meta-label">Email</div>
                <div className="meta-value">
                  <a href={email}>{email.replace('mailto:', '')}</a>
                </div>
              </div>
            )}
            {phone && (
              <div className="is-flex meta">
                <div className="meta-label">Phone</div>
                <div className="meta-value">{phone.replace('tel:', '')}</div>
              </div>
            )}
          </div>
        </div>

        {project && (
          <>
            <h1>Projects</h1>
            <div className="projects">
              {project
                .sort((a, b) => a.data.name.localeCompare(b.data.name))
                .map(p => (
                  <Link key={p.path} to={p.path}>
                    {p.data.name} – {p.data.tagline}
                  </Link>
                ))}
            </div>
          </>
        )}
        {edges && edges.length > 0 && (
          <>
            <h1>Publications</h1>
            <PapersFilter limit={5} edges={edges}>
              {papers =>
                papers.map(({ node }) => (
                  <Paper key={node.id} data={node.data} />
                ))
              }
            </PapersFilter>
          </>
        )}
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    rdf(path: { eq: $path }) {
      data {
        name
        namePrefix
        phone
        email
        photo
        role {
          data {
            name
          }
        }
      }
    }
    allRdf(
      filter: {
        data: {
          rdf_type: {
            elemMatch: {
              id: { eq: "https://schema.dice-research.org/Publication" }
            }
          }
          author: { elemMatch: { path: { eq: $path } } }
        }
      }
    ) {
      edges {
        node {
          data {
            type
            title
            publicationType
            year
            source
            url
            tag
            bibsonomyId
            author {
              id
              path
              data {
                name
              }
            }
            authorName
          }
          id
        }
      }
    }
  }
`;
