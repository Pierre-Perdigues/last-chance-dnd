import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

function TreeNode({ node, addFolder, addFile, renameNode, deleteNode, moveNode, openFile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const [, drag] = useDrag(() => ({
    type: 'node',
    item: { id: node.id },
  }));

  const [, drop] = useDrop({
    accept: 'node',
    drop: (item) => moveNode(item.id, node.id),
  });

  const handleRename = () => {
    renameNode(node.id, newName);
    setIsEditing(false);
  };

  return (
    <div ref={node.type === 'folder' ? drop : null} style={{ paddingLeft: 20 }}>
      <div ref={drag} style={{ display: 'flex', alignItems: 'center' }}>
        <span onClick={() => setIsOpen(!isOpen)}>
          {node.type === 'folder' ? (isOpen ? '📂' : '📁') : '📄'}{' '}
        </span>
        {isEditing ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
            }}
          />
        ) : (
          <span onClick={() => node.type === 'file' && openFile(node.id)}>{node.name}</span>
        )}
        <button onClick={() => setIsEditing(true)}>✏️</button>
        <button onClick={() => deleteNode(node.id)}>🗑️</button>
        {node.type === 'folder' && (
          <>
            <button onClick={() => addFolder(node.id)}>➕ Folder</button>
            <button onClick={() => addFile(node.id)}>➕ File</button>
          </>
        )}
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              addFolder={addFolder}
              addFile={addFile}
              renameNode={renameNode}
              deleteNode={deleteNode}
              moveNode={moveNode}
              openFile={openFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
