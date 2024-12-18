import React, { useEffect, useState } from "react";
import axios from "axios";

const UserAuthentication = () => {
  const [authData, setAuthData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAuthData = async () => {
      try {
        const response = await axios.get("http://localhost:9090/member/user", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Authentication Data:", response.data);
        setAuthData(response.data);
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
