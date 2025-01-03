import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginModal from './LoginModal';

const Container = styled.div`
  display: flex; 
  justify-content: center;
  align-items: center;
  height: 100vh; 
  background-color: #f0f0f0;
`;

const BannerDiv = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 10px;
  background-color: #007bff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
`;

const ProjectDiv = styled.div`
  width: 300px;
  height: 300px;
  margin: 0 10px;
  background-color: #28a745;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover .overlay {
    display: block;
  }

  &:hover .tooltip {
    display: flex;
  }
`;

const Overlay = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
`;

const Tooltip = styled.div`
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  color: black;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex-direction: column;
  gap: 5px;
  z-index: 1;

  width: 200px;
  height: auto;
`;

const TooltipItem = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
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

const CreateProjectHead = styled.h2`
  text-align: left;
  margin-bottom: 20px;
  color: #333;
`;

const StyledTable = styled.table`
  width: 100%;
`;

const ColumnTd = styled.td`
  text-align: left;
  padding: 10px;
  font-weight: bold;
  vertical-align: top;
`;

const InputTd = styled.td`
  text-align: left;
  padding: 10px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextAreaField = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 80px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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
const ProjectDelSpan = styled.span`
    color:red;
    text-align:center;
`;


const Main = ({ projects, fetchProjects }) => {
  const navigate = useNavigate();
    const [isProjectUsersModalOpen, setIsProjectUsersModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [invitedUser, setInvitedUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
    const [invitingUserId, setInvitingUserId] = useState(null);
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const user = useSelector(state => state.user);

    const [projectInfo, setProjectInfo] = useState({
        projectName : '',
        projectDisclosure : 'public',
        projectDesc : '',
        muserNo: ''
    });

    useEffect(() => {
        if (isAuthenticated && user && user.user) {
            setProjectInfo(prev => ({
                ...prev,
                muserNo: user.user.userNo || ''
            }));
    
            fetchProjects(user?.user?.userNo);
    
            const fetchAllUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:9090/member/getAllUsers');
                    const filtered = response.data.filter(user =>
                        !selectedProject?.users?.some(u => u.userId === user.userId)
                    );
                    setAllUsers(filtered);
                } catch (error) {
                    console.error('유저 목록 조회 실패:', error);
                }
            };
            fetchAllUsers();
        } else {
            setAllUsers([]);
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setProjectInfo({
          ...projectInfo,
          [name]: value,
      });

      if (name === "projectName" && value.replace(/[^\uAC00-\uD7A3]/g, "").length > 10) {
          alert("프로젝트 이름은 한글 10자까지 입력할 수 있습니다.");
          return;
      }
      if (name === "projectDesc" && value.replace(/[^\uAC00-\uD7A3]/g, "").length > 30) {
          alert("프로젝트 설명은 한글 30자까지 입력할 수 있습니다.");
          return;
      }
    };

    const handleOpenProjectModal = () => {
        if (!isAuthenticated) {
            setIsLoginRequiredModalOpen(true);
            return;
        }
        setProjectInfo({
            projectName: '',
            projectDisclosure: 'public',
            projectDesc: '',
            muserNo: user.user?.userNo || ''
          });

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCloseLoginRequiredModal = () => {
        setIsLoginRequiredModalOpen(false);
    };

    const handleNavigateToLogin = () => {
        setIsLoginRequiredModalOpen(false);
        navigate('/login');
    };
    
    const handleOpenProjectUsersModal = async (project) => {
      try {
        const responseUsers = await axios.get(`http://localhost:9090/project/getProjectUsers`, {
          params: { projectNo: project.projectNo },
        });
  
        const responseInvited = await axios.get(`http://localhost:9090/project/getInvitedUsers`, {
          params: { projectNo: project.projectNo },
        });
  
        setSelectedProject({ ...project, users: responseUsers.data });
        setInvitedUser(responseInvited.data);
        setIsProjectUsersModalOpen(true);
      } catch (error) {
        console.error('프로젝트 정보 조회 실패:', error);
      }
    };

    const handleCloseProjectUsersModal = () => {
      setIsProjectUsersModalOpen(false);
      setSearchTerm('');
      setFilteredUsers([]);
      setInvitedUser([]);
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

    const handleSubmit = async () => {
      const projectNameLength = projectInfo.projectName.replace(/[^\uAC00-\uD7A3]/g, "").length;
      const projectDescLength = projectInfo.projectDesc.replace(/[^\uAC00-\uD7A3]/g, "").length;
  
      if (projectNameLength > 10) {
          alert("프로젝트 이름은 한글 10자까지 입력할 수 있습니다.");
          return;
      }
      if (projectDescLength > 30) {
          alert("프로젝트 설명은 한글 30자까지 입력할 수 있습니다.");
          return;
      }
        if (projectInfo.projectName === '') {
            alert("프로젝트 이름을 입력하세요.");
            return;
        }
        try {
            await axios.post('http://localhost:9090/project/createProject', projectInfo, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            fetchProjects(user?.user?.userNo);
    
            handleCloseModal();
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
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
          await axios.post('http://localhost:9090/project/inviteUser', {
            projectNo: selectedProject.projectNo,
            projectName: selectedProject.projectName,
            userNo: userNo,
            userEmail: userEmail,
          });
    
          alert("초대가 완료되었습니다.");
    
          const responseInvited = await axios.get(`http://localhost:9090/project/getInvitedUsers`, {
            params: { projectNo: selectedProject.projectNo },
          });
          setInvitedUser(responseInvited.data);
    
          setAllUsers((prevUsers) => prevUsers.filter((user) => user.userNo !== userNo));
          setFilteredUsers((prevFiltered) => prevFiltered.filter((user) => user.userNo !== userNo));
        } catch (error) {
          console.error("초대 실패:", error);
          alert("초대 실패");
        } finally {
          setInvitingUserId(null);
        }
      }
    };
    
  

    function displayTime(unixTimeStamp) {
        if (!unixTimeStamp) return '';
        const myDate = new window.Date(unixTimeStamp);
        if (isNaN(myDate)) return '';
        const y = myDate.getFullYear();
        const m = String(myDate.getMonth() + 1).padStart(2, '0');
        const d = String(myDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }

      const handleMoveToErd = async (projectNo) => {
        const response = await axios.get(`http://localhost:9090/project/checkErd`, {
            params: { projectNo },
        });
      
        const newErdNo = response.data.erdNo;
        navigate(`/erd/${newErdNo}`);
      };

      const handleMoveToCode = async (projectNo) => {
          const response = await axios.get(`http://localhost:9090/project/checkCode`, {
            params: { projectNo },
          });
          const codeNo = response.data.codeSyncNo;
          navigate(`/codeSync/${codeNo}`);
      };

      const handleMoveToDocs = async (projectNo) => {
          const response = await axios.get(`http://localhost:9090/project/checkDocs`, {
            params: { projectNo },
          });
          const wrapperNo = response.data.wrapperNo;
          navigate(`/docs/${wrapperNo}`);
      };

      const handleMoveToGantt = async (projectNo) => {
        navigate(`/gantt/${projectNo}`);
      }

      const handleMoveToSkills = async (projectNo) => {
        navigate(`/skills/${projectNo}`);
      }

    const deleteProject = async (projectNo) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("프로젝트 진짜 지울거에요?")) {
          try {
            const response = await axios.get(`http://localhost:9090/project/deleteProject`, {
              params: { projectNo },
            });
            if (response.data.success) {
              fetchProjects(user?.user?.userNo);
              alert("프로젝트가 성공적으로 삭제되었습니다.");
            } else {
              alert("프로젝트 삭제에 실패했습니다.");
            }
          } catch (error) {
            console.error("프로젝트 삭제 중 오류 발생:", error);
            alert("프로젝트 삭제 중 오류가 발생했습니다.");
          }
        } else {
          return;
        }
      };

      const removeUserFromProject = async (userNo) => {
        try {
          await axios.post('http://localhost:9090/project/removeUser', {
            projectNo: selectedProject.projectNo,
            userNo: userNo,
          });
          alert("참여 유저가 제거되었습니다.");
      
          const responseUsers = await axios.get(`http://localhost:9090/project/getProjectUsers`, {
            params: { projectNo: selectedProject.projectNo },
          });
          setSelectedProject((prev) => ({ ...prev, users: responseUsers.data }));

          const responseAllUsers = await axios.get(`http://localhost:9090/member/getAllUsers`);
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
          console.error("참여 유저 제거 실패:", error);
        }
      };
      
      const cancelInvitation = async (userNo) => {
        try {
          await axios.post('http://localhost:9090/project/cancelInvitation', {
            projectNo: selectedProject.projectNo,
            userNo: userNo,
          });
          alert("초대가 취소되었습니다.");
      
          const responseInvited = await axios.get(`http://localhost:9090/project/getInvitedUsers`, {
            params: { projectNo: selectedProject.projectNo },
          });
          setInvitedUser(responseInvited.data);

          const responseAllUsers = await axios.get(`http://localhost:9090/member/getAllUsers`);
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
          console.error("초대 취소 실패:", error);
        }
      };
      

    return (
        <>
    <Container>
      {projects.map((project) => (
        <ProjectDiv key={project.projectNo}>
          <Overlay className="overlay" />
          <Tooltip className="tooltip">
            <TooltipItem onClick={() => handleMoveToErd(project.projectNo)}>
                ERD 구성
            </TooltipItem>
            <TooltipItem onClick={() => handleMoveToCode(project.projectNo)}>
                CODE 구성
            </TooltipItem>
            <TooltipItem onClick={() => handleMoveToDocs(project.projectNo)}>
                문서 확인
            </TooltipItem>
            <TooltipItem onClick={() => handleMoveToGantt(project.projectNo)}>
                Gantt Chart
            </TooltipItem>
            <TooltipItem onClick={() => handleMoveToSkills(project.projectNo)}>
                기술 스택
            </TooltipItem>
            <span onClick={(e) => {
                e.stopPropagation();
                handleOpenProjectUsersModal(project);
            }}>프로젝트 인원 추가하기</span>
            <ProjectDelSpan onClick ={()=>deleteProject(project.projectNo)}>프로젝트 삭제하기</ProjectDelSpan>
          </Tooltip>
          <h2>{project.projectName}</h2>
          <h2>{displayTime(project.projectCreateDate)}</h2>
        </ProjectDiv>
      ))}
      {projects.length < 3 &&
        Array.from({ length: 3 - projects.length }).map((_, index) => (
            <BannerDiv key={index} onClick={handleOpenProjectModal}>
            + create project
            </BannerDiv>
        ))}
    </Container>
            {isModalOpen && (
                <ModalBackground onClick={handleCloseModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CreateProjectHead>Create Project</CreateProjectHead>
                        <StyledTable>
                            <tbody>
                                <tr>
                                    <ColumnTd>프로젝트 이름</ColumnTd>
                                    <InputTd>
                                        <InputField
                                            type="text"
                                            name="projectName"
                                            placeholder="프로젝트 이름을 입력하세요."
                                            value={projectInfo.projectName}
                                            onChange={handleChange}
                                        />
                                    </InputTd>
                                </tr>
                                <tr>
                                    <ColumnTd>프로젝트 공개여부</ColumnTd>
                                    <InputTd>
                                        <RadioGroup>
                                            <label>
                                                <input 
                                                    type="radio" 
                                                    name="projectDisclosure" 
                                                    value="public" 
                                                    onChange={handleChange}
                                                    defaultChecked
                                                    />Public
                                            </label>
                                            <label>
                                                <input 
                                                    type="radio" 
                                                    name="projectDisclosure" 
                                                    value="private"
                                                    onChange={handleChange}
                                                    />Private
                                            </label>
                                        </RadioGroup>
                                    </InputTd>
                                </tr>
                                <tr>
                                    <ColumnTd>프로젝트 설명</ColumnTd>
                                    <InputTd>
                                        <TextAreaField 
                                            name="projectDesc"
                                            placeholder="프로젝트 간략한 설명을 추가해주세요."
                                            value={projectInfo.projectDesc}
                                            onChange={handleChange}
                                            />
                                    </InputTd>
                                </tr>
                            </tbody>
                        </StyledTable>
                        <ModalButton onClick={handleSubmit}>만들기</ModalButton>
                        <ModalButton onClick={handleCloseModal}>닫기</ModalButton>
                    </ModalContent>
                </ModalBackground>
            )}
            {isProjectUsersModalOpen && (
              <ModalBackground onClick={handleCloseProjectUsersModal}>
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
                          navigator.clipboard.writeText("http://localhost:9090/project/"+selectedProject.token);
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
            <LoginModal
              isOpen={isLoginRequiredModalOpen}
              onClose={handleCloseLoginRequiredModal}
              onNavigateToLogin={handleNavigateToLogin}
            />
        </>
    );
};

export default Main;
