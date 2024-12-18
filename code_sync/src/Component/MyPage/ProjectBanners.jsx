import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

const BannerWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const ProjectBanner = styled.div`
  width: 250px;
  height: 100px;
  background-color: ${(props) =>
    props.$isSelected ? "#28a745" : props.create ? "#f8f9fa" : "#007bff"};
  color: ${(props) =>
    props.$isSelected ? "#ffffff" : props.create ? "#495057" : "#ffffff"};
  border: ${(props) =>
    props.create ? "2px dashed #6c757d" : props.$isSelected ? "none" : "none"};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? "#218838" : props.create ? "#e9ecef" : "#0056b3"};
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



const ProjectBanners = ({ projects, setSelectedProjectNo, fetchProjects }) => {
    const user = useSelector((state) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectNo, setSelectedProject] = useState(null);
    const [projectInfo, setProjectInfo] = useState({
        projectName : '',
        projectDisclosure : 'public',
        projectDesc : '',
        muserNo: ''
    });

    const handleOpenProjectModal = () => {

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
            console.log('프로젝트 생성 성공');
    
            fetchProjects(user?.user?.userNo);
    
            handleCloseModal();
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
        }
    };

    
  return (
    <>
    <h1>My Projects</h1>
    <BannerWrapper>
      {projects.map((project) => (
        <ProjectBanner
          key={project.projectNo}
          $isSelected={project.projectNo === selectedProjectNo}
          onClick={() => {setSelectedProjectNo(project.projectNo); setSelectedProject(project.projectNo);}}
        >
          <h3>{project.projectName}</h3>
        </ProjectBanner>
      ))}
      {projects.length < 3 &&
        Array.from({ length: 3 - projects.length }).map((_, index) => (
          <ProjectBanner key={`create-${index}`} onClick={handleOpenProjectModal}>
            + Create Project
          </ProjectBanner>
        ))}
    </BannerWrapper>
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
    </>
  );
};

export default ProjectBanners;
