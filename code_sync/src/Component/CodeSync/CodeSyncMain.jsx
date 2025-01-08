import React, { useState, useEffect } from 'react';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import MainContent from './MainContent';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  padding-top: 60px;
  padding-bottom: 60px;
  overflow: auto;
`;

const CodeSyncMain = ({ data }) => {
  const { codeSyncNo } = useParams();
  const [fileContent, setFileContent] = useState('');
  const [fileNo, setFileNo] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // 저장 상태 관리
  const [message, setMessage] = useState(null);

  const handleFileContentChange = ({ content, fileNo }) => {
    setFileContent(content);
    setFileNo(fileNo);
  };
  const handleContentChange = (newContent) => {
    setFileContent(newContent); // fileContent 업데이트
  };
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = new WebSocket(`ws://116.121.53.142:9100/codeSync.do?codeSyncNo=${codeSyncNo}`);
    setSocket(newSocket);

  }, [codeSyncNo]);

  useEffect(() => {
    if (socket) {
      const handleMessage = async (event) => {
        setMessage(JSON.parse(event.data));
      };

    
  
      socket.onmessage = handleMessage;
  
      // Cleanup: 이전 핸들러 제거
      return () => {
        socket.onmessage = null;
      };
    }
  }, [socket]);
  
  // 저장 상태를 변경하는 함수
  const handleSaveStatusChange = () => {
    setIsSaved(true);
  };

  return (
    <MainContainer>
      <ContentWrapper>
        <SidebarLeft
          onFileContentChange={handleFileContentChange}
          data={data}
          socket={socket}
          isSaved={isSaved} // 저장 상태 전달
          message={message}
        />
        <MainContent 
         onFileContentChange={handleContentChange}
  fileContent={fileContent} 
  fileNo={fileNo} 
  socket={socket} 
  message={message} 
/>
        <SidebarRight  message={message}  socket={socket} fileNo={fileNo} onSaveStatusChange={handleSaveStatusChange} onFileContentChange={handleFileContentChange} data={data}/> {/* 저장 상태 변경 함수 전달 */}
      </ContentWrapper>

    </MainContainer>
  );
};

export default CodeSyncMain;
