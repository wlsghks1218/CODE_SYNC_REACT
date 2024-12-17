import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #e0e0e0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; /* 버튼 간격 */
`;

const BottomButtons = styled.div`
  margin-top: auto; /* 하단에 위치 */
  display: flex;
  justify-content: space-evenly; /* 버튼을 균등하게 배치 */
  gap: 10px; /* 버튼 간격 */
`;

const Button = styled.button`
  padding: 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1565c0;
  }
`;

const SaveButton = styled(Button)`
  background-color: #4caf50;

  &:hover {
    background-color: #388e3c;
  }
`;

const RevertButton = styled(Button)`
  background-color: #f44336;

  &:hover {
    background-color: #d32f2f;
  }
`;

const SidebarRight = () => {

  const user = useSelector(state => state.user);
  const userNo = user.user.userNo;

  const handleInviteUser = () => {
    // 유저 초대 API 호출 예시
    axios.post('/api/invite', { userId: 123 })
      .then(response => console.log('User invited'))
      .catch(error => console.error('Error inviting user:', error));
  };

  const handleSaveCode = () => {
    console.log("save!");
  };

  const handleRevertCode = () => {
    console.log('Code reverted');
  };

  return (
    <SidebarContainer>
      <ButtonGroup>
        <Button onClick={handleInviteUser}>Invite User</Button>
        <Button>Open Chat</Button>
        <Button>View History</Button>
        <Button>View Project Participants</Button>
      </ButtonGroup>
      <BottomButtons>
        <SaveButton onClick={handleSaveCode}>Save Code</SaveButton>
        <RevertButton onClick={handleRevertCode}>Revert Code</RevertButton>
      </BottomButtons>
    </SidebarContainer>
  );
};

export default SidebarRight;
