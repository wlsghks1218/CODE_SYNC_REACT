import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Wrapper = styled.div`
    padding: 20px;
    padding-top: 60px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;

    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    th {
        background-color: #f4f4f4;
        font-weight: bold;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: right;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: ${({ $danger }) => ($danger ? '#dc3545' : '#007bff')};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;

    &:hover {
        background-color: ${({ $danger }) => ($danger ? '#c82333' : '#0056b3')};
    }
`;

const Select = styled.select`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const TextArea = styled.textarea`
    padding: 8px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState({
        projectNo: '',
        muserNo: '',
        projectName: '',
        projectDesc: '',
        projectDisclosure: 'public',
        token: '',
        projectCreateDate: '',
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`http://localhost:9090/admin/project/${id}`);
                setProject(response.data);
            } catch (error) {
                console.error('Failed to fetch project:', error);
            }
        };
        fetchProject();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:9090/admin/updateProject`, project);
            alert('프로젝트 정보가 업데이트되었습니다.');
            navigate(-1);
        } catch (error) {
            console.error('Failed to update project:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:9090/admin/deleteProject/${id}`);
                alert('프로젝트가 삭제되었습니다.');
                navigate(-1);
            } catch (error) {
                console.error('Failed to delete project:', error);
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

    return (
        <Wrapper>
            <h2>프로젝트 상세 정보</h2>
            <Table>
                <tbody>
                    <tr>
                        <th>프로젝트 번호</th>
                        <td>
                            <input
                                type="text"
                                value={project.projectNo}
                                readOnly
                                style={{ border: 'none', backgroundColor: '#f9f9f9', width: '100%' }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>관리자 번호</th>
                        <td>
                            <input
                                type="text"
                                value={project.muserNo}
                                readOnly
                                style={{ border: 'none', backgroundColor: '#f9f9f9', width: '100%' }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>프로젝트 이름</th>
                        <td>
                            <input
                                type="text"
                                name="projectName"
                                value={project.projectName}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>공개 여부</th>
                        <td>
                            <Select
                                name="projectDisclosure"
                                value={project.projectDisclosure}
                                onChange={handleChange}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </Select>
                        </td>
                    </tr>
                    <tr>
                        <th>프로젝트 설명</th>
                        <td>
                            <TextArea
                                name="projectDesc"
                                value={project.projectDesc}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>토큰</th>
                        <td>
                            <input
                                type="text"
                                value={project.token == null ? '-' : project.token}
                                readOnly
                                style={{ border: 'none', backgroundColor: '#f9f9f9', width: '100%' }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>생성일</th>
                        <td>
                            <input
                                type="text"
                                value={displayTime(project.projectCreateDate)}
                                readOnly
                                style={{ border: 'none', backgroundColor: '#f9f9f9', width: '100%' }}
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
            <ButtonGroup>
                <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                <Button onClick={handleUpdate}>수정하기</Button>
                <Button $danger onClick={handleDelete}>
                    삭제
                </Button>
            </ButtonGroup>
        </Wrapper>
    );
};

export default ProjectDetail;
