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
import ProjectLimit from '../Error/ProjectLimit';
import InvalidProject from '../Error/InvalidProject';
import Gantt from '../Gantt/Gantt';
import Skills from '../Skills/Skills';
import Admin from '../Admin/Admin';
import ProjectDetail from '../Admin/ProjectDetail';
import UserDetail from '../Admin/UserDetail';


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
    const savedState = localStorage.getItem("userState");
    const parsedState = savedState ? JSON.parse(savedState) : null;

    // 예외 처리: '/'는 인증 확인을 생략
    if (window.location.pathname === "/") {
      return;
    }

    if (!isAuthenticated && (!parsedState || !parsedState.isAuthenticated)) {
      navigate("/login");
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
        <Route path="/" element={<Main projects={projects} fetchProjects={fetchProjects} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/myPage" element={<MyPage projects={projects} fetchProjects={fetchProjects} setProjects={setProjects}/>} />
                <Route path="/expiredPage" element={<ExpiredPage />} />
                <Route path="/alreadyJoined" element={<AlreadyJoined />} />
                <Route path="/projectLimit" element={<ProjectLimit />} />
                <Route path="/invalidProject" element={<InvalidProject />} />
                <Route path="/erd/:erdNo" element={<ErdDisplay />} />
                <Route path="/codeSync/:codeSyncNo" element={<CodeSyncMain data={user}/>} />
                <Route path="/gantt/:projectNo" element={<Gantt />} />
                <Route path="/docs/:wrapperNo" element={<Docs />} />
                <Route path="/skills/:projectNo" element={<Skills projects={projects} user={user} />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/project/:id" element={<ProjectDetail />} />
                <Route path="/admin/user/:id" element={<UserDetail />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
      </Body>
      <Footer />
    </DisplayWrapper>
  );
};

export default Display;
