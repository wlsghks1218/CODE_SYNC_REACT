import React from 'react';

const Arrow = ({ startPosition, endPosition }) => {
  const startX = startPosition.x - 222; // 시작 X 좌표
  const startY = startPosition.y - 22; // 시작 Y 좌표
  const endX = endPosition.x - 222;   // 끝 X 좌표
  const endY = endPosition.y - 23;    // 끝 Y 좌표

  // 직선 경로 정의: 시작점 -> 끝점
  const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

  // 화살촉 좌표를 끝 점 기준으로 조금 더 크고 깔끔하게 설정
  const arrowHeadSize = 10; // 화살촉 크기
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowHeadLeftX = endX - arrowHeadSize * Math.cos(angle - Math.PI / 6);
  const arrowHeadLeftY = endY - arrowHeadSize * Math.sin(angle - Math.PI / 6);
  const arrowHeadRightX = endX - arrowHeadSize * Math.cos(angle + Math.PI / 6);
  const arrowHeadRightY = endY - arrowHeadSize * Math.sin(angle + Math.PI / 6);

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
      <path d={pathData} stroke="purple" strokeWidth="2" fill="none" />
      <polygon
        points={`${endX},${endY} ${arrowHeadLeftX},${arrowHeadLeftY} ${arrowHeadRightX},${arrowHeadRightY}`}
        fill="purple"
      />
    </svg>
  );
};

export default Arrow;
