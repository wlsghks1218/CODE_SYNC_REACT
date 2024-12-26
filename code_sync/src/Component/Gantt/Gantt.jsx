import React, { useState } from 'react';
import styled from 'styled-components';
import GanttChart from './GanttChart'; // GanttChart 컴포넌트 import
import ProjectHistory from './ProjectHistory'; // ProjectHistory 컴포넌트 import

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  margin-right: 10%;

  &:hover {
    background-color: #0056b3;
  }
`;

const GanttWrapper = styled.div`
  text-align: center;
  padding-top: 20px;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transform-origin: center;
  transform: scale(${({ scale }) => scale});
  padding-top: 60px;
  padding-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
`;

const Header = styled.div`
  position: relative;
  padding: 20px;
  width: 50%;
  margin: auto;
`;

const Gantt = () => {
  const [activeComponent, setActiveComponent] = useState('GanttChart'); // 초기 상태는 GanttChart
  const [scale, setScale] = useState(1);

  const toggleComponent = () => {
    setActiveComponent((prev) =>
      prev === 'GanttChart' ? 'ProjectHistory' : 'GanttChart'
    );
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault(); // 기본 줌 동작 막기
      const newScale = scale + (e.deltaY < 0 ? 0.1 : -0.1); // 줌 비율 조정
      setScale(Math.min(Math.max(newScale, 0.5), 2)); // 최소/최대 비율 설정
    }
  };

  return (
    <GanttWrapper scale={scale} onWheel={handleWheel}>
      <Header>
        <Title>
          {activeComponent === 'GanttChart' ? 'Gantt 차트' : 'Project History'}
        </Title>
        <StyledButton onClick={toggleComponent}>
          {activeComponent === 'GanttChart' ? 'History 보기' : 'Gantt 보기'}
        </StyledButton>
      </Header>
      <div>
        {activeComponent === 'GanttChart' && <GanttChart />}
        {activeComponent === 'ProjectHistory' && <ProjectHistory />}
      </div>
    </GanttWrapper>
  );
};

export default Gantt;
