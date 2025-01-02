import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Content from './Content';

const WrapperDiv = styled.div`
    display : flex;
    padding-top : 60px;
`;

const Admin = () => {
    const [selectedTab, setSelectedTab] = useState('projectManagement');

    return (
        <WrapperDiv>
            <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            <Content selectedTab={selectedTab} />
        </WrapperDiv>
    );
};

export default Admin;