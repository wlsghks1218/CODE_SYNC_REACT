import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LiveChat from './LiveChat';
import ViewHistory from './ViewHistory'; // ViewHistory 컴포넌트 추가

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #e0e0e0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BottomButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: absolute;
  bottom: 20px;
  width: calc(100% - 20px);
  padding: 0 10px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1565c0;
  }
`;

const SaveButton = styled(Button)`
  background-color: #4caf50;

  &:hover {
    background-color: #388e3c;
  }
`;

const RevertButton = styled(Button)`
  background-color: #f44336;

  &:hover {
    background-color: #d32f2f;
  }
`;

const Message = styled.div`
  font-size: 14px;
  margin-top: 10px;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 2s ease-out;
  color: ${({ type }) => (type === 'error' ? 'red' : 'green')};
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 90px;
  left: 10px;
  z-index: 1;
  max-width: 220px;
  padding: 0 10px;
  font-weight: bold;
  box-shadow: none;
`;

const ChatWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 450px;  // 크기를 더 키움
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  transform: translateX(${(props) => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 9999;
`;

const ChatHeader = styled.div`
  background-color: #007bff;  // 색상 변경
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #ff3d3d;
  }
`;

const LiveChatContent = styled.div`
  height: calc(100% - 50px);  // ChatHeader를 제외한 나머지 영역
  overflow-y: auto;
  padding: 20px;
`;

const SidebarRight = ({ socket, fileNo, onSaveStatusChange, onFileContentChange ,data }) => {
  const { codeSyncNo } = useParams();
  const user = useSelector((state) => state.user);
  const userNo = user.user.userNo;
  const userId = user.user.userId;
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // LiveChat 상태 추가
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // ViewHistory 상태 추가

  const handleInviteUser = () => {
  };

  const handleSaveCode = () => {
    let content = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_modified')) {
        content = localStorage.getItem(key);
        break;
      }
    }

    if (content && fileNo) {
      axios
        .post('http://localhost:9090/api/codeSync/saveCode', { fileNo, content , codeSyncNo ,userId})
        .then((response) => {
          const unlockRequest = {
            code: '4',
            lockedBy: userNo,
            fileNo: fileNo,
            codeSyncNo: codeSyncNo,
          };

          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(unlockRequest));
          } else {
          }

          setMessage('수정이 완료되었습니다');
          setMessageType('success');
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);

          onSaveStatusChange();
        })
        .catch((error) => {
        });
    } else {
      setMessage('수정사항이 없습니다');
      setMessageType('error');
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  const handleRevertCode = () => {
    const isConfirmed = window.confirm('코드를 초기 상태로 변경 하시겠습니까?');
    if (!isConfirmed) return;

    let content = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_original')) {
        content = localStorage.getItem(key);
        break;
      }
    }

    const unlockRequest = {
      code: '4',
      lockedBy: userNo,
      fileNo: fileNo,
      codeSyncNo: codeSyncNo,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(unlockRequest));
    } else {
    }
    onSaveStatusChange();

    onFileContentChange({
      content: content,
      fileNo: fileNo,
    });
  };

  const openChat = () => {
    setIsChatOpen(!isChatOpen); // 채팅 창 열고 닫기 상태 토글
  };

  const closeChat = () => {
    setIsChatOpen(false); // 닫기 버튼 클릭 시 채팅 창 닫기
  };
  const openHistory = () => {
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };
  return (
    <>
      <ChatWrapper isOpen={isChatOpen}>
        <ChatHeader>
          <span>Live Chat</span>
          <CloseButton onClick={closeChat}>×</CloseButton>
        </ChatHeader>
        <LiveChatContent>
          <LiveChat data={data}/>
        </LiveChatContent>
      </ChatWrapper>
      <ViewHistory isOpen={isHistoryOpen} onClose={closeHistory} />
      <SidebarContainer>
        <ButtonGroup>
          <Button onClick={handleInviteUser}>Share / Users</Button>
          <Button onClick={openChat}>Open Chat</Button>
          <Button onClick={openHistory}>View History</Button>
        </ButtonGroup>

        {showMessage && <Message show={showMessage} type={messageType}>{message}</Message>}

        <BottomButtons>
          <SaveButton onClick={handleSaveCode}>Save Code</SaveButton>
          <RevertButton onClick={handleRevertCode}>Revert Code</RevertButton>
        </BottomButtons>
      </SidebarContainer>
    </>
  );
};

export default SidebarRight;
