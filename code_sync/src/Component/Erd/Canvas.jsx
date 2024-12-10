import React, { useState } from "react";
import styled from "styled-components";

const Canvas = ({ children, viewport, startDrag, stopDrag, onDrag, setIsDragging }) => {
  const [scale, setScale] = useState(1); // 줌 비율 상태 관리

  const handleMouseDown = (e) => {
    setIsDragging(false); // 캔버스 드래그 비활성화
    startDrag(e);
  };

  const handleWheel = (e) => {
    // wheel 이벤트가 발생했을 때 줌 조정
    e.preventDefault(); // 기본 스크롤 동작을 막음

    // 마우스 휠 방향에 따라 스케일 변경
    if (e.deltaY < 0) {
      setScale((prevScale) => Math.min(prevScale * 1.1, 2)); // 줌 인 (최대 2배)
    } else {
      setScale((prevScale) => Math.max(prevScale / 1.1, 0.5)); // 줌 아웃 (최소 0.5배)
    }
  };

  return (
    <CanvasContainer
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseUp={stopDrag}
      onMouseMove={onDrag}
      onWheel={handleWheel} // wheel 이벤트 추가
      style={{
        cursor: "grab",
      }}
    >
      <CanvasContent
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${scale})`, // scale 적용
        }}
      >
        {children}
      </CanvasContent>
    </CanvasContainer>
  );
};

export default Canvas;

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
`;

const CanvasContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;
