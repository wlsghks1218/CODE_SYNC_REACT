import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body, #root {
    height: 100%;
    overflow: hidden; /* 전체 페이지 스크롤 방지 */
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
`;

const CodeMirrorWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .CodeMirror {
    height: 100%;
    font-size: 14px;
    overflow-x: hidden;
    white-space: pre-wrap;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const LockMessage = styled.div`
  color: white;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
`;

const LockIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const MainContent = ({ fileContent, fileNo, socket, message,onFileContentChange  }) => {
  const [code, setCode] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLockedByUser, setIsLockedByUser] = useState(1);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [messageStatus, setMessageStatus] = useState('');
  const user = useSelector((state) => state.user);
  const userNo = user.user.userNo;
  const { codeSyncNo } = useParams();

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // 에러 발생 시 아무 동작도 하지 않음
        return Promise.resolve(); // 에러를 무시하고 진행
      }
    );

    // 컴포넌트가 언마운트될 때 인터셉터 정리
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    if (!fileNo) return; // fileNo가 없으면 실행하지 않음

    const checkLockStatus = async () => {
      try {
        const response = await axios.post('http://116.121.53.142:9100/api/codeSync/checkLocked', {
          fileNo,
          userNo,
          codeSyncNo,
        });
        const { isLocked } = response.data;
        setIsReadOnly(!isLocked);
      } catch {
        // 에러 발생 시 아무 동작도 하지 않음 (에러를 처리하지 않음)
      }
    };

    checkLockStatus();
  }, [fileContent, message, fileNo]); // fileNo도 의존성 배열에 포함
  


  useEffect(() => {
    if (fileContent && fileContent !== code) {
      setCode(fileContent);
    }
  }, [fileContent]); // fileContent 변경 시마다 실행
  
  useEffect(() => {
    if (fileContent && fileNo) {
      localStorage.setItem(`${fileNo}_original`, fileContent);
      setCode(fileContent);
    }
  }, [fileNo]); // fileNo 또는 fileContent가 변경될 때마다 실행
  
  useEffect(() => {
    if (fileContent && fileNo) {
      Object.keys(localStorage).forEach((key) => {
        if (key !== 'userState') {
          localStorage.removeItem(key);
        }
      });

      localStorage.setItem(`${fileNo}_original`, fileContent);
      setCode(fileContent);
      setShowLineNumbers(true);
    }
  }, [fileNo, socket, userNo, messageStatus]);

  useEffect(() => {
    if (!fileNo) return; // fileNo가 없으면 실행하지 않음

    axios
      .post('http://116.121.53.142:9100/api/codeSync/checkWhoLocked', {
        fileNo,
        userNo,
        codeSyncNo,
      })
      .then((response) => {
        const { isLocked } = response.data;
        setIsReadOnly(!isLocked);

        try {
          const lockStatus = response.data.isLocked;

          if (lockStatus === 1 || lockStatus === 2) {
            setIsLockedByUser(lockStatus);
          } else if (lockStatus === 3) {
            setIsLockedByUser(3);
          }

          if (message?.status === 'checked') {
            setMessageStatus(message.status);
          }
        } catch (error) {
          // 오류 처리
        }
      })
      .catch(() => {
        // 아무것도 하지 않음
      });
  }, [socket, message, fileNo]); // fileNo도 의존성 배열에 포함
  
 
 
  const handleCodeChange = (newCode) => {
    setCode(newCode); // CodeMirror의 변경 사항을 state로 저장

    // 부모 컴포넌트에 변경된 코드 전달
    if (onFileContentChange) {
      onFileContentChange(newCode);
    }

    // 로컬 스토리지 업데이트
    if (fileNo) {
      localStorage.setItem(`${fileNo}_modified`, newCode);
    }
  };



  return (
    <>
      <GlobalStyle />
      <ContentWrapper>
        {isLockedByUser === 3 && (
          <Overlay>
            <div>
              <LockIcon>🔒</LockIcon>
              <LockMessage>
                작업을 진행 중입니다!
              </LockMessage>
            </div>
          </Overlay>
        )}
        <EditorWrapper>
          <CodeMirrorWrapper>
          <CodeMirror
  value={code} // `value`에 code 상태 바인딩
  options={{
    mode: 'javascript',
    lineNumbers: showLineNumbers,
    theme: 'default',
    lineWrapping: true,
    readOnly: isReadOnly,
    inputStyle: 'contenteditable',
  }}
  onBeforeChange={(editor, data, value) => handleCodeChange(value)}
  onChange={(editor, data, value) => {
    setCode(value); // 코드 변경 시 상태 업데이트
    
    if (fileNo) {
      localStorage.setItem(`${fileNo}_modified`, value); // localStorage에 저장
    }
  }}
/>
          </CodeMirrorWrapper>
        </EditorWrapper>
      </ContentWrapper>
    </>
  );
};

export default MainContent;
