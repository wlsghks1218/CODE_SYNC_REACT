import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const Toolbar = ({ onAddTable, onAddMemo, onAddArrow }) => {
  const [isAdding, setIsAdding] = useState(null);
  const tableRef = useRef(null);
  const memoRef = useRef(null);
  const arrowRef = useRef(null);

  useEffect(() => {
    if (!isAdding) return;

    const handleCanvasClick = (e) => {
      const canvas = document.querySelector(".canvas");

      if (canvas && canvas.contains(e.target)) {
        const position = {
          x: e.offsetX,
          y: e.offsetY,
        };

        // 동적으로 항목의 크기 계산 (테이블, 메모, 화살표)
        const getElementSize = (type) => {
          let width = 0;
          let height = 0;

          if (type === "table" && tableRef.current) {
            const rect = tableRef.current.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
          } else if (type === "memo" && memoRef.current) {
            const rect = memoRef.current.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
          } else if (type === "arrow" && arrowRef.current) {
            const rect = arrowRef.current.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
          }

          return { width, height };
        };

        const adjustedPosition = (type) => {
          const { width, height } = getElementSize(type);
          return {
            x: position.x - width / 2, // 클릭된 위치에서 항목의 중앙을 맞추기 위해 offset
            y: position.y - height / 2, // 클릭된 위치에서 항목의 중앙을 맞추기 위해 offset
          };
        };

        // 클릭한 위치에 따라 테이블, 메모, 화살표 추가
        if (isAdding === "table") {
          const adjustedPos = adjustedPosition("table");
          onAddTable(adjustedPos); 
        } else if (isAdding === "memo") {
          const adjustedPos = adjustedPosition("memo");
          onAddMemo(adjustedPos); 
        } else if (isAdding === "arrow") {
          const adjustedPos = adjustedPosition("arrow");
          onAddArrow(adjustedPos);
        }

        // `isAdding` 상태 초기화
        setIsAdding(null);
      }
    };

    // 캔버스에서 클릭 이벤트 리스너 등록
    document.querySelector(".canvas").addEventListener("click", handleCanvasClick);

    return () => {
      document.querySelector(".canvas").removeEventListener("click", handleCanvasClick);
    };
  }, [isAdding, onAddTable, onAddMemo, onAddArrow]);

  const handleAddTableClick = () => setIsAdding("table");
  const handleAddMemoClick = () => setIsAdding("memo");
  const handleAddArrowClick = () => setIsAdding("arrow");

  return (
    <ToolbarContainer>
      <h3>Tools</h3>
      <button onClick={handleAddTableClick}>Add Table</button>
      <button onClick={handleAddArrowClick}>Add Arrow</button>
      <button onClick={handleAddMemoClick}>Add Memo</button>
    </ToolbarContainer>
  );
};

const ToolbarContainer = styled.div`
  width: 200px;
  background-color: #f9f9f9;
  border-right: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;

  h3 {
    font-size: 18px;
    margin-bottom: 20px;
  }

  button {
    padding: 8px 12px;
    font-size: 14px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 10px;
    transition: background-color 0.2s ease;
    width: 100%;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

export default Toolbar;
