import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  width: 600px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ModalButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #f1f1f1;
    font-weight: bold;
  }

  td {
    font-size: 14px;
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 5px;

  button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;

    &:hover {
      background-color: #f1f1f1;
    }

    &.active {
      background-color: #007bff;
      color: white;
      font-weight: bold;
    }
  }
`;

const DocsHistoryModal = ({ isOpen, onClose, projectNo, columnIndex }) => {
  const [docsHistory, setDocsHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPagesToShow = 10;

  useEffect(() => {
    if (!isOpen || columnIndex === null) return;
    const fetchDocsHistory = async () => {

      try {
        const response = await axios.get("http://116.121.53.142:9100/docs/getDocsHistory", {
          params: { projectNo, columnIndex },
        });
  
        setDocsHistory(response.data || []);
      } catch (error) {
        console.error("업로드 내역 가져오기 실패:", error);
      }
    };
  
    fetchDocsHistory();
  }, [isOpen, projectNo, columnIndex]);
  

  const totalPages = Math.ceil(docsHistory.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  const displayedData = docsHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  function displayTime(unixTimeStamp) {
    if (!unixTimeStamp) return '';
    const myDate = new window.Date(unixTimeStamp);
    if (isNaN(myDate)) return '';
    
    const y = myDate.getFullYear();
    const m = String(myDate.getMonth() + 1).padStart(2, '0');
    const d = String(myDate.getDate()).padStart(2, '0');
    const h = String(myDate.getHours()).padStart(2, '0');
    const min = String(myDate.getMinutes()).padStart(2, '0');
    const s = String(myDate.getSeconds()).padStart(2, '0');
    
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }
  
  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>업로드 내역 (컬럼 {columnIndex + 1})</h2>
        <HistoryTable>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((history, index) => (
              <tr key={index}>
                <td>{displayTime(history.updateDate)}</td>
                <td>{`${history.userId}가 ${history.fileName}을 ${
                  history.action === 1 ? '업로드' : '삭제'
                }했습니다.`}</td>
              </tr>
            ))}
          </tbody>
        </HistoryTable>
        <Pagination>
          {startPage > 1 && (
            <>
              <button onClick={() => handlePageChange(1)}>처음</button>
              <button onClick={() => handlePageChange(currentPage - 1)}>이전</button>
            </>
          )}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
            <button
              key={page}
              className={currentPage === page ? 'active' : ''}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              <button onClick={() => handlePageChange(currentPage + 1)}>다음</button>
              <button onClick={() => handlePageChange(totalPages)}>마지막</button>
            </>
          )}
        </Pagination>
        <ModalButton onClick={onClose}>닫기</ModalButton>
      </ModalContent>
    </ModalBackground>
  );
};

export default DocsHistoryModal;
