import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const StyledLogo = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  a{
    text-decoration: none;
    color: black;
  }
`;

const StyledButton = styled.button`
  margin-left: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  a{
    text-decoration: none;
    color: white;
  }
  

  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 30px;
`;

const Header = () => {
    return (
      <StyledHeader>
        <StyledLogo><Link to ='/'>My Logo</Link></StyledLogo>
        <ButtonContainer>
          <StyledButton><Link to = '/login'>LOGIN</Link></StyledButton>
          <StyledButton>LOGOUT</StyledButton>
          <StyledButton>MY PAGE</StyledButton>
          <StyledButton>CREATE PROJECT</StyledButton>
          <StyledButton>MOVE TO ADMIN</StyledButton>
        </ButtonContainer>
      </StyledHeader>
    );
  };
export default Header;