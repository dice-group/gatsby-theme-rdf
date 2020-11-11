import HtmlToReact from 'html-to-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import htmlParser from 'react-markdown/plugins/html-parser';
import Image from '../image';

// create default HTML processing function
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);

// See https://github.com/aknuds1/html-to-react#with-custom-processing-instructions
// for more info on the processing instructions
const parseHtml = htmlParser({
  // isValidNode: node => node.type !== 'script',
  processingInstructions: [
    {
      // Custom <img> processing
      shouldProcessNode: function(node) {
        return node && node.name && node.name === 'img';
      },
      processNode: function(node, children) {
        return (
          <Image
            filename={node.attribs.src}
            alt={node.attribs.alt}
            className={node.attribs.class}
          />
        );
      },
    },
    {
      // Anything else
      shouldProcessNode: function(node) {
        return true;
      },
      processNode: processNodeDefinitions.processDefaultNode,
    },
  ],
});

export default function Markdown({ source }) {
  return (
    <ReactMarkdown
      source={`<div>${source}</div>`}
      escapeHtml={false}
      astPlugins={[parseHtml]}
    />
  );
}
