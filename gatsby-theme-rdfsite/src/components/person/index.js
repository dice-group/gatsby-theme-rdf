import { Link, navigate } from 'gatsby';
import React from 'react';
import Image from '../image';

export const Person = ({ person }) => (
  <div
    className="person"
    onClick={() => {
      if (person.link) {
        window.location.href = person.link;
        return;
      }
      navigate(person.path);
    }}
  >
    <div className="person-image">
      <Image
        filename={person.photo}
        alt={`${person.name} photo`}
        style={{ width: 160 }}
      />
    </div>
    {person.link ? (
      <a href={person.link}>
        {person.namePrefix} {person.name}
      </a>
    ) : (
      <Link to={person.path}>
        {person.namePrefix} {person.name}
      </Link>
    )}
  </div>
);

export const rdfToPerson = ({ data, path }) => ({
  ...data,
  path: path,
  projects: data.projects
    ? data.project.map(p => ({
        name: p.data.name,
        path: p.path,
      }))
    : [],
  role: data.role ? data.role.data : {},
});

export const rdfToPeopleArray = edges =>
  edges.map(n => n.node).map(rdfToPerson);
