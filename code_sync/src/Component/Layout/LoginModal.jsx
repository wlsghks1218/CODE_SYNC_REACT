import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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
  z-index: 9999;
`;

const ModalContent = styled.div`
  width: 500px;
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

const LoginModal = ({ isOpen, onClose, onNavigateToLogin }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const handleNavigateToLogin = () => {
      navigate('/login');
      onClose();
    };
  if (!isOpen) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>로그인이 필요합니다.</h2>
        <p>로그인 후 사용 가능한 기능입니다.</p>
        <div>
          <ModalButton onClick={handleNavigateToLogin}>로그인</ModalButton>
          <ModalButton onClick={onClose}>돌아가기</ModalButton>
        </div>
      </ModalContent>
    </ModalBackground>
  );
};

export default LoginModal;
