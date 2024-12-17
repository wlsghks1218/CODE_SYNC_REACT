import React, { useState } from "react";
import styled from "styled-components";

const Canvas = ({ children, viewport, startDrag, stopDrag, onDrag, setIsDragging }) => {
  const [scale, setScale] = useState(1); // 줌 비율 상태 관리

  const handleMouseDown = (e) => {
    setIsDragging(false); // 캔버스 드래그 비활성화
    startDrag(e);
  };

  return (
    <CanvasContainer
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseUp={stopDrag}
      onMouseMove={onDrag}
      style={{
        cursor: "grab",
      }}
    >
      <CanvasContent
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${scale})`, 
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
