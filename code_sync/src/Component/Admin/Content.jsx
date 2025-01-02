import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ContentWrapper = styled.div`
    flex: 1;
    padding: 20px;
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
    }

    tr:hover {
        background-color: #f9f9f9;
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const PageButton = styled.button`
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid #ddd;
    background-color: ${({ $isActive }) => ($isActive ? '#007bff' : '#fff')};
    color: ${({ $isActive }) => ($isActive ? '#fff' : '#000')};
    cursor: pointer;

    &:hover {
        background-color: #007bff;
        color: #fff;
    }
`;

const Content = ({ selectedTab }) => {
    const [list, setList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchList = async () => {
            try {
                const endpoint =
                    selectedTab === 'projectManagement'
                        ? 'http://localhost:9090/admin/getProjectList'
                        : 'http://localhost:9090/admin/getUserList';
                const response = await axios.get(endpoint);
                setList(response.data);
            } catch (error) {
                console.error('Failed to fetch list:', error);
            }
        };

        fetchList();
    }, [selectedTab]);

    const handleItemClick = (id) => {
        const detailPath =
            selectedTab === 'projectManagement'
                ? `/admin/project/${id}`
                : `/admin/user/${id}`;
        navigate(detailPath);
    };

    const totalPages = Math.ceil(list.length / itemsPerPage);
    const currentItems = list.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
        <ContentWrapper>
            <h2>{selectedTab === 'projectManagement' ? '프로젝트 리스트' : '유저 리스트'}</h2>
            <Table>
                <thead>
                    <tr>
                        {selectedTab === 'projectManagement' ? (
                            <>
                                <th>프로젝트 번호</th>
                                <th>프로젝트 이름</th>
                                <th>공개 여부</th>
                                <th>생성일</th>
                            </>
                        ) : (
                            <>
                                <th>유저 번호</th>
                                <th>아이디</th>
                                <th>이메일</th>
                                <th>등록일</th>
                                <th>관리자 권한</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr
                            key={
                                selectedTab === 'projectManagement'
                                    ? `project-${item.projectNo || Math.random()}`
                                    : `user-${item.userNo || Math.random()}`
                            }
                            onClick={() =>
                                handleItemClick(
                                    selectedTab === 'projectManagement'
                                        ? item.projectNo
                                        : item.userNo
                                )
                            }
                        >
                            {selectedTab === 'projectManagement' ? (
                                <>
                                    <td>{item.projectNo}</td>
                                    <td>{item.projectName}</td>
                                    <td>{item.projectDisclosure}</td>
                                    <td>{displayTime(item.projectCreateDate)}</td>
                                </>
                            ) : (
                                <>
                                    <td>{item.userNo}</td>
                                    <td>{item.userId}</td>
                                    <td>{item.userEmail}</td>
                                    <td>{displayTime(item.userRegDate)}</td>
                                    <td>{item.authAdmin == 2? 'Yes' : 'No'}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {Array.from({ length: totalPages }, (_, index) => (
                    <PageButton
                        key={index + 1}
                        $isActive={currentPage === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </PageButton>
                ))}
            </Pagination>
        </ContentWrapper>
    );
};

export default Content;
