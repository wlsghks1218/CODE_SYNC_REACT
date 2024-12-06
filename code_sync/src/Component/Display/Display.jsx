import React, { useEffect } from 'react';
import styled from 'styled-components';
import Header from '../Layout/Header';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Main from '../Layout/Main';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../Login/Login';
import Join from '../Login/Join';
import MyPage from '../MyPage/MyPage';
import Footer from '../Layout/Footer';
import ExpiredPage from '../Error/ExpiredPage';
import AlreadyJoined from '../Error/AlreadyJoined';
import Project from '../Project/Project';

const DisplayWrapper = styled.div`
    margin: auto;
`;

const Body = styled.div`
  width:100%;
  min-height : 50vh;
`;

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login'); // Redirect to login if not authenticated
        }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? children : null;
};

const Display = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    return (
        
        <DisplayWrapper>
            <Header/>
            <Body>
                <Routes>
                    <Route path='/' element={<Main data={user}/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/join' element={<Join/>}/>
                    <Route
                        path="/myPage"
                        element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path='/expiredPage' element={<ExpiredPage/>}/>
                    <Route path='/project/:projectNo' element={<Project/>}/>
                    <Route path='/alreadyJoined' element={<AlreadyJoined/>}/>
                </Routes>
            </Body>
            <Footer/>
        </DisplayWrapper>
    );
};

export default Display;