import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const Content = styled.div`
  display: flex;

`;

const BannerWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const StyledTd1 = styled.td`
  text-align: left;
  margin-right: 10px;
`;

const StyledTd2 = styled.td`
  text-align: left;
  margin-right: 10px;
  font-weight:bold;
`;

const ProjectInfoWrapper = styled.div`

`;

const Banner = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    background-color: #0056b3;
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
  width: 800px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ProjectDelTd = styled.td`
  text-align: center; /* 텍스트를 가운데 정렬 */
  padding: 10px 0;
`;
const ProjectUpdateButton = styled.button`
  padding: 10px 15px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;

  &:hover {
    background-color: #c82333;
  }
`;

const ProjectDeleteButton = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;

  &:hover {
    background-color: #c82333;
  }
`;

const Input = styled.input`
  padding: 5px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  background-color: ${({ $color }) => $color || "#007bff"};

  &:hover {
    background-color: ${({ $hoverColor }) => $hoverColor || "#0056b3"};
  }
`;

const ProjectDetailBanners = ({ projectNo, fetchProjects, closeModal }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [editedProject, setEditedProject] = useState({});
  const [temporaryLink, setTemporaryLink] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [routes, setRoutes] = useState({
    erdNo: null,
    codeNo: null,
    docsNo: null,
  });

  const handleSavePortfolioLink = async () => {
    try {
      await axios.post("http://116.121.53.142:9100/project/updatePortfolio", {
        projectNo,
        temporaryLink,
      });
      
      const updatedProject = await axios.get("http://116.121.53.142:9100/project/getProjectByProjectNo", {
        params: { projectNo },
      });
      setProject(updatedProject.data);
      setPortfolioLink(temporaryLink);
      setShowPortfolioModal(false);
      setIsEditingPortfolio(false); 
      alert("포트폴리오 링크가 성공적으로 저장되었습니다.");
      setShowPortfolioModal(true);
    } catch (error) {
    }
  };

  const handleClosePortfolioModal = () => {
    setShowPortfolioModal(false);
    setTemporaryLink("");
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const projectInfo = await axios.get("http://116.121.53.142:9100/project/getProjectByProjectNo", {
          params: { projectNo: projectNo }
        })

        setProject(projectInfo.data);
        setEditedProject(projectInfo.data);
        setPortfolioLink(projectInfo.data.portfolioLink || "");

        const responses = await Promise.all([
          axios.get("http://116.121.53.142:9100/project/checkErd", { params: { projectNo } }),
          axios.get("http://116.121.53.142:9100/project/checkCode", { params: { projectNo } }),
          axios.get("http://116.121.53.142:9100/project/checkDocs", { params: { projectNo } }),
        ]);
        setRoutes({
          erdNo: responses[0].data.erdNo,
          codeNo: responses[1].data.codeSyncNo,
          docsNo: responses[2].data.wrapperNo,
          gantt: projectNo,
          skills: projectNo
        });
      } catch (error) {
      } 
    };
    fetchRoutes();
  }, [projectNo]);

  const banners = [
    { title: "ERD", path: routes.erdNo ? `/erd/${routes.erdNo}` : "#" },
    { title: "Code Sync", path: routes.codeNo ? `/codeSync/${routes.codeNo}` : "#" },
    { title: "Docs", path: routes.docsNo ? `/docs/${routes.docsNo}` : "#" },
    { title: "Gantt", path: routes.gantt ? `/gantt/${routes.gantt}` : "#"},
    { title: "Skills", path: routes.skills ? `/skills/${routes.skills}` : "#"},
    { title: "Portfolio", onClick: () => setShowPortfolioModal(true) },
  ];

  function displayTime(unixTimeStamp) {
    if (!unixTimeStamp) return '';
    const myDate = new window.Date(unixTimeStamp);
    if (isNaN(myDate)) return '';
    const y = myDate.getFullYear();
    const m = String(myDate.getMonth() + 1).padStart(2, '0');
    const d = String(myDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  const handleDeleteProject = async (projectNo) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("프로젝트 진짜 지울거에요?")) {
      try {
        const response = await axios.get(`http://116.121.53.142:9100/project/deleteProject`, {
          params: { projectNo },
        });
        if (response.data.success) {
          alert("프로젝트가 성공적으로 삭제되었습니다.");
          fetchProjects(user.user.userNo);
          closeModal();
        } else {
          alert("프로젝트 삭제에 실패했습니다.");
        }
      } catch (error) {
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({
      ...prev,
      [name]: value, // 필드명과 값을 업데이트
    }));
  };

  const handleUpdateProject = async () => {
    try {
      const response = await axios.post(
        "http://116.121.53.142:9100/project/updateProject",
        { ...editedProject }
      );
      if (response.data > 0) {
        alert("프로젝트가 성공적으로 수정되었습니다.");
        setIsEditing(false);
        setProject(editedProject); // 수정된 값 반영
      } else {
      }
    } catch (error) {
    }
  };
  
  const handleLeaveProject = async () => {
    // 확인 메시지 출력
    const confirmLeave = window.confirm("정말로 이 프로젝트를 나가시겠습니까?");
    if (!confirmLeave) return;
  
    try {
      // 서버에 사용자 탈퇴 요청
      const response = await axios.post("http://116.121.53.142:9100/project/leaveProject", {
        projectNo,
        userNo: user.user.userNo, // Redux에서 가져온 user 정보를 사용
      });
  
      if (response.data > 0) {
        alert("프로젝트에서 성공적으로 나갔습니다.");
        fetchProjects(user.user.userNo); // 프로젝트 목록 갱신
        closeModal(); // 모달 닫기
      } else {
        alert("프로젝트 나가기에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
    }
  };
  


  return (
    <>
    <ModalBackground onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {project &&
          <Content>
            <ProjectInfoWrapper>
              <h2>프로젝트 정보</h2>
              <table>
                <thead></thead>
                <tbody>
                  <tr>
                    <StyledTd1>프로젝트 이름</StyledTd1>
                    <StyledTd2>
                      {isEditing ? (
                        <Input
                          name="projectName"
                          value={editedProject.projectName || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        project.projectName
                      )}
                    </StyledTd2>
                  </tr>
                  <tr>
                    <StyledTd1>프로젝트 공개 여부</StyledTd1>
                    <StyledTd2>
                      {isEditing ? (
                        <>
                          <label>
                            <input
                              type="radio"
                              name="projectDisclosure"
                              value="public"
                              checked={editedProject.projectDisclosure === "public"}
                              onChange={handleInputChange}
                            />
                            Public
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="projectDisclosure"
                              value="private"
                              checked={editedProject.projectDisclosure === "private"}
                              onChange={handleInputChange}
                            />
                            Private
                          </label>
                        </>
                      ) : (
                        project.projectDisclosure === "public" ? "Public" : "Private"
                      )}
                    </StyledTd2>
                  </tr>
                  <tr>
                    <StyledTd1>프로젝트 설명</StyledTd1>
                    <StyledTd2>
                      {isEditing ? (
                        <Input
                          name="projectDesc"
                          value={editedProject.projectDesc || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        project.projectDesc
                      )}
                    </StyledTd2>
                  </tr>
                  <tr>
                    <StyledTd1>프로젝트 생성일</StyledTd1>
                    <StyledTd2> {displayTime(project.projectCreateDate)}</StyledTd2>
                  </tr>
                  <tr>
                    <ProjectDelTd colSpan="2">
                        <ProjectUpdateButton onClick={handleLeaveProject}>프로젝트 나가기</ProjectUpdateButton>
                    {isEditing ? (
                        <ProjectUpdateButton onClick={handleUpdateProject}>
                          수정 완료
                        </ProjectUpdateButton>
                      ) : (
                        <ProjectUpdateButton onClick={() => setIsEditing(true)}>
                          프로젝트 수정
                        </ProjectUpdateButton>
                      )}
                      <ProjectDeleteButton onClick={ () => handleDeleteProject(project.projectNo)}>프로젝트 삭제</ProjectDeleteButton>
                    </ProjectDelTd>
                  </tr>
                </tbody>
              </table>
            </ProjectInfoWrapper>
          <BannerWrapper>
          {banners.map((banner, index) => (
                  <Banner
                    key={index}
                    onClick={() =>
                      banner.path
                        ? navigate(banner.path)
                        : banner.onClick && banner.onClick()
                    }
                  >
                    {banner.title}
                  </Banner>
                ))}
          </BannerWrapper>
          </Content>
        }
        
        </ModalContent>
      </ModalBackground>
      {showPortfolioModal && (
        <ModalBackground onClick={handleClosePortfolioModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {portfolioLink && portfolioLink.startsWith("http") && !isEditingPortfolio ? (
              <>
                <p>현재 포트폴리오 링크:</p>
                <p>{portfolioLink}</p>
                <Button
                  $color="#28a745"
                  $hoverColor="#218838"
                  onClick={() => window.open(portfolioLink, "_blank")}
                >
                  이동
                </Button>
                <Button
                  $color="#ffc107"
                  $hoverColor="#e0a800"
                  onClick={() => {
                    setTemporaryLink(portfolioLink); // 기존 링크를 임시 상태로 설정
                    setIsEditingPortfolio(true);
                  }}
                >
                  수정
                </Button>
              </>
            ) : (
              <>
                <p>포트폴리오 링크를 {portfolioLink ? "수정" : "입력"}하세요:</p>
                <Input
                  value={temporaryLink}
                  onChange={(e) => setTemporaryLink(e.target.value)} // 임시 상태 업데이트
                  placeholder="http://example.com"
                />
                <div>
                  <Button
                    $color="#007bff"
                    $hoverColor="#0056b3"
                    onClick={() => {
                      if (!temporaryLink.trim() || !temporaryLink.startsWith("http")) {
                        alert("유효한 URL을 입력하세요.");
                        return;
                      }
                      setPortfolioLink(temporaryLink); // 입력값을 최종 상태로 저장
                      handleSavePortfolioLink();
                      setIsEditingPortfolio(false); // 수정 모드 종료
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    $color="#6c757d"
                    $hoverColor="#5a6268"
                    onClick={() => {
                      setTemporaryLink(portfolioLink); // 기존 상태 복원
                      setIsEditingPortfolio(false); // 수정 모드 종료
                      setShowPortfolioModal(false);
                    }}
                  >
                    취소
                  </Button>
                </div>
              </>
            )}
          </ModalContent>
        </ModalBackground>
      )}
    </>
  );
};

export default ProjectDetailBanners;