import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Controlled as CodeMirror } from 'react-codemirror2'; // react-codemirror2 import
import 'codemirror/lib/codemirror.css'; // Codemirror 스타일
import 'codemirror/mode/javascript/javascript'; // JavaScript 구문 강조
const ContentWrapper = styled.div`
  flex: 1;
  padding: 0;
  margin-top: 0px;  // 헤더와의 간격을 좁힘 (값을 조정)
  display: flex;
  flex-direction: column;
`;

const EditorWrapper = styled.div`
  flex: 1;  // 상위 요소의 남은 공간을 차지하도록 설정
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-right: 0px;
  overflow: auto;  // 넘치면 스크롤이 생기도록 처리
  height: 100%;  // 부모 요소의 100%를 차지하도록 설정
`;

const CodeMirrorWrapper = styled.div`
  width: 100%;
  height: 100%;
  .CodeMirror {
    height: 100%;  // CodeMirror가 부모 영역을 가득 채우도록 설정
  }
`;

const MainContent = ({ fileContent }) => {
  const [code, setCode] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(false);  // 줄 번호 표시 여부 상태

  useEffect(() => {
    if (fileContent) {
      setCode(fileContent);
      setShowLineNumbers(true);  // 파일이 있으면 줄 번호 표시
    } else {
      setShowLineNumbers(false);  // 파일이 없으면 줄 번호 숨기기
    }
  }, [fileContent]);

  const handleCodeChange = (newCode) => {
    console.log(newCode);
    setCode(newCode);
  };

  const saveCode = () => {
    // 코드 저장 API 호출 예시
    axios.put('/api/save', { code })
      .then(response => console.log('Code saved'))
      .catch(error => console.error('Error saving code:', error));
  };

  return (
    <ContentWrapper>
      <EditorWrapper>
        {/* CodeMirror를 포함한 div */}
        <CodeMirrorWrapper>
          <CodeMirror
            value={code}
            options={{
              mode: 'javascript', // 자바스크립트 구문 강조
              lineNumbers: showLineNumbers,  // 줄 번호 표시 여부를 상태에 따라 설정
              theme: 'default',   // 테마 설정
              readOnly: false,    // 편집 가능 설정
              lineWrapping: true, // 코드 줄 바꿈
              viewportMargin: 10, // 스크롤을 허용하고 줄을 잘라서 렌더링
            }}
            onBeforeChange={(editor, data, value) => handleCodeChange(value)} // 코드 변경 시 처리
          />
        </CodeMirrorWrapper>
      </EditorWrapper>
    </ContentWrapper>
  );
};

export default MainContent;
