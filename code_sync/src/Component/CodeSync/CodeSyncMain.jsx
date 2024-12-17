import React, { useState } from 'react'; 
import SidebarLeft from './SidebarLeft'; 
import SidebarRight from './SidebarRight'; 
import MainContent from './MainContent'; 
import styled from 'styled-components';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;  // 화면 전체를 채움
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  padding-top: 60px;  // 헤더 높이만큼 여백 추가
  padding-bottom: 60px;  // 푸터 높이만큼 여백 추가
  overflow: auto;  // 콘텐츠가 넘칠 경우 스크롤
`;

const CodeSyncMain = ({data}) => {
  const [fileContent, setFileContent] = useState('');
  const [fileNo, setFileNo] = useState(null);

  const handleFileContentChange = ({ content, fileNo }) => {
    setFileContent(content);
    setFileNo(fileNo); // fileNo 별도로 관리
  };


  return (
    <MainContainer>
      <Header />
      <ContentWrapper>
        <SidebarLeft
          onFileContentChange={handleFileContentChange}
          data={data}
        />
        <MainContent fileContent={fileContent} fileNo={fileNo} data={data} />
        <SidebarRight />
      </ContentWrapper>
      <Footer />
    </MainContainer>
  );
};


export default CodeSyncMain;
