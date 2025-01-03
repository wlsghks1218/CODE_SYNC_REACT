import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
`;

const ChatMessage = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  margin: 5px 0;
  flex-direction: column; /* 상하 배치 */
  align-items: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.isUser ? 'row-reverse' : 'row')};
  background-color: ${(props) => (props.isUser ? '#0078D4' : '#e1e1e1')};
  color: ${(props) => (props.isUser ? '#fff' : '#000')};
  padding: 10px;
  border-radius: 15px;
  max-width: 70%;
  align-items: center;
`;

const UserId = styled.span`
  font-weight: bold;
  color: ${(props) => (props.isUser ? '#0078D4' : '#000')};
  margin-right: 10px;
  font-size: 14px;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
  align-items: flex-start;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 15px;
  background-color: #0078D4;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
`;

const LiveChat = () => {
  const { erdNo } = useParams();  // URL 경로에서 erdNo 파라미터 가져오기
  const location = useLocation();
  const [messages, setMessages] = useState([]);  // 메시지 상태
  const [inputValue, setInputValue] = useState('');  // 입력값 상태
  const [socket, setSocket] = useState(null);  // WebSocket 연결 상태
  const [userId, setUserId] = useState(null);
  const user = useSelector((state) => state.user);
  const userNo = user.user.userNo;

  // 사용자 ID를 가져오는 함수
  async function getUserId() {
    try {
      const response = await axios.get(`http://localhost:9090/erd/userId?userNo=${userNo}`);
      const userId = response.data.userId;
      setUserId(userId);
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
  }

  // 서버에서 채팅 기록을 가져오는 함수
  async function getChatHistory() {
    try {
      const response = await axios.get(`http://localhost:9090/erd/chatHistory?erdNo=${erdNo}`);
      const chatHistory = response.data;
  
      // 내 메세지 판별
      const processedMessages = chatHistory.map((msg) => ({
        ...msg,
        isUser: msg.userId === userId,
      }));
  
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }

  useEffect(() => {
    if (!userId || !erdNo) return;

    // 채팅 기록을 가져오기
    getChatHistory();

    // WebSocket 연결
    const socket = new WebSocket('ws://localhost:9090/chatserver.do?erdNo=' + erdNo);
    setSocket(socket);

    socket.onopen = () => {
      console.log('Connected to LiveChatWebSocket server');
    };

    socket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);

      // 내가 보낸 메시지는 화면에 추가하지 않음
      if (incomingMessage.userId !== userId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            userId: incomingMessage.userId, 
            content: incomingMessage.content, 
            isUser: false, 
            chatTime: incomingMessage.chatTime || new Date().toISOString(), 
          },
        ]);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from LiveChat WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, [erdNo, userId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      content: inputValue,
      isUser: true,
      erdNo: erdNo,
      userNo: userNo,
      userId: userId,
      chatTime: new Date().toISOString(),  // 현재 시간 추가
      code: "1",
    };

    // 화면에 먼저 메시지를 추가
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // WebSocket으로 메시지 전송
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(newMessage));
    }

    // 입력값 초기화
    setInputValue('');
  };

  useEffect(() => {
    getUserId();
  }, [userNo]);

  return (
    <ChatContainer>
      <ChatMessages>
        {messages.map((msg, index) => (
          <ChatMessage key={index} isUser={msg.isUser}>
            <MessageBubble isUser={msg.isUser}>
              {!msg.isUser && <UserId isUser={msg.isUser}>{msg.userId}:</UserId>}
              <span>{msg.content}</span>
            </MessageBubble>
            {/* 메시지 하단에 타임스탬프 표시 - 상하로 배치 */}
            <span style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
              {new Date(msg.chatTime).toLocaleTimeString()}
            </span>
          </ChatMessage>
        ))}
      </ChatMessages>
      <ChatInputContainer>
        <ChatInput
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <SendButton onClick={handleSendMessage}>Send</SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default LiveChat;
