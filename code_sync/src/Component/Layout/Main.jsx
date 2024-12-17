import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const UserList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
`;

const UserListItem = styled.li`
  margin: 5px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
    const [isProjectUsersModalOpen, setIsProjectUsersModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
    
            console.log("로그인된 유저 데이터: " + JSON.stringify(user, null, 2));
    
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
            console.log("로그아웃 상태: 프로젝트 목록 초기화");
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectInfo({
            ...projectInfo,
            [name]: value,
        });
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
            const response = await axios.get(`http://localhost:9090/project/getProjectUsers?projectNo=${project.projectNo}`);
            setSelectedProject({ ...project, users: response.data });
            setIsProjectUsersModalOpen(true);
        } catch (error) {
            console.error('프로젝트 참여 인원 조회 실패:', error);
        }
    };

    const handleCloseProjectUsersModal = () => {
        setIsProjectUsersModalOpen(false);
        setSearchTerm('');
        setFilteredUsers([]);
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term) {
            const filtered = allUsers.filter(user => user.userId.includes(term));
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    };

    const handleSubmit = async () => {
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
            console.log('프로젝트 생성 성공');
    
            fetchProjects(user?.user?.userNo);
    
            handleCloseModal();
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
        }
    };

    const handleInvite = async (userNo, userEmail) => {
        if (selectedProject) {
            console.log(selectedProject.projectNo, selectedProject.projectName, userNo, userEmail);
            setInvitingUserId(userNo);
            try {
                const response = await axios.post('http://localhost:9090/project/inviteUser', {
                    projectNo: selectedProject.projectNo,
                    projectName: selectedProject.projectName,
                    userNo: userNo,
                    userEmail: userEmail
                });
                if(response.data === "Invitation sent successfully."){
                    alert("Project Invitation Sent");
                }
                console.log('초대 성공:', userEmail);
            } catch (error) {
                console.error('초대 실패:', error);
            } finally {
                setFilteredUsers(prevUsers => prevUsers.map(user =>
                    user.userNo === userNo ? { ...user, invited: true } : user
                ));
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
            <span>{project.projectDisclosure}</span>
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
                        <h2>프로젝트 참여 인원</h2>
                        <span>{selectedProject?.projectName}</span>
                        <UserList>
                            참여 유저 : 
                            {selectedProject?.users?.map(user => (
                                <UserListItem key={user.userNo}>{user.userId}</UserListItem>
                            ))}
                        </UserList>
                        <InputField
                            type="text"
                            placeholder="유저 ID를 검색하세요."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <UserList>
                            {filteredUsers.map(user => (
                                <UserListItem key={user.userNo}>
                                    {user.userId}
                                    {invitingUserId === user.userNo ? (
                                        <Spinner />
                                    ) : user.invited ? (
                                        <InviteButton disabled>초대 완료</InviteButton>
                                    ) : (
                                        <InviteButton onClick={() => handleInvite(user.userNo, user.userEmail)} disabled={invitingUserId !== null}>초대</InviteButton>
                                    )}
                                </UserListItem>
                            ))}
                        </UserList>
                        <ModalButton onClick={handleCloseProjectUsersModal}>닫기</ModalButton>
                    </ModalContent>
                </ModalBackground>
            )}
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
        </>
    );
};

export default Main;
