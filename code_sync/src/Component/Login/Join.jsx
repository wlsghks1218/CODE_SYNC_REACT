import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const JoinStyle = styled.div`
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;

  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  input {
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  button {
    padding: 10px;
    background-color: lightgreen;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
    border: 2px solid green;
  }

  #verificationSend {
    margin-bottom: 10px;
  }
  #verify{
    margin-bottom: 10px;
  }

  button:hover {
    background-color: green;
  }
`;
  // keyframes 정의
  const spin = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `;

const VerificationButton = styled.button`
  padding: 10px;
  background-color: ${({ disabled }) => (disabled ? '#d3d3d3' : 'lightgreen')};
  color: black;
  border: none;
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 16px;
  transition: background-color 0.3s ease;
  border: 2px solid ${({ disabled }) => (disabled ? '#a9a9a9' : 'green')};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#d3d3d3' : 'green')};
}

span {
  display: flex;
  align-items: center;

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
`;

const Join = () => {
  const [formData, setFormData] = useState({
    userId: '',
    userPw: '',
    confirmPassword: '',
    userEmail: '',
  });

  const [isIdDuplicate, setIsIdDuplicate] = useState(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [serverCode, setServerCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkDuplication = async () => {
    const { userId } = formData;
  
    if (!userId) {
      alert('아이디를 입력해주세요.');
      return false;
    }
  
    try {
      const response = await axios.post('http://localhost:9090/member/checkUsername/', { userId });
      if (response.data.isDuplicate) {
        setIsIdDuplicate(true);
        alert('이미 존재하는 아이디입니다.');
        return false;
      } else {
        setIsIdDuplicate(false);
        alert('사용 가능한 아이디입니다!');
        return true;
      }
    } catch (error) {
      alert('아이디 중복 확인 중 오류가 발생했습니다.');
      return false;
    }
  };
  const sendVerification = async () => {
    const { userEmail } = formData;
  
    if (!userEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }
    setIsSendingVerification(true);
    try {
      const response = await axios.post('http://localhost:9090/member/sendVerification', { userEmail });
      if (response.status === 200) {
        console.log(response.data);
        const { verificationCode } = response.data;
        setServerCode(verificationCode);
        console.log(serverCode);
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
    console.log("입력 코드 : " + inputCode + "서버 코드 : " + serverCode);
    if (inputCode === serverCode) {
      alert('인증이 완료되었습니다.');
      setIsVerified(true);
    } else {
      alert('인증 코드가 올바르지 않습니다.');
    }
  };

  const validateForm = () => {
    const { userId, userPw, userEmail } = formData;
  
    const idRegex = /^[a-zA-Z0-9]{4,12}$/;
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!idRegex.test(userId)) {
      alert('아이디는 4~12자의 알파벳 대소문자와 숫자로 구성되어야 합니다.');
      return false;
    }
  
    if (!pwRegex.test(userPw)) {
      alert('비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를 포함해야 합니다.');
      return false;
    }
  
    if (!emailRegex.test(userEmail)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
  
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // 검증 실패 시 함수 종료
    }

    const { userId, userPw, confirmPassword, userEmail } = formData;
    if (isIdDuplicate){
      alert("아이디 중복 확인을 진행해주세요.");
      return;
    }

    if (userPw !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isVerified) {
      alert('이메일 인증이 필요합니다.');
      return;
    }

    const requestData = {
      userId,
      userPw,
      userEmail,
    };

    try {
      const response = await axios.post('http://localhost:9090/member/signUp', requestData);
      if (response.status === 200) {
        alert('회원가입이 완료되었습니다!');
        if (window.confirm('로그인 페이지로 이동하시겠습니까?')) {
          navigate('/login');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <JoinStyle>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userId"
          placeholder="아이디"
          value={formData.userId}
          onChange={handleChange}
          required
        />
        <button type="button" id="duplicatedCheckBtn" onClick={checkDuplication}>
          중복확인
        </button>
        {isIdDuplicate === true && <p style={{ color: 'red' }}>이미 존재하는 아이디입니다.</p>}
        {isIdDuplicate === false && <p style={{ color: 'green' }}>사용 가능한 아이디입니다!</p>}

        <input
          type="password"
          name="userPw"
          placeholder="비밀번호"
          value={formData.userPw}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="userEmail"
          placeholder="이메일"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />
        <VerificationButton
          id="verificationSend"
          onClick={sendVerification}
          disabled={isSendingVerification}
        >
          {isSendingVerification ? (
            <span>
              <span className="spinner" />
              <span className="text">전송 중...</span>
            </span>
          ) : (
            "인증코드 전송"
          )}
        </VerificationButton>

        {isVerificationSent && (
          <>
            <input
              type="text"
              name="verificationCode"
              placeholder="인증 코드 입력"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              required
            />
            <button type="button" id="verify" onClick={verifyCode}>
              인증완료
            </button>
          </>
        )}

        <button type="submit">회원가입</button>
      </form>
    </JoinStyle>
  );
};

export default Join;
