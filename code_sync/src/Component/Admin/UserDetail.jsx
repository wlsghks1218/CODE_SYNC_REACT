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
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: right;
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
    width: 97%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const Input = styled.input`
    width: 95%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: ${({ readOnly }) => (readOnly ? '#f4f4f4' : 'white')};
    pointer-events: ${({ readOnly }) => (readOnly ? 'none' : 'auto')};
`;

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        userNo: '',
        userId: '',
        userPw: '-',
        userEmail: '',
        authAdmin: 1,
        userRegDate: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:9090/admin/user/${id}`);
                setUser({
                    ...response.data,
                    userPw: '-', // Display '-' for user password
                });
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:9090/admin/updateUser`, user);
            alert('유저 정보가 업데이트되었습니다.');
            navigate(-1);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:9090/admin/deleteUser/${id}`);
                alert('유저 정보가 삭제되었습니다.');
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
            <h2>유저 상세 정보</h2>
            <Table>
                <tbody>
                    <tr>
                        <th>유저 번호</th>
                        <td>
                            <Input
                                type="text"
                                name="userNo"
                                value={user.userNo}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>아이디</th>
                        <td>
                            <Input
                                type="text"
                                name="userId"
                                value={user.userId}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>비밀번호</th>
                        <td>
                            <Input
                                type="text"
                                name="userPw"
                                value={user.userPw}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>이메일</th>
                        <td>
                            <Input
                                type="email"
                                name="userEmail"
                                value={user.userEmail}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>관리자 권한</th>
                        <td>
                            <Select
                                name="authAdmin"
                                value={user.authAdmin}
                                onChange={handleChange}
                            >
                                <option value={1}>No</option>
                                <option value={2}>Yes</option>
                            </Select>
                        </td>
                    </tr>
                    <tr>
                        <th>등록일</th>
                        <td>
                            <Input
                                type="text"
                                name="userRegDate"
                                value={displayTime(user.userRegDate)}
                                readOnly
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
            <ButtonGroup>
                <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                <Button onClick={handleUpdate}>수정</Button>
                <Button $danger onClick={handleDelete}>
                    삭제
                </Button>
            </ButtonGroup>
        </Wrapper>
    );
};

export default UserDetail;
