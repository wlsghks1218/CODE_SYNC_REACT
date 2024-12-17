import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 5px 0;
  width: 150px;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background-color: #f1f1f1;
  }
`;
const ContextMenu = ({ x, y, items, onItemClick }) => {
    return (
      <ul style={{
        position: 'absolute',
        top: y + 'px',  // 마우스 위치 바로 위로
        left: x + 'px', // 마우스 위치에 맞춰서
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        listStyle: 'none',
        margin: 0,
        zIndex: 1000,
        boxSizing: 'border-box', // border 포함한 크기 조정
      }}>
        {items.map((item, index) => (
          <li key={index} onClick={() => onItemClick(item)}>
            {item}
          </li>
        ))}
      </ul>
    );
  };
  

  
  
  
export default ContextMenu;
