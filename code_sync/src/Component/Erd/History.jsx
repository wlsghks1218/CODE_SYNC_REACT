import React, { useState } from 'react';
import styled from 'styled-components';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HistoryMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
`;

const HistoryMessage = styled.div`
  padding: 10px;
  margin: 5px 0;
  background-color: #e1e1e1;
  border-radius: 5px;
`;

const History = () => {
  const [history, setHistory] = useState([]);

  // 히스토리 추가 함수
  const addHistory = (action) => {
    const now = new Date();
    const newHistory = {
      action,
      time: now.toLocaleString(), // 현재 날짜와 시간
    };

    console.log("History added:", newHistory); // 콘솔 로그로 확인

    setHistory([newHistory, ...history]); // 새로운 기록을 앞에 추가
  };

  return (
    <HistoryContainer>
      {/* 테스트용 버튼 추가 */}
      <button onClick={() => addHistory("Item Added: New item")}>Add History</button>

      <HistoryMessages>
        {history.map((entry, index) => (
          <HistoryMessage key={index}>
            {entry.time} - {entry.action}
          </HistoryMessage>
        ))}
      </HistoryMessages>
    </HistoryContainer>
  );
};

export default History;
