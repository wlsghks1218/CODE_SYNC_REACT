import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { updateUser } from "../../Action/userAction";
import ProjectBanners from "./ProjectBanners";
import ProjectDetailBanners from "./ProjectDetailBanners";

const Container = styled.div`
  padding-top: 60px;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
`;

const MyHeader = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: #343a40;
  margin-bottom: 20px;
`;

const UserInfoWrapper = styled.div`
  margin: auto;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  width: 60%;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const UserInfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: auto;
`;

const UserInfoTr = styled.tr`
  border-bottom: 1px solid #dee2e6;
`;

const UserInfoTd = styled.td`
  padding: 15px;
  text-align: left;
  font-size: 1rem;
  color: #495057;

  &:first-child {
    font-weight: bold;
    background-color: #f1f3f5;
    width: 20%;
  }

  &:nth-child(2) {
    text-align: left;
    width: 50%;
  }

  &:last-child {
    text-align: center;
  }
`;

const EditButton = styled.button`
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  color: white;
  margin-right: 5px;

  &:hover {
    background-color: #0056b3;
  }
`;

const CancelButton = styled.button`
  background-color: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  color: white;

  &:hover {
    background-color: #c82333;
  }
`;

const InputField = styled.input`
  width: 90%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const UserInfoTbody = styled.tbody``;

const MyPage = ({projects, fetchProjects, setProjects}) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const [editing, setEditing] = useState({
        userId: false,
        password: false,
        email: false,
    });

  const [formData, setFormData] = useState({
    userId: user?.user?.userId || "",
    password: "",
    newPassword: "",
    email: user?.user?.userEmail || "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [serverCode, setServerCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [selectedProjectNo, setSelectedProjectNo] = useState(null);

  const closeModal = () => {
    setSelectedProjectNo(null);
  };

  const handleEditClick = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field) => {
    setFormData((prev) => ({ ...prev, [field]: originalData[field] }));
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSave = async (field) => {
    let requestData = {};

    switch (field) {
      case "userId":
        const idRegex = /^[a-zA-Z0-9]{4,12}$/;

        if (!idRegex.test(formData.userId)) {
          alert("아이디는 4~12자의 영문 대소문자 및 숫자만 사용할 수 있습니다.");
          return;
        }

        requestData = { userNo: user.user.userNo, userId: formData.userId };
        const response1 = await axios.post("http://localhost:9090/member/updateUserId", requestData);

        if (response1.status === 200) {
            alert(`${field} 변경이 완료되었습니다.`);
  
            // 서버에서 최신 유저 정보 다시 가져오기
            const updatedUserResponse = await axios.get(`http://localhost:9090/member/getUserInfo?userNo=${user.user.userNo}`);
            if (updatedUserResponse.status === 200) {
              // Redux 상태 업데이트
              console.log("반횐된 계정 정보 : " + JSON.stringify(updatedUserResponse.data, null, 2));
              dispatch(updateUser(updatedUserResponse.data));
            }
        }
        break;
        case "password":
            requestData = {
              currentPassword: formData.password,
              newPassword: formData.newPassword,
              userNo: user.user.userNo
            };
            const chkPasswordResponse = await axios.post("http://localhost:9090/member/chkPassword", requestData);
            if(chkPasswordResponse.data > 0){
                alert("일단 비밀번호는 일치해요")
                const response2 = await axios.post("http://localhost:9090/member/updatePassword", requestData);
                if(response2.data > 0){
                    alert("비밀번호 변경 완료");
                }
            }else {
                alert("비밀번호가 잘못입력됨여");
                break;
            }

        break;
      default:
        throw new Error("Invalid field for saving");
    }

    setEditing((prev) => ({ ...prev, [field]: false }));
    setOriginalData((prev) => ({ ...prev, [field]: formData[field] }));
  };

  const handleSendCode = async () => {
    if (formData.email === originalData.email) {
        alert("신규 이메일은 현재 이메일과 다르게 입력해주세요.");
        return;
      }
    try {
      const response = await axios.post("http://localhost:9090/member/sendVerification", {
        userEmail: formData.email,
    });
    setIsSendingVerification(true);
      if (response.status === 200) {
        const { verificationCode } = response.data;
        console.log(verificationCode);
        setIsSendingVerification(false);
        setServerCode(verificationCode);
        setCodeSent(true);
        
      }
    } catch (error) {
      console.error("인증 코드 전송 실패:", error);
      alert("인증 코드 전송에 실패했습니다.");
    }
  };

  const verifyCode = async () => {
    console.log("입력 코드 : " + inputCode + " 서버 코드 : " + serverCode);
    if (inputCode === serverCode) {
      alert("인증이 완료되었습니다.");
        const response = await axios.post("http://localhost:9090/member/updateEmail", {
            userNo: user.user.userNo,
            email: formData.email,
          });
    
          if (response.status === 200) {
            alert("이메일이 성공적으로 변경되었습니다.");
    
            // 최신 유저 정보 가져오기
            const updatedUserResponse = await axios.get(
              `/member/getUserInfo?userNo=${user.user.userNo}`
            );
            if (updatedUserResponse.status === 200) {
              dispatch(updateUser(updatedUserResponse.data));
              setEditing((prev) => ({ ...prev, email: false }));
              setOriginalData((prev) => ({ ...prev, email: formData.email }));
      }
    } else {
      alert("인증 코드가 올바르지 않습니다.");
    }
  };
}


  return (
    <Container>
      <MyHeader>MY PAGE</MyHeader>
      <UserInfoWrapper>
        <UserInfoTable>
            <UserInfoTbody>
            <UserInfoTr>
            <UserInfoTd>아이디</UserInfoTd>
            <UserInfoTd>
              {editing.userId ? (
                <InputField
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                />
              ) : (
                formData.userId
              )}
            </UserInfoTd>
            <UserInfoTd>
              {editing.userId ? (
                <>
                  <EditButton onClick={() => handleSave("userId")}>수정완료</EditButton>
                  <CancelButton onClick={() => handleCancel("userId")}>취소</CancelButton>
                </>
              ) : (
                <EditButton onClick={() => handleEditClick("userId")}>변경하기</EditButton>
              )}
            </UserInfoTd>
          </UserInfoTr>
          <UserInfoTr>
            <UserInfoTd>비밀번호</UserInfoTd>
            <UserInfoTd>
              {editing.password ? (
                <>
                  <InputField
                    name="password"
                    type="password"
                    placeholder="현재 비밀번호"
                    onChange={handleInputChange}
                  />
                  <br />
                  <InputField
                    name="newPassword"
                    type="password"
                    placeholder="신규 비밀번호"
                    onChange={handleInputChange}
                  />
                </>
              ) : (
                "********"
              )}
            </UserInfoTd>
            <UserInfoTd>
              {editing.password ? (
                <>
                  <EditButton onClick={() => handleSave("password")}>수정완료</EditButton>
                  <CancelButton onClick={() => handleCancel("password")}>취소</CancelButton>
                </>
              ) : (
                <EditButton onClick={() => handleEditClick("password")}>변경하기</EditButton>
              )}
            </UserInfoTd>
          </UserInfoTr>
          <UserInfoTr>
            <UserInfoTd>이메일</UserInfoTd>
            <UserInfoTd>
                {editing.email ? (
                  <>
                    <InputField
                      name="email"
                      placeholder="신규 이메일을 입력하세요"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {codeSent && (
                      <InputField
                        name="verificationCode"
                        placeholder="인증 코드를 입력하세요"
                        value={formData.verificationCode}
                        onChange={(e) => setInputCode(e.target.value)}
                      />
                    )}
                  </>
                ) : (
                  formData.email
                )}
              </UserInfoTd>
              <UserInfoTd>
                {editing.email ? (
                  <>
                    {!codeSent ? (
                      <EditButton onClick={handleSendCode}>코드 전송</EditButton>
                    ) : (
                      <EditButton onClick={verifyCode}>코드 확인</EditButton>
                    )}
                    <CancelButton onClick={() => handleCancel("email")}>취소</CancelButton>
                  </>
                ) : (
                  <EditButton onClick={() => handleEditClick("email")}>변경하기</EditButton>
                )}
              </UserInfoTd>
          </UserInfoTr>
          </UserInfoTbody>
        </UserInfoTable>
      </UserInfoWrapper>
      <ProjectBanners
        projects={projects}
        fetchProjects={fetchProjects}
        setProjects={setProjects}
        setSelectedProjectNo={setSelectedProjectNo}
      />
      {selectedProjectNo && (
        <ProjectDetailBanners
          projectNo={selectedProjectNo}
          fetchProjects={fetchProjects}
          closeModal={closeModal}
        />
      )}
    </Container>
  );
};

export default MyPage;
