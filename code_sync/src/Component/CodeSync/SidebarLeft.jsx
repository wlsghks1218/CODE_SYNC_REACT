import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ContextMenu from './ContextMenu';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const SidebarContainer = styled.div`
  width: ${(props) => props.width}px;
  background-color: #f4f4f4;
  padding: 10px;
  position: relative;
  transition: width 0.2s ease;
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

const Text = styled.div`
  font-size: 16px;
  color: #777;
  text-align: center;
  margin-top: 50px;
`;

const Resizer = styled.div`
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
`;

const SidebarLeft = ({ onFileContentChange , data }) => {
  const { codeSyncNo } = useParams();
  const [folderTree, setFolderTree] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [noDataFound, setNoDataFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuItems, setContextMenuItems] = useState([]);
  const [socket, setSocket] = useState(null);  // 웹소켓 연결 객체
  const [lockStatusMap, setLockStatusMap] = useState(new Map());  // 파일 잠금 상태 관리
  const userNo = data.user.userNo;

  // WebSocket 연결을 설정하는 함수
  // WebSocket 연결 설정
  const connectWebSocket = () => {
    if (socket) {
      socket.close(); // 기존 연결이 있다면 닫기
    }

    const ws = new WebSocket(`ws://localhost:9090/codeSync.do?codeSyncNo=${codeSyncNo}`);
    
    ws.onopen = () => {
      console.log("WebSocket Connected");
      setSocket(ws);
    };

    ws.onmessage = async (event) => {
      console.log("Received message:", event.data);
      const message = JSON.parse(event.data);
    
      // 'status'가 'update'인 경우만 처리
      if (message.status === "update") {
        const filePath = message.file.filePath;
        const locked = message.file.lockedBy !== 0;
    
        console.log(`Lock status update for ${filePath}: ${locked ? 'Locked' : 'Unlocked'}`);
    
        // 상태 업데이트
        setLockStatusMap(prevState => {
          const newMap = new Map(prevState);
          newMap.set(filePath, locked);
          return newMap;
        });
    
        // 잠금 상태가 변경된 후 폴더 구조를 다시 가져옵니다.
        fetchFolderStructureFromDB(codeSyncNo);  // 폴더 구조를 새로 불러오기
      }
    };
    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setTimeout(connectWebSocket, 3000);  // 재연결 시도
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      ws.close();
    };
  };

  useEffect(() => {
    if (codeSyncNo) {
      connectWebSocket();  // WebSocket 연결 시도
    }
    
    return () => {
      if (socket) {
        socket.close();  // 컴포넌트 언마운트 시 WebSocket 연결 종료
      }
    };
  }, [codeSyncNo]);

  useEffect(() => {
    if (codeSyncNo) {
      fetchFolderStructureFromDB(codeSyncNo);
    }
  }, [codeSyncNo]);


  const fetchFolderStructureFromDB = async (codeSyncNo) => {
    setIsLoading(true);
    try {
      console.log(codeSyncNo);
  
      const response = await axios.get(`http://116.121.53.142:9100/api/codeSync/folderStructure?codeSyncNo=${codeSyncNo}`);
      if (response.status === 200) {
        const data = response.data;
        if (data.folders.length === 0 && data.files.length === 0) {
          setNoDataFound(true);
          setFolderTree(null);
        } else {
          const rootFolder = buildFolderStructureFromResponse(data);
          setFolderTree(rootFolder);
          setNoDataFound(false);
        }
      } else {
        alert('Failed to fetch folder structure from database');
      }
    } catch (error) {
      setNoDataFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFolderStructureFromResponse = (data) => {
    const folderMap = new Map();
    const fileMap = new Map();
  
    data.folders.forEach((folder) => {
      const folderNode = {
        type: 'folder',
        name: folder.folderName,
        path: folder.folderPath,
        key: folder.folderPath,
        children: [],
        folderNo: folder.folderNo,
        lockedBy: folder.lockedBy,  // 잠금 상태 정보 추가
      };
      folderMap.set(folder.folderNo, folderNode);
    });
    
    data.files.forEach((file) => {
      const fileNode = {
        type: 'file',
        name: file.fileName,
        path: file.filePath,
        folderNo: file.folderNo,
        content: file.content,
        lockedBy: file.lockedBy,  // 잠금 상태 정보 추가
      };
      if (!fileMap.has(file.folderNo)) {
        fileMap.set(file.folderNo, []);
      }
      fileMap.get(file.folderNo).push(fileNode);
    });
  
    data.folders.forEach((folder) => {
      const folderNode = folderMap.get(folder.folderNo);
      const relatedFiles = fileMap.get(folder.folderNo);
      if (relatedFiles) {
        folderNode.children.push(...relatedFiles);
      }
  
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
  
    const rootFolder = data.folders.find((folder) => folder.folderName === 'Root');
    return folderMap.get(rootFolder.folderNo);
  };
  
  // 파일 선택 input ref 추가
  const fileInputRef = React.useRef();

  const handleFolderSelect = (e) => {
    const files = fileInputRef.current.files ? Array.from(fileInputRef.current.files) : [];
    if (files.length === 0) {
      alert("No files selected or browser does not support folder upload.");
      return;
    }
  
    const filteredFiles = files.filter(
      (file) =>
        !file.name.endsWith('.class') &&
        !file.webkitRelativePath.includes('target') &&
        !file.webkitRelativePath.includes('.settings')
    );
  
    if (filteredFiles.length > 0) {
      const folderStructure = buildFolderStructure(filteredFiles);
      setFolderTree(folderStructure);
  
      // 파일을 서버에 전송하고, 로딩 시작
      setIsLoading(true);  // 로딩 시작
  
      sendFolderStructureToServer(folderStructure).then(() => {
        setIsLoading(false);  // 로딩 완료
        fetchFolderStructureFromDB(codeSyncNo);  // 업로드 후 폴더 구조 다시 가져오기
      });
    } else {
      alert("No valid files selected (excluding .class, target, .settings files)");
    }
  };

  const handleFileInputClick = () => {
    // 파일 입력 요소 클릭
    fileInputRef.current.click();
  };

  const sendFolderStructureToServer = async (folderStructure) => {
    const folders = [];
    const files = [];
    console.log("폴더구성용 코드싱크넘버 : " + codeSyncNo);


    let currentId = 1;

    const traverseFolderStructure = (node, parentFolderId = null) => {
      if (node.type === 'folder') {
        const folderId = currentId++;
        folders.push({
          folderName: node.name,
          folderPath: node.path,
          parentFolderId: parentFolderId,
          codeSyncNo,
          folderId,
        });

        node.children.forEach((child) => traverseFolderStructure(child, folderId));
      } else if (node.type === 'file') {
        files.push({
          fileName: node.name,
          filePath: node.path,
          extension: node.name.split('.').pop(),
          content: null,
          file: node.file,
          codeSyncNo,
        });
      }
    };

    traverseFolderStructure(folderStructure);

    const readFileContents = (fileEntry) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          fileEntry.content = reader.result;
          resolve();
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', fileEntry.fileName, error);
          reject(error);
        };
        reader.readAsText(fileEntry.file);
      });
    };

    try {
      await Promise.all(files.map(readFileContents));

      files.forEach((file) => delete file.file);

      const folderStructure = { folders, files };

      const response = await axios.post('http://116.121.53.142:9100/api/codeSync/uploadFolder', folderStructure, {
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
    const root = { type: 'folder', name: 'Root', path: 'Root', children: [] };
    const folderMap = new Map();
    folderMap.set('Root', root);

    files.forEach((file) => {
      const parts = file.webkitRelativePath.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;

        if (isFile) {
          const fileEntry = {
            type: 'file',
            name: part,
            path: file.webkitRelativePath,
            file,
            content: null,
          };

          const reader = new FileReader();
          reader.onload = () => {
            fileEntry.content = reader.result;
          };
          reader.readAsText(file);

          current.children.push(fileEntry);
        } else {
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

    console.log("Generated Folder Structure from Uploaded Files:", JSON.stringify(root, null, 2));
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

    const handleFileClick = async (file) => {
    const { path } = file;
    
    try {
      const response = await axios.post('http://116.121.53.142:9100/api/codeSync/getFileNo', {
        folderNo: file.folderNo,
        fileName: file.name,
      });
  
      const fileNo = response.data;
      if (fileNo) {
        console.log('Retrieved fileNo:', fileNo);
        const lockedBy = userNo;

        

        if (socket && socket.readyState === WebSocket.OPEN) {
          const message = {
            code: "3",  // 잠금 요청을 위한 코드
            codeSyncNo,
            fileNo,
            lockedBy,
            filePath: file.path,  // 파일 경로 추가
          };
          socket.send(JSON.stringify(message));  // 잠금 요청 전송
        } else {
          console.warn("WebSocket is not open. Unable to send lock request.");
        }

        onFileContentChange({
          content: file.content,
          fileNo: fileNo,
        });
      } else {
        alert('해당 파일 번호를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 정보를 가져오는 중 오류 발생:', error);
      alert('파일 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    
    const menuItems = item.type === 'folder' ? ['Open Folder', 'Delete Folder'] : ['Open File', 'Delete File'];

    const menuWidth = 150;
    const menuHeight = 25 * menuItems.length;

    let adjustedX = e.clientX;
    let adjustedY = e.clientY;

    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    if (adjustedX + menuWidth > maxWidth) {
      adjustedX = maxWidth - menuWidth;
    }

    if (adjustedX < 0) {
      adjustedX = 0;
    }

    if (adjustedY - menuHeight < 0) {
      adjustedY = 0;
    } else {
      adjustedY -= menuHeight;
    }

    setContextMenu({ x: adjustedX, y: adjustedY });
    setContextMenuItems(menuItems);
  };

  const handleContextMenuItemClick = (item) => {
    console.log(`Clicked on ${item}`);
    setContextMenu(null);
  };

  const renderFolder = (node, parentPath = "") => {
    if (!node) return null;
  
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
    
    // 'lockedBy' 값이 null이 아니면 잠금 상태로 표시
    const isLocked = node.lockedBy !== 0; // lockedBy 값이 0이 아니면 잠금 상태
  
    return (
      <div
        style={{ marginLeft: node.type === "folder" ? "10px" : "20px" }}
        key={currentPath}
        onContextMenu={(e) => handleContextMenu(e, node)}
      >
        {node.type === "folder" ? (
          <div
            style={{ fontWeight: "bold", margin: "2px 0", cursor: "pointer" }}
            onClick={() => toggleFolder(currentPath)}
          >
            <span>{isExpanded ? "-" : "+"}</span> {node.name}
            {/* 폴더에는 자물쇠 아이콘을 표시하지 않음 */}
          </div>
        ) : (
          node.name !== '.classpath' && (
            <div
              style={{ margin: "2px 0", cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => handleFileClick(node)}
            >
              📄 {node.name}
              {isLocked && <span style={{ marginLeft: "5px", color: "red", fontSize: "16px" }}>🔒</span>}  {/* 파일에만 자물쇠 표시 */}
            </div>
          )
        )}
        {isExpanded &&
          node.children &&
          [...node.children].reverse().map((child) => renderFolder(child, currentPath))}
      </div>
    );
  };
  
  
  
  const handleResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (e) => {
      const newWidth = Math.max(startWidth + e.clientX - startX, 200);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <SidebarContainer width={sidebarWidth}>
      {folderTree === null && (
        <Button onClick={handleFileInputClick}>Upload Folder</Button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        onChange={handleFolderSelect}
        multiple
      />

      <FileTreeContainer>
        {isLoading ? (
          <LoadingSpinner />  // 로딩 중이면 스피너를 표시
        ) : noDataFound ? (
          <Text>select and upload folder</Text>
        ) : (
          renderFolder(folderTree)
        )}
      </FileTreeContainer>
      <Resizer onMouseDown={handleResizeStart} />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onItemClick={handleContextMenuItemClick}
        />
      )}
    </SidebarContainer>
  );
};

export default SidebarLeft;
