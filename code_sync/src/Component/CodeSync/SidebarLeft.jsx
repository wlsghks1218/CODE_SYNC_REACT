import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ContextMenu from './ContextMenu';
import { useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { toast } from "react-toastify";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  background-color: #4CAF50;
   margin-left: 10px;
  color: white;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  &:hover {
    background-color: #45a049;
  }
`;

const RedButton = styled.button`
  margin-bottom: 10px;
  padding: 5px 10px;
  margin-left: 10px;
   background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;


  &:hover {
    background-color: #d32f2f;
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

const SidebarLeft = ({ onFileContentChange, data, socket, isSaved,message}) => {
  const { codeSyncNo } = useParams();
  const [folderTree, setFolderTree] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [noDataFound, setNoDataFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [copyItem, setCopyItem] = useState(null);
  

  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuItems, setContextMenuItems] = useState([]);
  const [lockStatusMap, setLockStatusMap] = useState(new Map());
  const [selectedItem, setSelectedItem] = useState(null);  // 선택된 항목을 추적
  const [editingName, setEditingName] = useState(false);  // 이름 수정 모드
const [newName, setNewName] = useState("");  // 새 이름
const [nameEditPosition, setNameEditPosition] = useState({ x: 0, y: 0 });  // 입력창 위치
const [menuItem , setMenuItem] = useState("");
  
  const userNo = data.user.userNo;
  useEffect(() => {
    if (menuItem === "Create file" || menuItem === "Create folder") {
      setNewName(""); // Create 모드일 때 빈 문자열로 초기화
    }
  }, [menuItem]);

  useEffect(() => {
    if (isSaved) {  
      fetchFolderStructureFromDB(codeSyncNo);
    }
  }, [isSaved, codeSyncNo]);

  useEffect(() => {
    if (socket) {

        // message.status가 존재하는 모든 메시지 처리
        if (message) {
          const filePath = message.file?.filePath; // filePath가 없을 수 있으니 안전하게 접근
          const locked = message.status === "update" ? message.file?.lockedBy !== 0 : false; // 잠금 상태 확인
  
          console.log(`Lock status update for ${filePath}: ${locked ? 'Locked' : 'Unlocked'}`);
    
          // 상태 업데이트
          setLockStatusMap((prevState) => {
            const newMap = new Map(prevState);
            if (filePath) {
              newMap.set(filePath, locked);
            }
            return newMap;
          });
  
          fetchFolderStructureFromDB(codeSyncNo);
  
        
      };
  
     
    }
  
  }, [message, codeSyncNo]);
 
  useEffect(() => {
    // contextMenu가 열렸을 때만 이벤트 리스너 추가
    const handleClickOutside = (e) => {
      // 컨텍스트 메뉴 외부를 클릭했을 때
      if (contextMenu && !e.target.closest('.context-menu')) {
        setContextMenu(null);  // 메뉴 닫기
        setSelectedItem(null);  // 선택된 항목도 초기화
      }
    };
  
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
    }
  
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);
  

  
  useEffect(() => {
    if (codeSyncNo) {
      fetchFolderStructureFromDB(codeSyncNo);
    }
  }, [codeSyncNo]);

  const fetchFolderStructureFromDB = async (codeSyncNo) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:9090/api/codeSync/folderStructure?codeSyncNo=${codeSyncNo}`);
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
        toast.error('Failed to fetch folder structure from database');
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
      toast.error("No files selected or browser does not support folder upload.");
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
      toast.error("No valid files selected (excluding .class, target, .settings files)");
    }
  };

  const handleFileInputClick = () => {
    // 파일 입력 요소 클릭
    fileInputRef.current.click();
  };

  const sendFolderStructureToServer = async (folderStructure) => {
    const folders = [];
    const files = [];


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

      const response = await axios.post('http://localhost:9090/api/codeSync/uploadFolder', folderStructure, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success('Folder structure uploaded successfully!');
      } else {
        toast.error('Failed to upload folder structure');
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
  const handleFileDoubleClick = async (file) => {
    const { path } = file;

    try {
      // 1. 파일 번호를 가져오기 위해 서버에 요청
      const response = await axios.post('http://localhost:9090/api/codeSync/getFileNo', {
        folderNo: file.folderNo,
        fileName: file.name,
      });
  
      const fileNo = response.data;
      if (fileNo) {
      

        // 2. 파일 잠금 상태 확인을 위한 요청
        const lockResponse = await axios.post('http://localhost:9090/api/codeSync/checkFileLockStatus', {
          fileNo: fileNo,
          userNo: userNo
        });

        const isLockedByAnotherUser = lockResponse.data.isLockedByAnotherUser;
        
        if (isLockedByAnotherUser) {
          // 3. 파일이 다른 사용자가 잠근 상태일 경우, 잠금 요청을 하지 않고 알림
          toast.error('This file is already locked by another user.');
        } else {
          // 4. 파일 잠금 상태가 아니면 웹소켓을 통해 잠금 요청
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
        }
      } else {
        toast.error('해당 파일 번호를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 정보를 가져오는 중 오류 발생:', error);
      toast.error('파일 정보를 불러오는 데 실패했습니다.');
    }
  };


  const handleFileClick= async (file) => {
    const response = await axios.post('http://localhost:9090/api/codeSync/getFileNo', {
      folderNo: file.folderNo,
      fileName: file.name,
    });

    const fileNo = response.data;

    onFileContentChange({
      content: file.content,
      fileNo: fileNo,
    });
  }



  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedItem(item);  // 우클릭한 항목을 selectedItem에 설정
    
    const menuItems = item.type === 'folder' ? ['Delete Folder', 'Rename', 'Create file','Create folder', 'Copy', 'Paste'] : ['Delete File', 'Rename', 'Copy'];
    
    let adjustedX = e.clientX;
    let adjustedY = e.clientY;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    
    if (adjustedX + 150 > maxWidth) {
      adjustedX = maxWidth - 150;
    }
    if (adjustedX < 0) {
      adjustedX = 0;
    }
    if (adjustedY - 10 * menuItems.length < 0) {
      adjustedY = 0;
    } else {
      adjustedY -= 10 * menuItems.length;
    }
  
    setContextMenu({ x: adjustedX, y: adjustedY });
    setContextMenuItems(menuItems);
  
    // 이름 수정 모드 활성화 시 입력창 위치 설정
    setNameEditPosition({ x: adjustedX, y: adjustedY });
    setEditingName(false);  // 수정 모드 초기화
  };
  
  const handleContextMenuItemClick = (item) => {

    setMenuItem(item);
  
    switch (item) {
          case "Rename":
          if (!selectedItem) return;
          if (selectedItem.name === "Root"){
            toast.error("Root폴더는 변경이 불가합니다");
            return;
          }
          setNewName(selectedItem.name);  // 기존 이름을 입력창에 설정
          setEditingName(true);  // 이름 수정 상태로 변경
          break;

          case 'Delete Folder':
            if (selectedItem.name === "Root") {
                toast.error("Root 폴더는 삭제가 불가합니다");
                return;
            }
        
            const isConfirmed = window.confirm(`"${selectedItem.name}" 폴더를 삭제하시겠습니까?`);
            if (!isConfirmed) {
                toast.info("폴더 삭제가 취소되었습니다.");
                return;
            }
        
            const deleteMessage = {
                code: "8",
                codeSyncNo: codeSyncNo,
                folderNo: selectedItem.folderNo,
            };
        
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(deleteMessage));
                toast.success(`${selectedItem.name} 폴더가 삭제되었습니다.`);
            } else {
                toast.error("WebSocket is not connected.");
            }
        
            break;
        
          case 'Create file':
            setEditingName(true);  
            
            break;
            case 'Create folder':
              setEditingName(true);  
              
              break;

            case 'Copy':
            setCopyItem(selectedItem);
            
            break;
           
            case 'Paste':
              if (selectedItem.name === copyItem.name){
                toast.error("동일한 폴더에 붙여넣기를 할 수 없습니다");
                return;
              } 
            console.log(copyItem);

            if (copyItem.type === "folder") {
              const folderPath = selectedItem.path + "/" + copyItem.name;
       
        
              const pasteFolderMessage = {
                code: "11",  
                codeSyncNo : codeSyncNo,
                folderName: copyItem.name,
                folderNo : copyItem.folderNo,
                folderPath : folderPath, 
                createBy : userNo,
                newFolderNo : selectedItem.folderNo,
                type : copyItem.type,
                userNo : userNo,
              };
            
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(pasteFolderMessage));  
                toast.success(`붙여넣기가 완료되었습니다`);
              } else {
                toast.error("WebSocket is not connected.");
              }
        
            }else if(copyItem.type === "file"){
          
              const folderPath = selectedItem.path + "/" + copyItem.name;
                 const pasteFileMessage = {
              code: "11",  
              codeSyncNo : codeSyncNo,
              folderNo : copyItem.folderNo,
              fileName: copyItem.name,
              folderPath : folderPath, 
              newFolderNo : selectedItem.folderNo,
              userNo : userNo,
              type : copyItem.type,

            };
          
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(pasteFileMessage));  
              toast.success(`붙여넣기가 완료되었습니다`);
            } else {
              toast.error("WebSocket is not connected.");
            }
            } 

            setCopyItem(null);
            
            break;
            case 'Delete File':
              const deleteFileMessage = {
                code: "12",
                codeSyncNo: codeSyncNo,
                folderNo: selectedItem.folderNo,
                fileName : selectedItem.name,
            };
        
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(deleteFileMessage));
                toast.success(`${selectedItem.name} 파일이 삭제되었습니다.`);
            } else {
                toast.error("WebSocket is not connected.");
            }

              break;
           
      default:
        break;
    }
    setContextMenu(null);
  };
  const handleNameChange = () => {
    if (!newName.trim()) return;  
   
    if (selectedItem.type === "folder") {
      const renameMessage = {
        code: "7",  
        codeSyncNo : codeSyncNo,
        folderName: selectedItem.name,  
        newName: newName.trim(), 
      };
    
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(renameMessage));  
        toast.success(`Name changed from ${selectedItem.name} to ${newName}`);
      } else {
        toast.error("WebSocket is not connected.");
      }

    }else if(selectedItem.type === "file"){
      if (!isValidFileName(newName)) {
        toast.error("파일 형식에 맞게 작성해주십시오 (.txt .java .xml 등등)");
        return; // 입력창 유지
      }
         const renameMessage = {
      code: "7",  
      codeSyncNo : codeSyncNo,
      folderNo : selectedItem.folderNo,
      fileName: selectedItem.name,  
      newName: newName.trim(), 
    };
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(renameMessage));  
      toast.success(`Name changed from ${selectedItem.name} to ${newName}`);
    } else {
      toast.error("WebSocket is not connected.");
    }
    } 
    setEditingName(false);
  };

  const isValidFileName = (fileName) => {
    // 파일 이름 유효성 검사 (특수문자 제한 및 허용 확장자 확인)
    const invalidCharacters = /[\/\\:*?"<>|]/; // 허용되지 않는 특수문자
    const validExtensions = /\.(java|xml|properties|yml|yaml|html|jsp|css|js|md|txt|log)$/i; // 허용 확장자
  
    // 이름에 허용되지 않는 특수문자가 있거나 확장자가 유효하지 않은 경우 false 반환
    if (invalidCharacters.test(fileName)) {
      return false;
    }
    return validExtensions.test(fileName);
  };
  

  const handleCreateFile = () => {
    console.log("파일만들기");
    console.log("파일만들기용 이름", newName);
    console.log("파일만들기용 folderNo", selectedItem.folderNo);
  
    // 확장자 추출
    const extension = newName.includes(".") ? newName.split(".").pop() : ""; // 확장자 추출
    console.log("확장자:", extension);
  
    let filePath = selectedItem.path + newName;
    console.log("원본 filePath:", filePath);
  
    // "Root/" 제거
    if (filePath.startsWith("Root/")) {
      filePath = filePath.replace("Root/", ""); // 앞부분 "Root/" 제거
    }
  
    console.log("처리된 filePath:", filePath);
  
    const fileMessage = {
      code: "9",
      codeSyncNo: codeSyncNo,
      fileName: newName,
      folderNo: selectedItem.folderNo,
      createdBy: userNo,
      extension: extension, // 확장자 추가 가능
      filePath: filePath, // 처리된 경로 사용
    };
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(fileMessage));
      toast.success(`${newName} file create`);
    } else {
      toast.error("WebSocket is not connected.");
    }
  };
  
  
  const handleCreateFolder = () => {

    const folderPath= selectedItem.path;
    const filePath = folderPath + "/" + newName;


    const folderMessage = {
      code: "10",
      codeSyncNo: codeSyncNo,
      folderName: newName,
      folderNo: selectedItem.folderNo,
      createdBy: userNo,
      filePath : filePath,
  
    };
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(folderMessage));
      toast.success(`${newName} folder create`);
    } else {
      toast.error("WebSocket is not connected.");
    }
  }

  useEffect(() => {
    if (menuItem === "Create file" || menuItem === "Create folder") {
      setNewName(""); // Create 모드일 때 빈 문자열로 초기화
    }
  }, [menuItem]);
  
  const renderRenameInput = () => {
    if (!editingName || !selectedItem) return null;
  
    const handleConfirm = () => {
      if (menuItem === "Create file") {
        if (!isValidFileName(newName)) {
          toast.error("파일 형식에 맞게 작성해주십시오 (.txt .java .xml 등등)");
          return; // 입력창 유지
        }
        handleCreateFile(); // 파일 생성 로직
      } else if (menuItem === "Create folder") {
        handleCreateFolder(); // 폴더 생성 로직
      } else {
        handleNameChange(); // 이름 변경 로직
      }
      setEditingName(false); // 입력 완료 후 종료
    };
  
    return (
      <div
        style={{
          position: "absolute",
          left: nameEditPosition.x,
          top: nameEditPosition.y,
          backgroundColor: "#f4f4f4",
          border: "1px solid #ccc",
          padding: "5px",
          display: "flex",
          alignItems: "center",
          zIndex: 1000,
          borderRadius: "4px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)} // 입력값 반영
          autoFocus
          placeholder={menuItem === "Create file" || menuItem === "Create folder" ? "Enter name" : ""}
          style={{
            padding: "5px 10px",
            fontSize: "16px",
            backgroundColor: "#f4f4f4",
            border: "1px solid #ccc",
            borderRadius: "4px",
            textAlign: "center",
            outline: "none",
          }}
        />
        <button
          onClick={handleConfirm}
          style={{
            marginLeft: "5px",
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Confirm
        </button>
        <button
          onClick={() => setEditingName(false)}
          style={{
            marginLeft: "5px",
            padding: "5px 10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  };
  
  
  

  const renderFolder = (node, parentPath = "") => {
    if (!node) return null;
  
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
  
    // 선택된 항목에 배경색을 추가하기 위한 조건
    const isSelected = selectedItem && selectedItem.path === node.path;  // 경로를 비교하여 정확한 항목만 선택
  
    return (
      <div
        style={{
          marginLeft: node.type === "folder" ? "10px" : "20px",
          backgroundColor: isSelected ? "rgba(128, 128, 128, 0.3)" : "transparent", // 선택된 항목만 배경색 추가
        }}
        key={currentPath}
        onContextMenu={(e) => handleContextMenu(e, node)}
      >
        {node.type === "folder" ? (
          <div
            style={{ fontWeight: "bold", margin: "2px 0", cursor: "pointer" }}
            onClick={() => toggleFolder(currentPath)}
          >
            <span>{isExpanded ? "-" : "+"}</span> {node.name}
          </div>
        ) : (
          node.name !== '.classpath' && (
            <div
              style={{
                margin: "2px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => handleFileClick(node)}
              onDoubleClick={() => handleFileDoubleClick(node)}
            >
              📄 {node.name}
              {node.lockedBy !== 0 && (
                <span style={{ marginLeft: "5px", color: "red", fontSize: "16px" }}>🔒</span>
              )}
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

  const handleFileDeleteClick = async () => {
    const isConfirmed = window.confirm("폴더 트리를 삭제 하시겠습니까?");
    if (!isConfirmed) return;
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true); // 로딩 상태 시작
      try {
        const message = {
          code: "6",
          codeSyncNo,
        };
        socket.send(JSON.stringify(message));
  
        // WebSocket 메시지 완료 확인
        const onMessageHandler = (event) => {
          const response = JSON.parse(event.data);
          if (response.status === "delete_complete") {
            setFolderTree(null); // 폴더 트리 상태 초기화
            setNoDataFound(true); // 데이터 없음 상태로 업데이트
            setIsLoading(false); // 로딩 종료
            socket.removeEventListener("message", onMessageHandler); // 이벤트 핸들러 제거
            
            // 삭제 완료 후 alert
            toast.success('folderTree Delete Complete.');
            
            // 화면 새로고침
            window.location.reload();
          }
        };
  
        socket.addEventListener("message", onMessageHandler);
      } catch (error) {
        console.error("Error deleting folder tree:", error);
        setIsLoading(false); // 오류 발생 시 로딩 종료
      }
    } else {
      console.warn("WebSocket is not open. Unable to send delete request.");
    }
  };
  
  const handleFileExport = (folderStructure) => {
    if (!Array.isArray(folderStructure)) {
      // folderStructure가 객체라면 배열로 래핑
      folderStructure = [folderStructure];
    }
  
    // 사용자가 ZIP 파일 이름을 입력하도록 하는 팝업
    const zipFileName = prompt("다운로드할 ZIP 파일의 이름을 입력하세요 (예: my_folder.zip)", "folder_structure.zip");
  
    if (!zipFileName) {
      alert("파일 이름을 입력해주세요.");
      return;
    }
  
    const zip = new JSZip();
    
    // 폴더 구조를 재귀적으로 순회하며 zip에 추가
    const addFilesToZip = (node, parentPath = "") => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      
      if (node.type === "folder") {
        // 폴더가 있으면 폴더 내에 파일들을 추가
        if (node.children) {
          node.children.forEach(child => addFilesToZip(child, currentPath));
        }
      } else {
        // 파일이면 해당 파일을 zip에 추가 (파일 내용을 그대로)
        zip.file(currentPath, node.content); // 실제 파일 내용 확인 필요
      }
    };
  
    // 폴더 트리 구조를 zip에 추가
    folderStructure.forEach(node => addFilesToZip(node));
  
    // zip 파일 생성 후 다운로드
    zip.generateAsync({ type: "blob" }).then(content => {
      // 다운로드를 위해 Blob을 생성하여 파일로 저장
      saveAs(content, zipFileName); // 사용자 지정 이름으로 파일 저장
    });
  };
  
  
  return (
    <SidebarContainer width={sidebarWidth}>
      {folderTree === null ? (
        <Button onClick={handleFileInputClick}>Upload Folder</Button>
      ) : [
        <RedButton onClick={handleFileDeleteClick}>Delete FolderTree</RedButton>, 
        <Button onClick={() => handleFileExport(folderTree)}>Export FolderTree</Button>
      ]
      
      } 
  
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        onChange={handleFolderSelect}
        multiple
      />
       {renderRenameInput()} {/* 이름 수정 입력창 */}
  
  <FileTreeContainer>
        {isLoading ? (
          <LoadingSpinner />
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
