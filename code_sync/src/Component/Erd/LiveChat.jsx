import React, { useState } from 'react';
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
`;

const MessageBubble = styled.div`
  background-color: ${(props) => (props.isUser ? '#0078D4' : '#e1e1e1')};
  color: ${(props) => (props.isUser ? '#fff' : '#000')};
  padding: 10px;
  border-radius: 15px;
  max-width: 70%;
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
  const [messages, setMessages] = useState([]); 
  const [inputValue, setInputValue] = useState(''); 

  const handleSendMessage = () => {
    if (!inputValue.trim()) return; 

    const newMessage = {
      text: inputValue,
      isUser: true, 
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]); 
    setInputValue(''); 

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botMessage = {
        text: `Echo: ${inputValue}`,
        isUser: false, 
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000); 
  };

  return (
    <ChatContainer>
      <ChatMessages>
        {messages.map((msg, index) => (
          <ChatMessage key={index} isUser={msg.isUser}>
            <MessageBubble isUser={msg.isUser}>{msg.text}</MessageBubble>
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
