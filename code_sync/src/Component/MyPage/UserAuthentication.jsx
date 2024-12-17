import React, { useEffect, useState } from "react";
import axios from "axios"; // axios import

const UserAuthentication = () => {
  const [authData, setAuthData] = useState(null); // 인증 정보를 저장할 상태
  const [error, setError] = useState(null); // 에러 상태 관리

  useEffect(() => {
    const fetchUserAuthData = async () => {
      try {
        // 백엔드로부터 인증 정보 가져오기
        const response = await axios.get("http://localhost:9090/member/user", {
          withCredentials: true, // 쿠키 전송 필요 시 추가
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Authentication Data:", response.data);
        setAuthData(response.data); // 상태에 인증 정보 저장
      } catch (error) {
        console.error("Error fetching user authentication data:", error);
        setError("Failed to fetch data");
      }
    };

    fetchUserAuthData();
  }, []);

  return (
    <div>
      <h1>User Authentication Information</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {authData ? (
        <div>
          <p><strong>Username:</strong> {authData.name}</p>
          <p><strong>Authorities:</strong> {authData.authorities.map((auth) => auth.authority).join(", ")}</p>
          <p><strong>Authenticated:</strong> {authData.authenticated ? "Yes" : "No"}</p>
          <p><strong>Details:</strong> {JSON.stringify(authData.details)}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserAuthentication;
