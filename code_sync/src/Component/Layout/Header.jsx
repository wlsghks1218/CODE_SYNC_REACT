import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../../Action/userAction';
import axios from 'axios';

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
const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ModalButton = styled.button`
  margin-top: 10px;
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;


const Header = () => {
  const navigate = useNavigate();
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  console.log("유저: " + JSON.stringify(user, null, 2));
  const handleLogout = async () => {
    console.log("로그아웃 시도 유저 : " + user.user.userId);
    if (user) {
      try {
        await axios.post("http://localhost:9090/member/logout", { userId: user.user.userId }, {
          headers: { "Content-Type": "application/json" },
        });
        dispatch(logout());
        console.log("Logout successful");
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else {
      console.warn("No user found for logout");
    }
  };
  const handleCreateProject = () => {
      if (!isAuthenticated) {
        setIsLoginRequiredModalOpen(true);
        return;
    }
  }
  const handleCloseLoginRequiredModal = () => {
    setIsLoginRequiredModalOpen(false);
};

const handleNavigateToLogin = () => {
    setIsLoginRequiredModalOpen(false);
    navigate('/login');
};

    return (
      <StyledHeader>
        <StyledLogo><Link to ='/'>My Logo</Link></StyledLogo>
        <ButtonContainer>
          {
            user.user === null
            ? <StyledButton><Link to='/login'>LOGIN</Link></StyledButton>
            : <StyledButton><Link onClick={handleLogout}>LOGOUT</Link></StyledButton>
          }
          {(!isAuthenticated) ?
            <StyledButton><Link to='/join'>SIGN IN</Link></StyledButton> :
            <StyledButton><Link to='/myPage'>MY PAGE</Link></StyledButton>}
          <StyledButton onClick={handleCreateProject}>CREATE PROJECT</StyledButton>
          <StyledButton>MOVE TO ADMIN</StyledButton>
        </ButtonContainer>
        {isLoginRequiredModalOpen && (
                <ModalBackground onClick={handleCloseLoginRequiredModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h2>로그인이 필요합니다.</h2>
                        <p>로그인 후 사용 가능한 기능입니다.</p>
                        <div>
                            <ModalButton onClick={handleNavigateToLogin}>로그인</ModalButton>
                            <ModalButton onClick={handleCloseLoginRequiredModal}>돌아가기</ModalButton>
                        </div>
                    </ModalContent>
                </ModalBackground>
            )}
      </StyledHeader>
    );
  };
export default Header;