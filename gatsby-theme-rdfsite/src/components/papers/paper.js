import React from 'react';
import ExternalLink from '../externalLink';

const Paper = ({
  data: {
    source,
    title,
    year,
    publicationType,
    authorName,
    pdfUrl,
    bibsonomyId,
  },
}) => (
  <div className="paper">
    <p className="text">{source}</p>
    <h3 className="name is-size-4">
      {pdfUrl ? <ExternalLink to={pdfUrl}>{title}</ExternalLink> : title}
    </h3>
    <p className="meta">By {(authorName || []).join(', ')}</p>
    <p className="meta">
      {year}, #{publicationType}{' '}
      <a className="bib-link" href={bibsonomyId}>
        Get BibTex
      </a>
    </p>
  </div>
);

export default Paper;
