import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import sanitizeHtml from 'sanitize-html';

export default function Editor({ description, setDescription }) {
  const handleEditorChange = (content) => {
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['u', 'img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt']
      }
    }); // Sanitize the HTML content
    setDescription(sanitizedContent);
  };

  return (
    <ReactQuill
      value={description}
      onChange={handleEditorChange}
      modules={{
        toolbar: [
          [{ header: '1' }, { header: '2' }, { font: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['bold', 'italic', 'underline'],
          ['link'],
          [{ align: [] }],
          ['image'],
          ['clean'],
        ],
      }}
    />
  );
}