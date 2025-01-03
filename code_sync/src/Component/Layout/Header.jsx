import React, { useEffect, useState } from 'react';
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


const Header = ({ projects, fetchProjects, setProjects }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [projectInfo, setProjectInfo] = useState({
    projectName : '',
    projectDisclosure : 'public',
    projectDesc : '',
    muserNo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "projectName" && value.replace(/[^\uAC00-\uD7A3]/g, "").length > 10) {
      alert("프로젝트 이름은 한글 10자까지 입력할 수 있습니다.");
      return;
    }
    if (name === "projectDesc" && value.replace(/[^\uAC00-\uD7A3]/g, "").length > 30) {
      alert("프로젝트 설명은 한글 30자까지 입력할 수 있습니다.");
      return;
    }

    setProjectInfo({
        ...projectInfo,
        [name]: value,
    });
  };
  useEffect(() => {
  }, [projects]);
  
  const handleLogout = async () => {
    if (user) {
      try {
        // 로그아웃 요청
        await axios.post(
          "http://localhost:9090/member/logout",
          { userId: user.user?.userId },
          {
            withCredentials: true, // 쿠키 포함
            headers: { "Content-Type": "application/json" },
          }
        );
  
        dispatch(logout());
        
        setProjects([]);
        localStorage.removeItem("userState");
  
  
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else {
      console.warn("No user found for logout");
    }
  };
  

const handleCreateProject = async () => {
    if (!isAuthenticated) {
        setIsLoginRequiredModalOpen(true);
        return;
    }

    try {
        const response = await axios.get(`http://localhost:9090/project/getProjectList?userNo=${user.user.userNo}`);

        if (response.data.length >= 3) {
            alert("프로젝트는 최대 3개까지 생성할 수 있습니다.");
            return;
        }

        setProjectInfo({
            projectName: '',
            projectDisclosure: 'public',
            projectDesc: '',
            muserNo: user.user?.userNo || ''
        });
        setIsModalOpen(true);
    } catch (error) {
        console.error("프로젝트 목록 확인 중 오류 발생:", error);
    }
};
  const handleCloseLoginRequiredModal = () => {
    setIsLoginRequiredModalOpen(false);
};

const handleNavigateToLogin = () => {
    setIsLoginRequiredModalOpen(false);
    navigate('/login');
};

const handleCloseModal = () => {
  setIsModalOpen(false);
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
    return (
      <StyledHeader>
        <StyledLogo><Link to ='/'>CODE SYNC</Link></StyledLogo>
        <ButtonContainer>
          {
            user.user === null
            ? <StyledButton><Link to='/login'>LOGIN</Link></StyledButton>
            : <StyledButton onClick={handleLogout}>LOGOUT</StyledButton>
          }
          {(!isAuthenticated) ?
            <StyledButton><Link to='/join'>SIGN IN</Link></StyledButton> :
            <StyledButton><Link to='/myPage'>MY PAGE</Link></StyledButton>}
          <StyledButton onClick={handleCreateProject}>CREATE PROJECT</StyledButton>
          {user.user?.authAdmin === 2 && (
          <StyledButton><Link to='/admin'>MOVE TO ADMIN</Link></StyledButton>
        )}
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
      </StyledHeader>
    );
  };
export default Header;