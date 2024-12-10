import React from 'react';
import styled from 'styled-components';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <Content>{children}</Content>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  width: 400px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  background: #007bff;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const Content = styled.div`
  padding: 20px;
`;

export default Modal;
