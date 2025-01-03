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
  border-bottom: 1px solid #ccc; /* 각 아이템에 아래쪽 경계선 추가 */

  &:hover {
    background-color: #f1f1f1;
  }

  &:last-child {
    border-bottom: none; /* 마지막 아이템은 아래쪽 경계선 없애기 */
  }
`;

const ContextMenu = ({ x, y, items, onItemClick }) => {
  return (
    <MenuContainer style={{ top: y + 'px', left: x + 'px' }}>
      {items.map((item, index) => (
        <MenuItem key={index} onClick={() => onItemClick(item)}>
          {item}
        </MenuItem>
      ))}
    </MenuContainer>
  );
};

export default ContextMenu;
