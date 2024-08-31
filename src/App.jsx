import React, { useState, useEffect } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import TreeNode from './Component/treenode/TreeNode';
import MarkdownEditor from './Component/markdowneditor/MarkdownEditor';

function App() {
  const [fileTree, setFileTree] = useState(() => {
    // Chargement initial depuis localStorage
    const savedTree = localStorage.getItem('fileTree');
    return savedTree ? JSON.parse(savedTree) : [];
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Sauvegarder l'arborescence dans localStorage à chaque modification
  useEffect(() => {
    if (fileTree.length > 0) {
      localStorage.setItem('fileTree', JSON.stringify(fileTree));
    }
  }, [fileTree]);

  const addFolder = (parentId) => {
    const newFolder = {
      id: Date.now().toString(),
      type: 'folder',
      name: 'New Folder',
      children: []
    };

    const updatedTree = addNodeToParent(fileTree, parentId, newFolder);
    setFileTree(updatedTree);
  };

  const addFile = (parentId) => {
    const newFile = {
      id: Date.now().toString(),
      type: 'file',
      name: 'New File.md',
      content: ''
    };
    const updatedTree = addNodeToParent(fileTree, parentId, newFile);
    setFileTree(updatedTree);
  };

  const addNodeToParent = (tree, parentId, newNode) => {
    if (parentId === 'root') {
      return [...tree, newNode];
    }

    return tree.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      } else if (node.children) {
        return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const renameNode = (nodeId, newName) => {
    const updatedTree = fileTree.map(node => updateNodeName(node, nodeId, newName));
    setFileTree(updatedTree);
  };

  const updateNodeName = (node, nodeId, newName) => {
    if (node.id === nodeId) {
      return { ...node, name: newName };
    } else if (node.children) {
      return { ...node, children: node.children.map(child => updateNodeName(child, nodeId, newName)) };
    }
    return node;
  };

  const deleteNode = (nodeId) => {
    const updatedTree = removeNodeById(fileTree, nodeId);
    setFileTree(updatedTree);
    if (selectedFile && selectedFile.id === nodeId) {
      setSelectedFile(null);
    }
  };

  const removeNodeById = (tree, nodeId) => {
    return tree.filter(node => {
      if (node.id === nodeId) return false;
      if (node.children) {
        node.children = removeNodeById(node.children, nodeId);
      }
      return true;
    });
  };

  const moveNode = (draggedNodeId, targetNodeId) => {
    const draggedNode = findNodeById(fileTree, draggedNodeId);
    const updatedTree = removeNodeById(fileTree, draggedNodeId);
    const newTree = addNodeToParent(updatedTree, targetNodeId, draggedNode);
    setFileTree(newTree);
  };

  const findNodeById = (tree, nodeId) => {
    for (let node of tree) {
      if (node.id === nodeId) return node;
      if (node.children) {
        const found = findNodeById(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  const openFile = (nodeId) => {
    const file = findNodeById(fileTree, nodeId);
    if (file) {
      setSelectedFile(file);
    }
  };

  const updateFileContent = (nodeId, content) => {
    const updatedTree = fileTree.map(node => updateNodeContent(node, nodeId, content));
    setFileTree(updatedTree);

    // Mettre à jour également le fichier sélectionné
    if (selectedFile && selectedFile.id === nodeId) {
      setSelectedFile({ ...selectedFile, content });
    }
  };

  const updateNodeContent = (node, nodeId, content) => {
    if (node.id === nodeId && node.type === 'file') {
      return { ...node, content };
    } else if (node.children) {
      return { ...node, children: node.children.map(child => updateNodeContent(child, nodeId, content)) };
    }
    return node;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%', borderRight: '1px solid #ccc', padding: '10px' }}>
          <button onClick={() => addFolder('root')}>Add Folder to Root</button>
          <button onClick={() => addFile('root')}>Add File to Root</button>
          <div>
            {fileTree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                addFolder={addFolder}
                addFile={addFile}
                renameNode={renameNode}
                deleteNode={deleteNode}
                moveNode={moveNode}
                openFile={openFile}
              />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, paddingLeft: '10%' }}>
        {selectedFile ? (
            <MarkdownEditor
              file={selectedFile}
              updateFileContent={(content) => updateFileContent(selectedFile.id, content)}
            />
          ) : (
            <div>Select a file to edit</div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
