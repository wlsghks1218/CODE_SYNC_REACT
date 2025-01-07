import React from "react";
import styled from "styled-components";

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 300px;
`;

const HistoryMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
`;

const HistoryMessage = styled.div`
  position: relative;
  padding: 10px 10px 25px 10px;
  margin: 5px 0;
  background-color: #e1e1e1;
  border-radius: 5px;
  word-break: break-word;
  font-size: 13px;
`;

const TimeStamp = styled.div`
  position: absolute;
  bottom: 5px; /* 메시지 박스 내부 아래쪽에 위치 */
  right: 10px;
  font-size: 10px;
  color: #888;
`;

const History = ({ history }) => (
  <HistoryContainer>
    <HistoryMessages>
      {history.slice().reverse().map((entry, index) => (
        <HistoryMessage key={index}>
          {entry.action}
          <TimeStamp>
            {new Date(entry.erdUpdateDate).toLocaleString()}
          </TimeStamp>
        </HistoryMessage>
      ))}
    </HistoryMessages>
  </HistoryContainer>
);

export default History;
