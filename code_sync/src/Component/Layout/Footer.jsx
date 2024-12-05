import React from 'react';
import styled from 'styled-components';

const StyledFooter = styled.div`
  width: 100%;
  padding: 20px 0;
  background-color: #f8f9fa;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  font-size: 14px;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
`;

const Footer = () => {
    return (
        <StyledFooter>
            <span>CODE SYNC</span>
            <span>사업자 등록 번호: 123-456-7890</span>
            <span>전화 번호: 123-456-7890</span>
        </StyledFooter>
    );
};

export default Footer;