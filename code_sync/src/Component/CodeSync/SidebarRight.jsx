import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import LiveChat from './LiveChat';
import ViewHistory from './ViewHistory'; // ViewHistory 컴포넌트 추가
import { StyleSheetManager } from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #e0e0e0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BottomButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: absolute;
  bottom: 20px;
  width: calc(100% - 20px);
  padding: 0 10px;
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

const Message = styled.div`
  font-size: 14px;
  margin-top: 10px;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 2s ease-out;
  color: ${({ type }) => (type === 'error' ? 'red' : 'green')};
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 90px;
  left: 10px;
  z-index: 1;
  max-width: 220px;
  padding: 0 10px;
  font-weight: bold;
  box-shadow: none;
`;

const ChatWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 450px;  // 크기를 더 키움
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  transform: translateX(${(props) => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 9999;
`;

const ChatHeader = styled.div`
  background-color: #007bff;  // 색상 변경
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #ff3d3d;
  }
`;

const LiveChatContent = styled.div`
  height: calc(100% - 50px);  // ChatHeader를 제외한 나머지 영역
  overflow-y: auto;
  padding: 20px;
`;

// 여기서부터 유저 초대 모달용

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
const StyledTable = styled.table`
  width: 100%;
`;
const InputField = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
const ReasonSpan = styled.span`
    color: red;
    margin-left: 10px;
    font-size: 12px;
    font-weight: bold;
`;
const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const InviteButton = styled.button`
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #6c757d;
  }
`;
const SidebarRight = ({ socket, fileNo, onSaveStatusChange, onFileContentChange ,data , message}) => {
  const { codeSyncNo } = useParams();
  const user = useSelector((state) => state.user);
  const userNo = user.user.userNo;
  const userId = user.user.userId;
  const [savemessage, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // LiveChat 상태 추가
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // ViewHistory 상태 추가
  // 여기서부터 유저 초대 모달용
  const [isProjectUsersModalOpen, setIsProjectUsersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitedUser, setInvitedUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [lockStatus, setLockStatus] = useState(null); // lockStatus 상태 추가



  useEffect(() => {
    if(!fileNo)return;
    axios
         .post('http://116.121.53.142:9100/api/codeSync/checkWhoLocked', {
           fileNo,
           userNo,
           codeSyncNo,
         })
         .then((response) => {
           try {
             const status = response.data.isLocked;
             setLockStatus(status); // lockStatus 상태 업데이트

           } catch (error) {
             // 오류 처리
           }
         })
         .catch(() => {
           // 아무것도 하지 않음
         });
 }, [fileNo,message]); 


  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.post('http://116.121.53.142:9100/api/codeSync/getProject', {
          codeSyncNo,
        });
        setSelectedProject(response.data); // 응답 데이터를 상태에 저장
      } catch (error) {
      }
    };
  
    fetchProject();
  }, [codeSyncNo]); 
  


  const handleSaveCode = () => {
    let content = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_modified')) {
        content = localStorage.getItem(key);
        break;
      }
    }

    if (content && fileNo) {
      axios
        .post('http://116.121.53.142:9100/api/codeSync/saveCode', { fileNo, content , codeSyncNo ,userId})
        .then((response) => {
          const unlockRequest = {
            code: '4',
            lockedBy: userNo,
            fileNo: fileNo,
            codeSyncNo: codeSyncNo,
          };

          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(unlockRequest));
          } else {
          }

          setMessage('수정이 완료되었습니다');
          setMessageType('success');
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);

          onSaveStatusChange();
        })
        .catch((error) => {
        });
    } else {
      setMessage('수정사항이 없습니다');
      setMessageType('error');
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  const handleRevertCode = () => {
    const isConfirmed = window.confirm('코드를 초기 상태로 변경 하시겠습니까?');
    if (!isConfirmed) return;

    let content = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_original')) {
        content = localStorage.getItem(key);
        break;
      }
    }

    const unlockRequest = {
      code: '4',
      lockedBy: userNo,
      fileNo: fileNo,
      codeSyncNo: codeSyncNo,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(unlockRequest));
    } else {
    }
    onSaveStatusChange();

    onFileContentChange({
      content: content,
      fileNo: fileNo,
    });
  };

  const openChat = () => {
    setIsChatOpen(!isChatOpen); // 채팅 창 열고 닫기 상태 토글
  };

  const closeChat = () => {
    setIsChatOpen(false); // 닫기 버튼 클릭 시 채팅 창 닫기
  };
  const openHistory = () => {
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };
 // 여기서부터 모달용
  const handleCloseProjectUsersModal = () => {
    setIsProjectUsersModalOpen(false);
    setSearchTerm('');
    setFilteredUsers([]);
    setInvitedUser([]);
  };

  const handleOpenProjectUsersModal = async (project) => {
        try {
          const responseUsers = await axios.get(`http://116.121.53.142:9100/project/getProjectUsers`, {
            params: { projectNo: project.projectNo },
          });
    
          const responseInvited = await axios.get(`http://116.121.53.142:9100/project/getInvitedUsers`, {
            params: { projectNo: project.projectNo },
          });
    
          setSelectedProject({ ...project, users: responseUsers.data });
          setInvitedUser(responseInvited.data);
          setIsProjectUsersModalOpen(true);
        } catch (error) {
        }
      };

       const removeUserFromProject = async (userNo) => {
              try {
                await axios.post('http://116.121.53.142:9100/project/removeUser', {
                  projectNo: selectedProject.projectNo,
                  userNo: userNo,
                });
                alert("참여 유저가 제거되었습니다.");
            
                const responseUsers = await axios.get(`http://116.121.53.142:9100/project/getProjectUsers`, {
                  params: { projectNo: selectedProject.projectNo },
                });
                setSelectedProject((prev) => ({ ...prev, users: responseUsers.data }));
      
                const responseAllUsers = await axios.get(`http://116.121.53.142:9100/member/getAllUsers`);
                setAllUsers(responseAllUsers.data);
      
                const updatedFilteredUsers = responseAllUsers.data.filter(
                  (user) =>
                    searchTerm && 
                    user.userId.includes(searchTerm) &&
                    !responseUsers.data.some((u) => u.userNo === user.userNo) &&
                    !invitedUser.some((u) => u.userNo === user.userNo)
                );
                setFilteredUsers(updatedFilteredUsers);
      
              } catch (error) {
              }
            };
               const cancelInvitation = async (userNo) => {
                    try {
                      await axios.post('http://116.121.53.142:9100/project/cancelInvitation', {
                        projectNo: selectedProject.projectNo,
                        userNo: userNo,
                      });
                      alert("초대가 취소되었습니다.");
                  
                      const responseInvited = await axios.get(`http://116.121.53.142:9100/project/getInvitedUsers`, {
                        params: { projectNo: selectedProject.projectNo },
                      });
                      setInvitedUser(responseInvited.data);
            
                      const responseAllUsers = await axios.get(`http://116.121.53.142:9100/member/getAllUsers`);
                      setAllUsers(responseAllUsers.data);
                  
                      const updatedFilteredUsers = responseAllUsers.data.filter(
                        (user) =>
                          searchTerm &&
                          user.userId.includes(searchTerm) &&
                          !selectedProject?.users.some((u) => u.userNo === user.userNo) &&
                          !responseInvited.data.some((u) => u.userNo === user.userNo)
                      );
                      setFilteredUsers(updatedFilteredUsers);
                    } catch (error) {
                    }
                  };
                  const handleSearchChange = (e) => {
                    const term = e.target.value;
                    setSearchTerm(term);
                    if (term) {
                      const filtered = allUsers.filter(
                        (user) =>
                          user.userId.includes(term) &&
                          !selectedProject?.users?.some((u) => u.userNo === user.userNo) &&
                          !invitedUser.some((u) => u.userNo === user.userNo)
                      );
                      setFilteredUsers(filtered);
                    } else {
                      setFilteredUsers([]);
                    }
                  };
                    const handleInvite = async (userNo, userEmail, userId) => {
                        if (selectedProject) {
                          const totalUsers = selectedProject.users.length + invitedUser.length;
                  
                          if (totalUsers >= 6) {
                            alert("프로젝트는 최대 6명까지 참여할 수 있습니다.");
                            return;
                          }
                  
                          setInvitingUserId(userNo);
                          try {
                            await axios.post('http://116.121.53.142:9100/project/inviteUser', {
                              projectNo: selectedProject.projectNo,
                              projectName: selectedProject.projectName,
                              userNo: userNo,
                              userEmail: userEmail,
                            });
                      
                            alert("초대가 완료되었습니다.");
                      
                            const responseInvited = await axios.get(`http://116.121.53.142:9100/project/getInvitedUsers`, {
                              params: { projectNo: selectedProject.projectNo },
                            });
                            setInvitedUser(responseInvited.data);
                      
                            setAllUsers((prevUsers) => prevUsers.filter((user) => user.userNo !== userNo));
                            setFilteredUsers((prevFiltered) => prevFiltered.filter((user) => user.userNo !== userNo));
                          } catch (error) {
                          } finally {
                            setInvitingUserId(null);
                          }
                        }
                      };
            
  return (
    <>
     <StyleSheetManager shouldForwardProp={(prop) => prop !== 'isOpen'}>
     <ChatWrapper isOpen={isChatOpen}>
        <ChatHeader>
          <span>Live Chat</span>
          <CloseButton onClick={closeChat}>×</CloseButton>
        </ChatHeader>
        <LiveChatContent>
          <LiveChat data={data}/>
        </LiveChatContent>
      </ChatWrapper>
      <ViewHistory isOpen={isHistoryOpen} onClose={closeHistory} />
              
</StyleSheetManager>
     
      <SidebarContainer>
        <ButtonGroup>
        <Button onClick={() => handleOpenProjectUsersModal(selectedProject)}>Share / Users</Button>

          <Button onClick={openChat}>Open Chat</Button>
          <Button onClick={openHistory}>View History</Button>
        </ButtonGroup>

        {showMessage && <Message show={showMessage} type={messageType}>{savemessage}</Message>}

        {lockStatus === 2 && (
        <BottomButtons>
          <SaveButton onClick={handleSaveCode}>Save Code</SaveButton>
          <RevertButton onClick={handleRevertCode}>Revert Code</RevertButton>
        </BottomButtons>
      )}
      </SidebarContainer>
      {isProjectUsersModalOpen && (
               <ModalBackground onClick={() => handleCloseProjectUsersModal()}>
    <ModalContent onClick={(e) => e.stopPropagation()}>
                  <h2>프로젝트 참여 관리</h2>
                  <span>프로젝트 명 : {selectedProject?.projectName}</span><br/>
                  <span>프로젝트 공개 여부 : {selectedProject?.projectDisclosure}</span><br/>
                  {selectedProject?.projectDisclosure === "public" && selectedProject.token && (
                    <div style={{ marginTop: '20px' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        초대 코드 : {selectedProject.token}
                      </span>
                      <button
                        style={{
                          marginLeft: '10px',
                          padding: '5px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText("http://116.121.53.142:9100/project/"+selectedProject.token);
                          alert('초대 코드가 클립보드에 복사되었습니다!');
                        }}
                      >
                        복사
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <StyledTable>
                        <thead>
                          <tr>
                            <th>참여 유저</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject?.users.map((member) => (
                            <tr key={member.userNo}>
                              <td>
                                {member.userId}
                                {selectedProject.muserNo === user.user.userNo && user.user.userNo !== member.userNo && (
                                  <button
                                    style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                                    onClick={() => removeUserFromProject(member.userNo)}
                                  >
                                    추방
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </StyledTable>
                    </div>
                    <div style={{ flex: 1 }}>
                      <StyledTable>
                        <thead>
                          <tr>
                            <th>초대된 유저</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitedUser.map((member) => (
                            <tr key={member.userNo}>
                              <td>
                                {member.userId}
                                {selectedProject.muserNo === user.user.userNo && (
                                  <button
                                    style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                                    onClick={() => cancelInvitation(member.userNo)}
                                  >
                                    초대 취소
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </StyledTable>
                    </div>
                  </div>
                  <h3>유저 검색</h3>
                  <InputField
                    type="text"
                    placeholder="유저 ID를 검색하세요."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <StyledTable>
                    <thead>
                      <tr>
                        <th>유저 ID</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.userNo}>
                          <td>
                            <div>
                              {user.userId}
                              {user.projectCount >= 3 && (
                                <ReasonSpan>프로젝트 개수 초과</ReasonSpan>
                              )}
                            </div>
                          </td>
                          <td>
                            {/* 초대 상태 및 스피너 */}
                            {invitingUserId === user.userNo ? (
                              <Spinner />
                            ) : user.invited ? (
                              <InviteButton disabled>초대 완료</InviteButton>
                            ) : (
                              <InviteButton
                                onClick={() =>
                                  handleInvite(user.userNo, user.userEmail, user.userId)
                                }
                                disabled={
                                  user.projectCount >= 3 ||
                                  selectedProject?.users.length >= 6 ||
                                  invitingUserId !== null
                                }
                              >
                                초대
                              </InviteButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                  <InviteButton onClick={handleCloseProjectUsersModal}>닫기</InviteButton>
                </ModalContent>
              </ModalBackground>
             )}
            
    </>
  );
};

export default SidebarRight;
