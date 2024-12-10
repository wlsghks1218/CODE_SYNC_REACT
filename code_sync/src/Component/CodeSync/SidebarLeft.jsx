import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #f4f4f4;
  padding: 10px;
  overflow-y: auto;
`;

const FileTreeContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px dashed #ccc;
  height: 800px;
  overflow-y: auto;
`;

const Button = styled.button`
  margin-bottom: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const SidebarLeft = ({ onFileContentChange }) => {
  const [folderTree, setFolderTree] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    // 컴포넌트 로딩 시 DB에서 폴더 트리 구조 불러오기
    fetchFolderStructureFromDB();
  }, []);

  // DB에서 폴더 트리 구조 불러오기
  const fetchFolderStructureFromDB = async () => {
    try {
      const codeSyncNo = 1; // 하드코딩된 codeSyncNo 값
      const response = await axios.get(`http://localhost:9090/api/codeSync/folderStructure?codeSyncNo=${codeSyncNo}`);
      if (response.status === 200) {
        const data = response.data; // 서버로부터 받은 데이터
        console.log(data);
  
        // 폴더 및 파일 데이터 변환
        const rootFolder = buildFolderStructureFromResponse(data);
  
        // 변환된 폴더 구조를 state에 설정
        setFolderTree(rootFolder);
      } else {
        alert('Failed to fetch folder structure from database');
      }
    } catch (error) {
      console.error('Error fetching folder structure from DB:', error);
    }
  };

  const buildFolderStructureFromResponse = (data) => {
    const folderMap = new Map();
    const fileMap = new Map();
  
    // DB에서 받아온 폴더 데이터 처리
    data.folders.forEach((folder) => {
      const folderNode = {
        type: 'folder',
        name: folder.folderName,
        path: folder.folderPath,
        key: folder.folderPath,
        children: [],
        folderNo: folder.folderNo, // folderNo 추가
      };
      folderMap.set(folder.folderNo, folderNode); // 폴더를 folderNo를 기준으로 저장
    });
  
    // DB에서 받아온 파일 데이터 처리
    data.files.forEach((file) => {
      const fileNode = {
        type: 'file',
        name: file.fileName,
        path: file.filePath,
        folderNo: file.folderNo, // file과 연결할 folderNo
      };
      // 파일은 여러 개 있을 수 있기 때문에 바로 연결하지 않고
      // 나중에 폴더별로 파일을 넣을 때 묶어서 처리하도록 함
      if (!fileMap.has(file.folderNo)) {
        fileMap.set(file.folderNo, []); // 처음 보았으면 배열로 초기화
      }
      fileMap.get(file.folderNo).push(fileNode); // 해당 폴더에 파일 추가
    });
  
    // 폴더와 파일을 folderNo를 기준으로 연결
    data.folders.forEach((folder) => {
      const folderNode = folderMap.get(folder.folderNo);
  
      // 해당 폴더에 관련된 파일들 추가
      const relatedFiles = fileMap.get(folder.folderNo);
      if (relatedFiles) {
        folderNode.children.push(...relatedFiles); // 파일을 해당 폴더에 추가
      }
  
      // 부모 폴더와 연결
      if (folder.parentFolderId !== null) {
        const parentFolder = data.folders.find(f => f.folderNo === folder.parentFolderId);
        if (parentFolder) {
          const parentFolderNode = folderMap.get(parentFolder.folderNo);
          if (parentFolderNode) {
            parentFolderNode.children.push(folderNode);
          }
        }
      }
    });
  
    // 최상위 폴더 (Root)를 찾아 반환
    const rootFolder = data.folders.find((folder) => folder.folderName === 'Root');
    return folderMap.get(rootFolder.folderNo);
  };
  
  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const filteredFiles = files.filter(
        (file) => !file.name.endsWith('.class') && !file.webkitRelativePath.includes('target') && !file.webkitRelativePath.includes('.settings')
      );
      if (filteredFiles.length > 0) {
        const folderStructure = buildFolderStructure(filteredFiles);
        setFolderTree(folderStructure);

        console.log(folderStructure);

        // 폴더 구조를 서버로 전송
        await sendFolderStructureToServer(folderStructure);
      } else {
        alert("No valid files selected (excluding .class, target, .settings files)");
      }
    }
  };

  const sendFolderStructureToServer = async (folderStructure) => {
    const folders = [];
    const files = [];
    const codeSyncNo = 2; // 하드코딩된 CodeSyncNo 값
    
    let currentId = 1; // 폴더에 ID를 할당하기 위한 카운터
    
    const traverseFolderStructure = (node, parentFolderId = null) => {
      if (node.type === 'folder') {
        const folderId = currentId++; // 각 폴더에 고유 ID 부여
        folders.push({
          folderName: node.name,
          folderPath: node.path,
          parentFolderId: parentFolderId,
          codeSyncNo, // 하드코딩된 CodeSyncNo
          folderId, // 폴더 ID를 포함시킴
        });

        node.children.forEach((child) => traverseFolderStructure(child, folderId)); // 자식 폴더에 해당 ID를 전달
      } else if (node.type === 'file') {
        files.push({
          fileName: node.name,
          filePath: node.path,
          extension: node.name.split('.').pop(),
          content: null, // 일단 null로 설정, 이후 FileReader로 읽어서 채움
          file: node.file, // File 객체를 추가로 저장
          codeSyncNo,
        });
      }
    };

    traverseFolderStructure(folderStructure);

    // FileReader를 사용해 파일 내용 읽기
    const readFileContents = (fileEntry) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          fileEntry.content = reader.result; // 파일 내용을 저장
          resolve();
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', fileEntry.fileName, error);
          reject(error);
        };
        reader.readAsText(fileEntry.file); // 파일을 텍스트로 읽기
      });
    };

    try {
      // 모든 파일의 내용을 비동기로 읽음
      await Promise.all(files.map(readFileContents));

      // 파일 객체에서 file 속성 제거 (직렬화 오류 방지)
      files.forEach((file) => delete file.file);

      const folderStructure = { folders, files };

      // 서버로 전송 (axios 사용)
      const response = await axios.post('http://localhost:9090/api/codeSync/uploadFolder', folderStructure, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert('Folder structure uploaded successfully!');
      } else {
        alert('Failed to upload folder structure');
      }
    } catch (error) {
      console.error('Error uploading folder structure:', error);
    }
  };

  const buildFolderStructure = (files) => {
    const root = { type: 'folder', name: 'Root', path: 'Root', children: [] }; // 최상위 폴더
    const folderMap = new Map();
    folderMap.set('Root', root);
  
    files.forEach((file) => {
      const parts = file.webkitRelativePath.split('/');
      let current = root;
  
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1; // 마지막 파트가 파일인지 확인
  
        if (isFile) {
          // 파일 처리
          const fileEntry = {
            type: 'file',
            name: part,
            path: file.webkitRelativePath,
            file, // 원본 File 객체 저장
          };
          current.children.push(fileEntry);
        } else {
          // 폴더 처리
          let folder = current.children.find(
            (child) => child.type === 'folder' && child.name === part
          );
          if (!folder) {
            folder = {
              type: 'folder',
              name: part,
              path: `${current.path}/${part}`,
              children: [],
            };
            current.children.push(folder);
            folderMap.set(folder.path, folder);
          }
          current = folder;
        }
      });
    });
  
    console.log("Generated Folder Structure from Uploaded Files:", JSON.stringify(root, null, 2)); // 디버깅용
    return root;
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderPath)) {
        newExpanded.delete(folderPath);
      } else {
        newExpanded.add(folderPath);
      }
      return newExpanded;
    });
  };

  const handleFileClick = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      onFileContentChange(reader.result); // 파일 내용 전달
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsText(file); // 파일을 텍스트로 읽음
  };

  const renderFolder = (node, parentPath = "") => {
    if (!node) return null;
  
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name; // 고유 경로 생성
    const isExpanded = expandedFolders.has(currentPath);
  
    return (
      <div style={{ marginLeft: node.type === "folder" ? "10px" : "20px" }} key={currentPath}>
        {node.type === "folder" ? (
          <div
            style={{ fontWeight: "bold", margin: "2px 0", cursor: "pointer" }}
            onClick={() => toggleFolder(currentPath)}
          >
            <span>{isExpanded ? "-" : "+"}</span> {node.name}
          </div>
        ) : (
          // 파일 노드 렌더링
          <div
            style={{ margin: "2px 0", cursor: "pointer" }}
            onClick={() => handleFileClick(node.file)}
          >
            📄 {node.name}
          </div>
        )}
        {/* 폴더 확장 시 자식 요소 렌더링, 자식 순서 뒤집기 */}
        {isExpanded &&
          node.children &&
          [...node.children].reverse().map((child) => renderFolder(child, currentPath))} {/* 배열 복사 후 reverse */}
      </div>
    );
  };
  return (
    <SidebarContainer>
      <Button onClick={() => document.getElementById('folderInput').click()}>Upload Files</Button>
      <input
        type="file"
        id="folderInput"
        multiple
        webkitdirectory="true"
        onChange={handleFolderSelect}
        style={{ display: "none" }}
      />
      <FileTreeContainer>
        {folderTree ? renderFolder(folderTree) : "Loading..."}
      </FileTreeContainer>
    </SidebarContainer>
  );
};

export default SidebarLeft;
