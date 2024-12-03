import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
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
  margin-bottom: 15px;
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

const Login = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isValid, setIsValid] = useState(true);
  console.log(rememberMe);
  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
        "remember-me": rememberMe
    }),
    });

    if(response.ok){
      let req = await axios.get('/api/user');
      const data = req.data;
      const principal = data.principal;

      dispatch(login(principal));
      nav('/');
    }else{
      setIsValid(false);
    }

    // if (response.ok) {
    //   const { token } = await response.json();
    //   localStorage.setItem("token", token); // JWT 저장
    // } else {
    //   console.error("로그인 실패");
    // }
  };
  return (
    <Container>
      <Title>로그인</Title>
      <StyledForm onSubmit={handleLogin}>
        <Input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="아이디"
        />
        <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        <label>
          <input
            type="checkbox"
            name="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          로그인 기억하기
        </label>
        <ButtonContainer>
          <Button type="submit">로그인</Button>
          <Button type="button"><Link to ='/join'>회원가입</Link></Button>
        </ButtonContainer>
      </StyledForm>
      {!isValid && <IsValidate>유저 정보가 올바르지 않습니다.</IsValidate> }
    </Container>
  );
};

export default Login;