import React from 'react';
import styled from 'styled-components';
import Header from '../Layout/Header';
import { Routes, Route } from 'react-router-dom';
import Main from '../Layout/Main';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../Login/Login';
import Join from '../Login/Join';
import MyPage from '../MyPage/MyPage';
import Footer from '../Layout/Footer';
import ExpiredPage from '../Error/ExpiredPage';
import AlreadyJoined from '../Error/AlreadyJoined';

const DisplayWrapper = styled.div`
    margin: auto;
`;

const Body = styled.div`
  width:100%;
  min-height : 50vh;
`;

const Display = () => {
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
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
                    <Route path='/myPage' element={<MyPage/>}/>
                    <Route path='/expiredPage' element={<ExpiredPage/>}/>
                    <Route path='/alreadyJoined' element={<AlreadyJoined/>}/>
                </Routes>
            </Body>
            <Footer/>
        </DisplayWrapper>
    );
};

export default Display;