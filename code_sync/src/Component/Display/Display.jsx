import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../Layout/Header';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Main from '../Layout/Main';
import { useSelector } from 'react-redux';
import Login from '../Login/Login';
import Join from '../Login/Join';
import MyPage from '../MyPage/MyPage';
import Footer from '../Layout/Footer';
import ExpiredPage from '../Error/ExpiredPage';
import AlreadyJoined from '../Error/AlreadyJoined';
import Docs from '../Docs/Docs';
import CodeSyncMain from '../CodeSync/CodeSyncMain';
import ErdDisplay from './ErdDisplay';
import axios from 'axios';

const DisplayWrapper = styled.div`
  margin: auto;
`;

const Body = styled.div`
  width: 100%;
  min-height: 50vh;
`;

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

const Display = () => {
  const [projects, setProjects] = useState([]);
  const user = useSelector((state) => state.user);

  const fetchProjects = async (userNo) => {
    try {
      const response = await axios.get(`http://localhost:9090/project/getProjectList?userNo=${userNo}`);
      setProjects(response.data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (user?.user?.userNo) {
      fetchProjects(user.user.userNo);
    }
  }, [user]);

  return (
    <DisplayWrapper>
      <Header projects={projects} fetchProjects={fetchProjects} setProjects={setProjects} />
      <Body>
        <Routes>
          <Route path="/" element={<Main projects={projects} fetchProjects={fetchProjects}/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route
            path="/myPage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route path="/expiredPage" element={<ExpiredPage />} />
          <Route path="/alreadyJoined" element={<AlreadyJoined />} />
          <Route path="/erd/:erdNo" element={<ErdDisplay />} />
          <Route path="/codeSync/:codeNo" element={<CodeSyncMain />} />
          <Route path="/docs/:wrapperNo" element={<Docs />} />
        </Routes>
      </Body>
      <Footer />
    </DisplayWrapper>
  );
};

export default Display;
