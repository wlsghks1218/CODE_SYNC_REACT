import React from 'react';
import styled from 'styled-components';

const SidebarWrapper = styled.div`
    width: 200px;
    background-color: #f4f4f4;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
`;

const TabButton = styled.button`
    margin-bottom: 10px;
    padding: 10px 15px;
    background-color: ${({ $isActive }) => ($isActive ? '#007bff' : '#ffffff')};
    color: ${({ $isActive }) => ($isActive ? '#ffffff' : '#000000')};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;

    &:hover {
        background-color: ${({ $isActive }) => ($isActive ? '#0056b3' : '#f0f0f0')};
    }
`;

const Sidebar = ({ selectedTab, setSelectedTab }) => {
    return (
        <SidebarWrapper>
            <TabButton
                $isActive={selectedTab === 'projectManagement'}
                onClick={() => setSelectedTab('projectManagement')}
            >
                프로젝트 관리
            </TabButton>
            <TabButton
                $isActive={selectedTab === 'userManagement'}
                onClick={() => setSelectedTab('userManagement')}
            >
                유저 관리
            </TabButton>
        </SidebarWrapper>
    );
};

export default Sidebar;