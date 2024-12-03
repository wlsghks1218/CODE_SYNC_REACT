import React from 'react';
import styled from 'styled-components';
import Header from '../Layout/Header';
import { Routes, Route } from 'react-router-dom';
import Main from '../Layout/Main';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../Login/Login';
import Join from '../Login/Join';
import MyPage from '../MyPage/MyPage';

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
                </Routes>
            </Body>
        </DisplayWrapper>
    );
};

export default Display;