import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useParams } from "react-router-dom";
import styled from "styled-components";

const CalendarWrapper = styled.div`
    display: flex;
    align-items: center;
    height: 100vh;
    flex-direction: column;
    text-align: center;
    overflow: visible;
`;

const StyledCalendar = styled(Calendar)`
    width: 800px;
    max-width: 100%;
    font-size: 16px;

    .react-calendar__month-view__days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
    }

    .react-calendar__tile--now {
        background-color:white !important;
    }
    .react-calendar__tile--active {
      color: black;
      background-color: transparent !important;
    }
      
    .react-calendar__tile {
        display: flex;
        flex-direction: column; /* 세로 방향 정렬 */
        justify-content: flex-start; /* 날짜를 상단으로 */
        align-items: center;
        aspect-ratio: 1 / 1; /* 정사각형 비율 */
        font-size: 18px;
        position: relative;
        cursor: pointer;
        overflow: visible !important;
        padding: 0px !important;
        border:1px solid lightgray;
    }

    .tile-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        overflow: visible;
    }

    .tile-part {
        flex: 1;
        width: 100%;
        height: 100%;
        background-color: transparent;
        position: relative;
    }

    .tile-part.code.active {
        background-color: red;
    }

    .tile-part.erd.active {
        background-color: orange;
    }

    .tile-part.docs.active {
        background-color: yellow;
    }


    .tooltip {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 10px;
        border-radius: 6px;
        font-size: 14px;
        white-space: pre-wrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        z-index: 1000;
        visibility: hidden;
    }

    .tile-part:hover .tooltip {
        opacity: 1;
        visibility: visible;
    }
`;

const LegendWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center; /* 가로 가운데 정렬 */
  margin-bottom: 16px; /* 아래 캘린더와의 간격 */
`;

// 색상 박스
const ColorBox = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.color || "gray"};
  border: 1px solid #ccc;
  margin-right: 8px;
  border-radius: 4px;
`;

// 텍스트 스타일
const LegendText = styled.span`
  font-size: 14px;
  color: #333;
  margin-right: 16px; /* 박스 간 간격 */
`;

function ProjectHistory() {
  const [date, setDate] = useState(new Date());
  const [docsHistory, setDocsHistory] = useState([]);
  const [codeHistory, setCodeHistory] = useState([]);
  const [erdHistory, setErdHistory] = useState([]);
  const { projectNo } = useParams();

  const handleChange = (newDate) => {
    setDate(newDate);
  };

  useEffect(() => {
    const fetchHistories = async () => {
        try {
          const docsResponse = await axios.get("http://116.121.53.142:9100/gantt/getDocsHistoryForGantt", {
            params: { projectNo },
          });
      
          setDocsHistory(
            docsResponse.data.map((doc) => ({
              ...doc,
              updateDate: new Date(doc.updateDate),
            }))
          );
          const codeResponse = await axios.get("http://116.121.53.142:9100/gantt/getCodeHistoryForGantt", {
            params: { projectNo },
          });
          
          const erdResponse = await axios.get("http://116.121.53.142:9100/gantt/getErdHistoryForGantt", {
            params: { projectNo },
          });
      
          setCodeHistory(
            codeResponse.data.map((code) => ({
              ...code,
              updateDate: new Date(code.updateDate),
            }))
          );
      
          setErdHistory(
            erdResponse.data.map((erd) => ({
              ...erd,
              updateDate: new Date(erd.erdUpdateDate),
            }))
          );
        } catch (error) {
        }
      };
    fetchHistories();
  }, [projectNo]);

  const tileContent = ({ date }) => {
    const dayDocs = docsHistory.filter((doc) => {
      const docDate = new Date(doc.updateDate);
      return (
        docDate.getFullYear() === date.getFullYear() &&
        docDate.getMonth() === date.getMonth() &&
        docDate.getDate() === date.getDate()
      );
    });
  
    const dayCode = codeHistory.filter((code) => {
      const codeDate = new Date(code.updateDate);
      return (
        codeDate.getFullYear() === date.getFullYear() &&
        codeDate.getMonth() === date.getMonth() &&
        codeDate.getDate() === date.getDate()
      );
    });
  
    const dayErd = erdHistory.filter((erd) => {
      const erdDate = new Date(erd.updateDate);
      return (
        erdDate.getFullYear() === date.getFullYear() &&
        erdDate.getMonth() === date.getMonth() &&
        erdDate.getDate() === date.getDate()
      );
    });
  
    return (
        <div className="tile-content">
          <div
            className={`tile-part ${dayErd.length > 0 ? "erd active" : "erd"}`}
          >
            {dayErd.length > 0 && (
              <div className="tooltip">
                {[...new Set(dayErd.map((erd) => erd.userId))].join("\n")}
              </div>
            )}
          </div>
          <div
            className={`tile-part ${dayCode.length > 0 ? "code active" : "code"}`}
          >
            {dayCode.length > 0 && (
              <div className="tooltip">
                {[...new Set(dayCode.map((code) => code.userId))].join("\n")}
              </div>
            )}
          </div>
          <div
            className={`tile-part ${dayDocs.length > 0 ? "docs active" : "docs"}`}
          >
            {dayDocs.length > 0 && (
              <div className="tooltip">
                {[...new Set(dayDocs.map((doc) => doc.userId))].join("\n")}
              </div>
            )}
          </div>
        </div>
      );
  };

  return (
    <CalendarWrapper>
      <LegendWrapper>
        <ColorBox color="red" />
        <LegendText>Code</LegendText>
        <ColorBox color="orange" />
        <LegendText>ERD</LegendText>
        <ColorBox color="yellow" />
        <LegendText>DOCS</LegendText>
      </LegendWrapper>
      <StyledCalendar
        onChange={handleChange}
        value={date}
        locale="ko-KR"
        tileContent={tileContent}
      />
      <p>선택된 날짜: {date.toLocaleDateString()}</p>
    </CalendarWrapper>
  );
}

export default ProjectHistory;
