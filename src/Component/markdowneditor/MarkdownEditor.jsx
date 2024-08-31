import React from 'react';
import Showdown from 'showdown';

function MarkdownEditor({ file, updateFileContent }) {
  const converter = new Showdown.Converter();

  const handleContentChange = (e) => {
    updateFileContent(e.target.value);
  };

  const htmlContent = converter.makeHtml(file.content);

  return (
    <div>
      <textarea
        value={file.content}
        onChange={handleContentChange}
        style={{ width: '100%', height: '200px', marginBottom: '20px', fontSize: '16px', padding: '10px', boxSizing: 'border-box' }}
      />
      <h2>Preview:</h2>
      <div
        style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

export default MarkdownEditor;
