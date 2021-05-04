const { Parser, Writer } = require('n3');
const jsonld = require('jsonld');

const basePath = 'https://dice-research.org/';

const arrayPredicates = [
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  'https://schema.dice-research.org/content',
  'https://schema.dice-research.org/partner',
  'https://schema.dice-research.org/author',
  'https://schema.dice-research.org/authorName',
  'https://schema.dice-research.org/tag',
];

const relationPredicates = [
  'rdf:type',
  'schema:partner',
  'schema:role',
  'schema:author',
  'schema:contact',
];

const defaultPrefixes = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
};

const processResult = ({ result, resultSubject, prefixes: filePrefixes, jsonldData }) => {
  const prefixes = { ...defaultPrefixes, ...filePrefixes };
  const urls = Object.keys(prefixes).map(p => ({
    url: prefixes[p],
    prefix: p,
  }));

  // map prefix URLs to short names
  const data = Object.keys(result)
    .map(predicate => {
      const matchingPrefix = urls.find(({ url }) => predicate.includes(url));
      if (matchingPrefix) {
        const fixedPrefix = predicate.replace(
          matchingPrefix.url,
          `${matchingPrefix.prefix}:`
        );
        return { [fixedPrefix]: result[predicate] };
      }

      return { predicate: result[predicate] };
    })
    .reduce((acc, val) => ({ ...acc, ...val }), {});

  // remove rdf:type link to schema:BaseClass. this is required to convert RDF to GraphQL
  // if we'd leave schema:BaseClass in - gatsby would try to resolve it and fail
  // which in turn would lead to build errors
  if (data['rdf:type'][0] === 'schema:BaseClass') {
    delete data['rdf:type'];
  }

  // link to other resources
  Object.keys(data).forEach(key => {
    if (relationPredicates.includes(key)) {
      // get value
      const val = data[key];
      // remove basic value key
      delete data[key];
      // add link to other node
      data[`${key}___NODE`] = val;
    }
  });

  // replace schema: prefix with empty string for nicer queries
  Object.keys(data).forEach(key => {
    if (key.startsWith('schema:')) {
      // get value
      const val = data[key];
      const newKey = key.replace('schema:', '');
      // remove basic value key
      delete data[key];
      // add link to other node
      data[newKey] = val;
    }
  });

  // append JSON-LD as string
  data.jsonld = JSON.stringify(jsonldData);

  const resultObject = {
    data,
    prefixes,
    subject: resultSubject,
    path: `/${resultSubject.replace(basePath, '')}`,
  };

  return resultObject;
};

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  // only log for nodes of mediaType `text/turtle`
  if (node.internal.mediaType !== `text/turtle`) {
    return;
  }

  const transformObject = (obj, id, type) => {
    const rdfNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type,
      },
    };
    actions.createNode(rdfNode);
    actions.createParentChildLink({ parent: node, child: rdfNode });
  };

  const content = await loadNodeContent(node);

  const result = {};
  let resultSubject;

  const parser = new Parser();
  // create writer to convert content to JSON-LD
  const writer = new Writer({ format: 'application/n-quads' });
  const getWriterContent = () =>
    new Promise((resolve, reject) => {
      writer.end((err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  // parse content loaded from file
  parser.parse(content, async (error, quad, prefixes) => {
    // if we errored out show message in console
    // and re-throw error to interrupt build
    if (error) {
      console.error(`Error parsing ${node.relativePath}!`, error);
      throw error;
    }
    if (!quad && prefixes) {
      const nquads = await getWriterContent();
      const jld = await jsonld.fromRDF(nquads, {
        format: 'application/n-quads',
      });

      // process the results
      const resultObject = processResult({
        result,
        resultSubject,
        prefixes,
        jsonldData: jld,
      });
      // write to gatsby
      transformObject(resultObject, resultSubject, 'RDF');
      return;
    }

    // write quad to writer
    writer.addQuad(quad);

    // split quad into subject, predicate, object
    const {
      subject: { id: subject },
      predicate: { id: predicate },
      object,
    } = quad;

    if (!resultSubject) {
      resultSubject = subject;
    }

    let value;
    try {
      value = String(JSON.parse(object.value));
    } catch {
      value = object.value;
    }

    const hasArrayOfValues = arrayPredicates.includes(predicate);
    if (!hasArrayOfValues) {
      result[predicate] = value;
    } else {
      const old = result[predicate];
      result[predicate] = [].concat(old, value).filter(Boolean);
    }
  });
}

exports.onCreateNode = onCreateNode;
