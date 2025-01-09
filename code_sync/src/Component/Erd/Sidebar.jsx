import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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

const Sidebar = ({ onButtonClick }) => {
  const { erdNo } = useParams();
  const [isProjectUsersModalOpen, setIsProjectUsersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitedUser, setInvitedUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [lockStatus, setLockStatus] = useState(null); // lockStatus 상태 추가
  const user = useSelector((state) => state.user);



    const handleCloseProjectUsersModal = () => {
      setIsProjectUsersModalOpen(false);
      setSearchTerm('');
      setFilteredUsers([]);
      setInvitedUser([]);
    };
    
      useEffect(() => {
        const fetchProject = async () => {
          try {
            const response = await axios.post('http://116.121.53.142:9100/erd/getProject', {
              erdNo,  
            });
            setSelectedProject(response.data); // 응답 데이터를 상태에 저장
          } catch (error) {
          }
        };
      
        fetchProject();
      }, [erdNo]); 
      
  
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
    <SidebarContainer>
      <h3>Sidebar</h3>
      <button onClick={() => handleOpenProjectUsersModal(selectedProject)}>Share / Users</button>
      <button onClick={() => onButtonClick("liveChat")}>Live Chat</button>
      <button onClick={() => onButtonClick("history")}>History</button>
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

const SidebarContainer = styled.div`
  width: 200px;
  background-color: #f9f9f9;
  border-right: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;

  h3 {
    font-size: 18px;
    margin-bottom: 20px;
  }

  button {
    padding: 8px 12px;
    font-size: 14px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 10px;
    transition: background-color 0.2s ease;
    width: 100%;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

export default Sidebar;
