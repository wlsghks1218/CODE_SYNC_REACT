import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import { login } from "../../Action/userAction";
import { Link, useNavigate } from "react-router-dom";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  background-color: #fff;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const IsValidate = styled.span`
  color : red;
  font-weight : bold;
`;

const Input = styled.input`
  height: 40px;
  margin-bottom: 5px;
  padding: 0 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between; /* 버튼을 양 끝으로 정렬 */
  gap: 10px; /* 버튼 간 간격 추가 */
  margin-top: 15px;
`;

const Button = styled.button`
  flex: 1;
  width: 150px;
  height: 40px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  a{
    text-decoration: none;
    color: white;
  }
  &:hover {
    background-color: #0056b3;
  }
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
`;

const LinkSpan = styled.span`
  color: #007bff;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  width: 90%;
  max-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  transform: scale(0.9);
  animation: scaleUp 0.3s ease forwards;

  @keyframes scaleUp {
    from {
      transform: scale(0.9);
    }
    to {
      transform: scale(1);
    }
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: red;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 15px;
  text-align: center;
  color: #333;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;
const spin = keyframes`
0% {
  transform: rotate(0deg);
}
100% {
  transform: rotate(360deg);
}
`;


const ModalButton = styled(Button)`
  width: 100%;
  background-color: #007bff;
  &:hover {
    background-color: #0056b3;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    height: 35px;
  }

  span {
    display: flex;
    justify-content: center; /* 중앙 정렬 */
    align-items: center; /* 수직 중앙 정렬 */

    .spinner {
      border: 2px solid lightgray;
      border-top: 2px solid green;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      animation: ${spin} 1s linear infinite;
      margin-right: 5px;
    }

    .text {
      font-size: 16px;
    }
  }

  &:disabled {
    background-color: #ccc; /* 비활성화 시 배경색 */
    cursor: not-allowed; /* 마우스 금지 표시 */
    color: #999; /* 텍스트 색상 변경 */
    &:hover {
      background-color: #ccc; /* 비활성화 상태에서는 hover 효과 제거 */
    }
  }
`;


const ModalInput = styled(Input)`
  width: 75%;
`;
const ModalInput1 = styled(Input)`
  width: 55%;
  margin-right: 5px;
`;

const SpanLabel = styled.span`
  width: 80px;
  padding-bottom: 5px;
  text-align: center;
  flex-shrink: 0;
`;

const ResultList = styled.ul`
  text-align: center;
  list-style-type: none;
  padding: 0;
  margin: 20px 0; /* 메시지와 버튼 간 간격 */
`;

const ResultListItem = styled.li`
  margin: 8px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultMessage = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #444;
  margin: 20px 0;
  line-height: 1.5;
  word-break: keep-all;
`;


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdFindModalOpen, setIsIdFindModalOpen] = useState(false);
  const [isPwFindModalOpen, setIsPwFindModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [findUserId, setFindUserId] = useState("");
  const [serverCode, setServerCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [emailForFind, setEmailForFind] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleIdFindModalOpen = () => {
    setIsModalOpen(false);
    setIsIdFindModalOpen(true);
  };
  const closeIdFindModal = () => {
    setIsIdFindModalOpen(false);
    setEmailForFind("");
    setIsVerified(false);
    setIsVerificationSent(false);
    setIsSendingVerification(false);
    setInputCode("");
  }

  const handlePwFindModalOpen = () => {
    setIsModalOpen(false);
    setIsPwFindModalOpen(true);
  };
  const closePwFindModal = () => {
    setIsPwFindModalOpen(false);
    setFindUserId("");
    setEmailForFind("");
    setIsVerified(false);
    setIsVerificationSent(false);
    setIsSendingVerification(false);
    setInputCode("");
  }

  const openErrorModal = () => setIsErrorModalOpen(true);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const openPasswordChangeModal = () => {
    setIsPwFindModalOpen(false);
    setIsPasswordChangeModalOpen(true);
  };
  const closePasswordChangeModal = () => {
    setIsPasswordChangeModalOpen(false);
    setNewPassword("");
  }

  const openResultModal = (message) => {
    setModalMessage(message);
    setIsResultModalOpen(true);
  };
  const closeResultModal = () => setIsResultModalOpen(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:9090/member/login",
        {
          userId: userId,
          userPw: userPw,
          "remember-me": rememberMe,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          maxRedirects: 0,
        }
      );
      if (!response || !response.data) {
        setIsValid(false);
        return;
      }
      
      if (response.status === 200) {
        const user = response.data.principal;
        dispatch(login(user.user));
        navigate("/");
      } else {
        setIsValid(false);
      }
    } catch (error) {
      if (error.response.status === 400) {
        setIsValid(false);
      }
    }
  };
  
  const findId = async () => {
    if (!emailForFind) {
        openResultModal("이메일을 입력해주세요.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:9090/member/findId", {
            email: emailForFind,
        });

        if (response.status === 200 && response.data.length > 0) {
            const ids = response.data.map(user => user.userId).join(" / ");
            openResultModal(`아이디 찾기 성공: ${ids}`);
        } else {
            openResultModal("일치하는 이메일 정보가 없습니다.");
        }
    } catch (error) {
        openResultModal("아이디 찾기 중 오류가 발생했습니다.");
    }
    closeIdFindModal();
};

  const findPassword = async () => {
    if (!findUserId || !emailForFind) {
        openResultModal("아이디와 이메일을 모두 입력해주세요.");
        return;
    }

    try {
        const response = await axios.post(
            "http://localhost:9090/member/chkEmailExistForPassword",
            { userId: findUserId, email: emailForFind }
        );

        if (response.data > 0) {
            openPasswordChangeModal();
        } else {
            openResultModal("아이디 또는 이메일 정보가 일치하지 않습니다.");
        }
    } catch (error) {
        openResultModal("비밀번호 찾기 중 오류가 발생했습니다.");
    }
    closePwFindModal();
  };

  const changePassword = async () => {
    try {
      const response = await axios.post("http://localhost:9090/member/changePassword", {
        userId : findUserId,
        email: emailForFind,
        newPassword: newPassword,
      });
      if (response.status === 200) {
        openResultModal("비밀번호 변경 성공! 다시 로그인하세요.");
      } else {
        openErrorModal();
      }
    } catch (error) {
      openErrorModal();
    }
    closePasswordChangeModal();
  };

  const sendVerification = async () => {
    const userEmail = emailForFind;
    console.log(userEmail);
  
    if (!userEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }
    const chkEmailExist = await axios.post('http://localhost:9090/member/chkEmailExist', null, {
      params: { userEmail }
    });
    if (chkEmailExist.data === 0) {
      openErrorModal();
      return;
    }
    setIsSendingVerification(true);
    try {
      const response = await axios.post('http://localhost:9090/member/sendVerification', { userEmail });
      if (response.status === 200) {
        const { verificationCode } = response.data;
        setServerCode(verificationCode);
        console.log(verificationCode);
        alert('인증 코드가 이메일로 전송되었습니다.');
        setIsVerificationSent(true);
      }
    } catch (error) {
      alert('인증 코드 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const verifyCode = () => {
    if (inputCode === serverCode) {
      alert("인증이 완료되었습니다.");
      setIsVerified(true); // 인증 완료 상태 설정
    } else {
      alert("인증 코드가 올바르지 않습니다.");
    }
  };

  return (
    <Container>
      <Title>로그인</Title>
      <StyledForm onSubmit={handleLogin}>
        <Input
          type="text"
          name="username"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="아이디"
        />
        <Input
          type="password"
          name="password"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
          placeholder="비밀번호"
        />
        <LabelContainer>
          <input
            type="checkbox"
            name="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          로그인 기억하기
          <LinkSpan onClick={openModal}>아이디/비밀번호 찾기</LinkSpan>
        </LabelContainer>
        <ButtonContainer>
          <Button type="submit">로그인</Button>
          <Button type="button"><Link to ='/join'>회원가입</Link></Button>
        </ButtonContainer>
      </StyledForm>
      {!isValid && <IsValidate>유저 정보가 올바르지 않습니다.</IsValidate> }
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeModal}>&times;</ModalCloseButton>
            <ModalTitle>아이디/비밀번호 찾기</ModalTitle>
            <ButtonContainer>
              <Button onClick={handleIdFindModalOpen}>아이디 찾기</Button>
              <Button onClick={handlePwFindModalOpen}>비밀번호 찾기</Button>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}

      {isIdFindModalOpen && (
        <ModalOverlay onClick={closeIdFindModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeIdFindModal}>&times;</ModalCloseButton>
            <ModalTitle>아이디 찾기</ModalTitle>
            <LabelContainer>
              <SpanLabel>이메일</SpanLabel>
              <ModalInput
                type="email"
                value={emailForFind}
                onChange={(e) => setEmailForFind(e.target.value)}
              />
            </LabelContainer>
            {isVerificationSent && !isVerified && (
              <LabelContainer>
                <SpanLabel>인증 코드</SpanLabel>
                <ModalInput1
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="인증 코드를 입력하세요"
                />
                <ModalButton onClick={verifyCode}>확인</ModalButton>
              </LabelContainer>
            )}
            <ModalButton
              onClick={isVerified ? findId : sendVerification}
              disabled={isSendingVerification}
            >
              {isVerified ? "아이디 찾기" : isSendingVerification ? (
            <span>
              <span className="spinner" />
              <span className="text">전송 중...</span>
            </span>
          ) : (
            "인증코드 전송"
          )}
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}


      {isPwFindModalOpen && (
        <ModalOverlay onClick={closePwFindModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closePwFindModal}>&times;</ModalCloseButton>
            <ModalTitle>비밀번호 찾기</ModalTitle>
            <LabelContainer>
              <SpanLabel>아이디</SpanLabel>
              <ModalInput
                type="text"
                value={findUserId}
                onChange={(e) => setFindUserId(e.target.value)}
              />
            </LabelContainer>
            <LabelContainer>
              <SpanLabel>이메일</SpanLabel>
              <ModalInput
                type="email"
                value={emailForFind}
                onChange={(e) => setEmailForFind(e.target.value)}
              />
            </LabelContainer>
            {isVerificationSent && !isVerified && (
              <LabelContainer>
                <SpanLabel>인증 코드</SpanLabel>
                <ModalInput1
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="인증 코드를 입력하세요"
                />
                <ModalButton onClick={verifyCode}>확인</ModalButton>
              </LabelContainer>
            )}
            <ModalButton
              onClick={isVerified ? findPassword : sendVerification}
              disabled={isSendingVerification}
            >
              {isVerified ? "비밀번호 찾기" : isSendingVerification ? (
            <span>
              <span className="spinner" />
              <span className="text">전송 중...</span>
            </span>
          ) : (
            "인증코드 전송"
          )}
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isResultModalOpen && (
        <ModalOverlay onClick={closeResultModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeResultModal}>&times;</ModalCloseButton>
            <ModalTitle>결과</ModalTitle>
            {Array.isArray(modalMessage) ? (
              <ResultList>
                {modalMessage.map((id, index) => (
                  <ResultListItem key={index}>{id}</ResultListItem>
                ))}
              </ResultList>
            ) : (
              <ResultMessage>{modalMessage}</ResultMessage>
            )}
            <ModalButton onClick={closeResultModal}>닫기</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isErrorModalOpen && (
        <ModalOverlay onClick={closeErrorModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeErrorModal}>&times;</ModalCloseButton>
            <ModalTitle>에러</ModalTitle>
            <p style={{ textAlign: "center" }}>일치하는 이메일 정보가 없습니다.</p>
          </ModalContent>
        </ModalOverlay>
      )}

      {isPasswordChangeModalOpen && (
        <ModalOverlay onClick={closePasswordChangeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closePasswordChangeModal}>&times;</ModalCloseButton>
            <ModalTitle>비밀번호 변경</ModalTitle>
            <LabelContainer>
              <SpanLabel>새 비밀번호</SpanLabel>
              <ModalInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </LabelContainer>
            <ModalButton onClick={changePassword}>변경하기</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

    </Container>
  );
};

export default Login;