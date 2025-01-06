 import React from 'react';

const Arrow = ({ startPosition, endPosition }) => {
  const startX = startPosition.x + 155;
  const startY = startPosition.y + 50;
  const endX = endPosition.x + 155;
  const endY = endPosition.y + 50;

  // 꺾이는 지점 계산 (X축 중심에 따라 설정)
  const bendX = (startX + endX) / 2; 

  // 경로 정의: 시작 -> 꺾이는 지점 -> 끝점
  const pathData = `M ${startX} ${startY} L ${bendX} ${startY} L ${bendX} ${endY} L ${endX} ${endY}`;

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
      {/* 화살표 경로 */}
      <path d={pathData} stroke="purple" strokeWidth="2" fill="none" />
      {/* 화살표 머리 */}
      <polygon
        points={`${endX},${endY} ${endX - 8},${endY - 5} ${endX - 8},${endY + 5}`}
        fill="purple"
      />
    </svg>
  );
};

export default Arrow;