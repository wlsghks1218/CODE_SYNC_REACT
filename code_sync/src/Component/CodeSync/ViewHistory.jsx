import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';


const HistoryWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 450px;
  background-color: #f9f9f9;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  transform: translateX(${(props) => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 9999;
`;

const HistoryHeader = styled.div`
  background-color: #343a40;
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

const HistoryContent = styled.div`
  height: calc(100% - 50px);
  overflow-y: auto;
  padding: 20px;
  font-size: 14px;
  color: black;
`;

const HistoryItem = styled.div`
  background-color: #e0e0e0;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;  // 시간 위치를 조정하기 위해 필요
  padding-bottom: 30px;  // 시간을 더 아래로 내리기 위한 여유 공간
`;
const TimeLabel = styled.small`
  position: absolute;
  bottom: 10px;  // 내용의 하단에서 약간 위에 위치
  right: 10px;   // 오른쪽에 위치
  font-size: 12px;
  color: #888;   // 회색 텍스트
`;

const NoHistoryMessage = styled.p`
  font-size: 16px;
  color: #888;
  text-align: center;
`;
const ViewHistory = ({ isOpen, onClose }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { codeSyncNo } = useParams();
  
    useEffect(() => {
      if (isOpen && codeSyncNo) {
        fetchHistoryData();
      }
    }, [isOpen, codeSyncNo]);
  
    const fetchHistoryData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.get(`http://116.121.53.142:9100/api/codeSync/history/${codeSyncNo}`);
        setHistoryData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('히스토리를 가져오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Seoul',  // 서울 시간으로 변환
        });
      };
      
  
    const formatHistoryMessage = (action, fileName, folderName, newFolderName, newName, userId) => {
      switch (action) {
        case 1:
          return `${userId}님이 ${fileName} 파일을 수정했습니다`;
        case 2:
          return `${fileName || folderName} ${fileName ? '파일' : '폴더'}가 생성되었습니다`;
        case 3:
          return `${fileName || folderName} ${fileName ? '파일' : '폴더'}가 삭제되었습니다`;
        case 4:
          return `${fileName || folderName} ${fileName ? '파일' : '폴더'}가 ${newFolderName} 폴더로 이동되었습니다`;
        case 5:
          return `${fileName || folderName} ${fileName ? '파일' : '폴더'}의 이름이 ${newName}으로 변경되었습니다`;
        default:
          return '';
      }
    };
  
    return (
      <HistoryWrapper isOpen={isOpen}>
        <HistoryHeader>
          <span>View History</span>
          <CloseButton onClick={onClose}>×</CloseButton>
        </HistoryHeader>
        <HistoryContent>
          {loading && <p>Loading history...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && historyData.length === 0 && (
            <NoHistoryMessage>진행 내역이 없습니다</NoHistoryMessage>
          )}
          {!loading && !error && historyData.length > 0 && historyData.map((item, index) => (
            <HistoryItem key={index}>
              <p>{formatHistoryMessage(item.action, item.fileName, item.folderName, item.newFolderName, item.newName, item.userId)}</p>
              <TimeLabel>{formatTime(item.updateDate)}</TimeLabel> {/* 포맷팅된 시간 출력 */}
            </HistoryItem>
          ))}
        </HistoryContent>
      </HistoryWrapper>
    );
  };
  
  export default ViewHistory;