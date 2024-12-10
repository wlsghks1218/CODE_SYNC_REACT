import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #e0e0e0;
  padding: 10px;
`;

const SidebarRight = () => {
  const handleInviteUser = () => {
    // 유저 초대 API 호출 예시
    axios.post('/api/invite', { userId: 123 })
      .then(response => console.log('User invited'))
      .catch(error => console.error('Error inviting user:', error));
  };

  return (
    <SidebarContainer>
      <button onClick={handleInviteUser}>Invite User</button>
      <button>Open Chat</button>
      <button>View History</button>
      <button>View Project Participants</button>
    </SidebarContainer>
  );
};

export default SidebarRight;
