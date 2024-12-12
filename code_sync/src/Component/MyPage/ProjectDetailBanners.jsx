import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BannerWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Banner = styled.div`
  width: 250px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    background-color: #0056b3;
  }
`;

const ProjectDetailBanners = ({ projectNo }) => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState({
    erdNo: null,
    codeNo: null,
    docsNo: null,
  });

  useEffect(() => {
    console.log(projectNo);
    const fetchRoutes = async () => {
      try {
        const responses = await Promise.all([
          axios.get("http://localhost:9090/project/checkErd", { params: { projectNo } }),
          axios.get("http://localhost:9090/project/checkCode", { params: { projectNo } }),
          axios.get("http://localhost:9090/project/checkDocs", { params: { projectNo } }),
        ]);

        setRoutes({
          erdNo: responses[0].data.erdNo,
          codeNo: responses[1].data.codeSyncNo,
          docsNo: responses[2].data.wrapperNo,
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchRoutes();
  }, [projectNo]);

  const banners = [
    { title: "ERD", path: routes.erdNo ? `/erd/${routes.erdNo}` : "#" },
    { title: "Code Sync", path: routes.codeNo ? `/codeSync/${routes.codeNo}` : "#" },
    { title: "Docs", path: routes.docsNo ? `/docs/${routes.docsNo}` : "#" },
  ];

  return (
    <>
    <h2>Configure Project</h2>
    <BannerWrapper>
      {banners.map((banner, index) => (
        <Banner
          key={index}
          onClick={() => {
            if (banner.path !== "#") navigate(banner.path);
            else alert("해당 데이터가 존재하지 않습니다.");
          }}
        >
          {banner.title}
        </Banner>
      ))}
    </BannerWrapper>
    </>
  );
};

export default ProjectDetailBanners;
