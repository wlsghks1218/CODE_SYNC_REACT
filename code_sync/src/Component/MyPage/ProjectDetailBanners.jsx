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
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

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
const ProjectDetailBanners = ({ projectNo, fetchProjects, closeModal }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [editedProject, setEditedProject] = useState({});
  const [routes, setRoutes] = useState({
    erdNo: null,
    codeNo: null,
    docsNo: null,
  });

  useEffect(() => {
    console.log(projectNo);
    const fetchRoutes = async () => {
      try {
        const projectInfo = await axios.get("http://localhost:9090/project/getProjectByProjectNo", {
          params: { projectNo: projectNo }
        })

        console.log("projectNo로 받아온 프로젝트 정보 :" + JSON.stringify(projectInfo.data))
        setProject(projectInfo.data);
        setEditedProject(projectInfo.data);

        const responses = await Promise.all([
          axios.get("http://localhost:9090/project/checkErd", { params: { projectNo } }),
          axios.get("http://localhost:9090/project/checkCode", { params: { projectNo } }),
          axios.get("http://localhost:9090/project/checkDocs", { params: { projectNo } }),
        ]);
        setRoutes({
          erdNo: responses[0].data.erdNo,
          codeNo: responses[1].data.codeSyncNo,
          docsNo: responses[2].data.wrapperNo,
          gantt: projectNo,
          skills: projectNo
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
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
    { title: "portfolio", path: routes.portfolio ? `/gantt/${routes.portfolio}` : "#"},
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
        const response = await axios.get(`http://localhost:9090/project/deleteProject`, {
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
        console.error("프로젝트 삭제 중 오류 발생:", error);
        alert("프로젝트 삭제 중 오류가 발생했습니다.");
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
        "http://localhost:9090/project/updateProject",
        { ...editedProject }
      );
      if (response.data > 0) {
        alert("프로젝트가 성공적으로 수정되었습니다.");
        setIsEditing(false);
        setProject(editedProject); // 수정된 값 반영
      } else {
        alert("프로젝트 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로젝트 수정 중 오류 발생:", error);
      alert("프로젝트 수정 중 오류가 발생했습니다.");
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
                onClick={() => {
                  if (banner.path !== "#") navigate(banner.path);
                  else alert("해당 데이터가 존재하지 않습니다.");
                }}
              >
                {banner.title}
              </Banner>
            ))}
          </BannerWrapper>
          </Content>
        }
        </ModalContent>
      </ModalBackground>
    </>
  );
};

export default ProjectDetailBanners;
