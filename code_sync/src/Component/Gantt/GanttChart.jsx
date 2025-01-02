import axios from "axios";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector } from "react-redux";
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
        background-color: white;
    }

    .react-calendar__tile--active {
        background-color: transparent !important; /* 기본 파란색 제거 */
        color: inherit; /* 글자색 복원 */
    }

    .react-calendar__tile:hover,
    .react-calendar__tile:focus {
        background: none !important; /* 마우스 오버와 포커스 스타일 제거 */
        outline: none !important;
    }

    .react-calendar__tile {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        aspect-ratio: 1 / 1;
        font-size: 18px;
        position: relative;
        cursor: pointer;
        overflow: visible !important;
        border: 1px solid #ddd;
        padding: 0 !important;
        height: 100%;
    }

    .tile-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        overflow: visible;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    width: 750px;
    z-index: 1000;

    h2 {
        margin-top: 0;
    }

    button {
        margin-top: 10px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 5px;
    }

    button:hover {
        background: #0056b3;
    }
`;

const DateInput = styled.input`
    width: 20%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid lightgray;
    border-radius: 4px;
    margin-left: 10px;
`;

const ContentInput = styled.input`
    width: 70%;
    padding: 10px;
    margin-left: 10px;
    border: 1px solid lightgray;
    margin-top: 10px;
    border-radius: 4px;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const GanttBackground = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    height: 15%;
    overflow: visible;
    border-top-left-radius: ${({ $isStart }) => ($isStart ? "20px" : "0")};
    border-bottom-left-radius: ${({ $isStart }) => ($isStart ? "20px" : "0")};
    border-top-right-radius: ${({ $isEnd }) => ($isEnd ? "20px" : "0")};
    border-bottom-right-radius: ${({ $isEnd }) => ($isEnd ? "20px" : "0")};
    margin-left: ${({ $isStart }) => ($isStart ? "5px" : "0")};
    margin-right: ${({ $isEnd }) => ($isEnd ? "5px" : "0")};
`;

const Tooltip = styled.div`
    position: absolute;
    transform: translateX(-50%);
    background-color: ${({ color }) => color || "black"};
    color: black;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none; /* 말풍선과의 상호작용 방지 */
    z-index: 1000;
    opacity: 0.85;
    font-weight: bold;

    /* 말풍선 아래 삼각형 */
    &::after {
        content: '';
        position: absolute;
        bottom: -25px; /* 툴팁 아래에 배치 */
        left: 50%;
        transform: translateX(-50%);
        border-width: 15px;
        border-style: solid;
        border-color: ${({ color }) => color || "black"} transparent transparent transparent;
    }
`;

const StyledTd = styled.td`
    border: 1px solid #ddd;
    padding: 8px;
`;

const StyledTh = styled.th`
    border: 1px solid #ddd;
    padding: 8px;
`;

const formatDate = (date) => {
    if (!date) return ""; // null 또는 undefined 처리
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate)) return ""; // 유효하지 않은 날짜 처리
    return parsedDate.toLocaleDateString("en-CA"); // 'YYYY-MM-DD' 형식
};


function displayTime(unixTimeStamp) {
    if (!unixTimeStamp) return "";
    const myDate = new Date(unixTimeStamp);
    if (isNaN(myDate)) return "";
    const y = myDate.getFullYear();
    const m = String(myDate.getMonth() + 1).padStart(2, "0");
    const d = String(myDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function GanttChart() {
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "view" or "edit"
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedGantt, setSelectedGantt] = useState(null);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [ganttContent, setGanttContent] = useState(null);
    const [ganttList, setGanttList] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);

    const { projectNo } = useParams();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        const fetchGanttData = async () => {
            try {
                const response = await axios.get(`http://116.121.53.142:9100/gantt/${projectNo}`);
                if (response.status === 200) {
                    setGanttList(response.data);
                }
            } catch (error) {
                console.error("간트 데이터 불러오기 실패:", error);
            }
        };

        fetchGanttData();
    }, [projectNo]);

    const isDateInRange = (date, startDate, endDate) => {
        const checkDate = new Date(date).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(0, 0, 0, 0);
        return checkDate >= start && checkDate <= end;
    };

    const openModal = (date) => {
        setSelectedDate(date);
    
        const ganttItem = ganttList.find((item) =>
            isDateInRange(date, item.startDate, item.endDate)
        );
    
        if (ganttItem) {
            setSelectedGantt(ganttItem);
            setSelectedStartDate(new Date(ganttItem.startDate));
            setSelectedEndDate(new Date(ganttItem.endDate));
            setGanttContent(ganttItem.content || "");
            setModalType("view");
        } else {
            setSelectedStartDate(new Date(date));
            setSelectedEndDate(null);
            setGanttContent("");
            setModalType("edit");
        }
    
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setSelectedGantt(item); // 선택된 gantt 항목 설정
        setSelectedStartDate(new Date(item.startDate)); // 수정할 시작 날짜 설정
        setSelectedEndDate(new Date(item.endDate)); // 수정할 종료 날짜 설정
        setGanttContent(item.content); // 수정할 내용 설정
        setModalType("edit"); // 모달 타입을 수정으로 설정
        setIsModalOpen(true); // 모달 열기
    };

    const openAddModal = () => {
        setModalType("edit");
        setSelectedStartDate(new Date(selectedDate)); // 기존에 선택된 날짜를 기준으로 설정
        setSelectedEndDate(null); // 종료 날짜 초기화
        setGanttContent(""); // 내용 초기화
        setSelectedGantt(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGantt(null);
        setModalType("");
    };

    const handleStartDateChange = (e) => {
        const startDate = new Date(e.target.value);
        startDate.setHours(0, 0, 0, 0);
        setSelectedStartDate(startDate);
    };

    const handleEndDateChange = (e) => {
        const endDate = new Date(e.target.value);
        endDate.setHours(23, 59, 59, 999);
        setSelectedEndDate(endDate);
    };

    const handleContentChange = (e) => {
        setGanttContent(e.target.value);
    };

    const submitGanttChart = async () => {
        if (!selectedStartDate || !selectedEndDate || !ganttContent) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const ganttData = {
            projectNo,
            userId: user.user.userId,
            startDate: selectedStartDate.toLocaleDateString("en-CA"),
            endDate: selectedEndDate.toLocaleDateString("en-CA"),
            content: ganttContent,
        };

        try {
            const response = await axios.post("http://116.121.53.142:9100/gantt/createGantt", ganttData);
            if (response.status === 200) {
                const updatedList = await axios.get(`http://116.121.53.142:9100/gantt/${projectNo}`);
                if (updatedList.status === 200) {
                    setGanttList(updatedList.data);
                }
                closeModal();
            }
        } catch (error) {
            console.error("간트 차트 생성 중 오류 발생:", error);
            alert("간트 차트 생성 중 문제가 발생했습니다.");
        }
    };

    const deleteGantt = async () => {
        if (!selectedGantt || !selectedGantt.ganttNo) {
            alert("삭제할 일정이 없습니다.");
            return;
        }

        try {
            const response = await axios.delete(`http://116.121.53.142:9100/gantt/${selectedGantt.ganttNo}`);
            if (response.status === 200) {
                setGanttList(ganttList.filter((item) => item.ganttNo !== selectedGantt.ganttNo));
                closeModal();
            }
        } catch (error) {
            console.error("일정 삭제 중 오류 발생:", error);
            alert("일정 삭제 중 문제가 발생했습니다.");
        }
    };

    const updateGanttChart = async () => {
        if (!selectedGantt || !selectedStartDate || !selectedEndDate || !ganttContent) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        
        console.log(selectedGantt.ganttNo);
        // 수정 데이터 객체 생성
        const updatedGanttData = {
            ganttNo: selectedGantt.ganttNo, // ganttNo 포함 확인
            projectNo,
            userId: user.user.userId,
            startDate: selectedStartDate.toLocaleDateString("en-CA"),
            endDate: selectedEndDate.toLocaleDateString("en-CA"),
            content: ganttContent,
        };
    
        try {
            const response = await axios.put("http://116.121.53.142:9100/gantt/updateGantt", updatedGanttData);
            if (response.status === 200) {
                // 서버 응답에 따라 상태 업데이트
                const updatedList = await axios.get(`http://116.121.53.142:9100/gantt/${projectNo}`);
                if (updatedList.status === 200) {
                    setGanttList(updatedList.data);
                }
                closeModal();
                alert("수정이 완료되었습니다.");
            }
        } catch (error) {
            console.error("간트 차트 수정 중 오류 발생:", error);
            alert("간트 차트 수정 중 문제가 발생했습니다.");
        }
    };
    

    const tileContent = ({ date }) => {
        const colors = [
            "#ffcccc", "#ffdd99", "#ffff99", "#ccffcc", "#99ccff",
            "#d5a6bd", "#e06666", "#ffd966", "#a4c2f4", "#93c47d",
        ];

        const sortedGanttList = [...ganttList].sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );

        const assignedIndexes = {};
        const dateIndexMap = {};

        sortedGanttList.forEach((item) => {
            const startDate = new Date(item.startDate).setHours(0, 0, 0, 0);
            const endDate = new Date(item.endDate).setHours(0, 0, 0, 0);

            let index = 0;
            while (
                Object.keys(dateIndexMap).some(
                    (d) => d >= startDate && d <= endDate && dateIndexMap[d]?.has(index)
                )
            ) {
                index++;
            }

            assignedIndexes[item.ganttNo] = index;
            for (let d = startDate; d <= endDate; d += 24 * 60 * 60 * 1000) {
                if (!dateIndexMap[d]) {
                    dateIndexMap[d] = new Set();
                }
                dateIndexMap[d].add(index);
            }
        });

        const handleMouseEnter = (item, event) => {
            const rect = event.target.getBoundingClientRect();
            setHoveredItem({
                content: item.content,
                color: colors[assignedIndexes[item.ganttNo] % colors.length],
                x: rect.left + rect.width / 2 + window.scrollX, // 스크롤 X 보정
                y: rect.top + window.scrollY, // 스크롤 Y 보정
            });
        };
        const handleMouseLeave = () => {
            setHoveredItem(null);
        };

        const ganttItems = sortedGanttList.filter((item) =>
            isDateInRange(date, item.startDate, item.endDate)
        );

        return (
            <div
                className="tile-content"
                style={{ position: "relative", height: "100%" }}
                onClick={() => openModal(date)}
            >
                {ganttItems.map((item) => {
                    const startDate = new Date(item.startDate).getTime();
                    const endDate = new Date(item.endDate).getTime();
                    const currentDate = new Date(date).getTime();

                    const itemIndex = assignedIndexes[item.ganttNo];
                    const itemColor = colors[itemIndex % colors.length];

                    return (
                        <GanttBackground
                            key={`${item.ganttNo}-${date}`}
                            $isStart={currentDate === startDate}
                            $isEnd={currentDate === endDate}
                            style={{
                                top: `${itemIndex * 20}px`,
                                backgroundColor: itemColor,
                            }}
                            onMouseEnter={(event) => handleMouseEnter(item, event)}
                            onMouseLeave={handleMouseLeave}
                        />
                    );
                })}
            </div>
        );
    };
    return (
        <CalendarWrapper>
            <StyledCalendar
                onChange={setDate}
                value={date}
                locale="ko-KR"
                tileClassName={({ date }) =>
                    ganttList.some((item) => isDateInRange(date, item.startDate, item.endDate))
                        ? "react-calendar__tile--highlight"
                        : ""
                }
                tileContent={tileContent}
            />
            {hoveredItem && (
                <Tooltip
                    color={hoveredItem.color}
                    style={{
                        top: hoveredItem.y - 40,
                        left: hoveredItem.x,
                    }}
                >
                    {hoveredItem.content}
                </Tooltip>
            )}
            {isModalOpen && modalType === "view" && selectedGantt && (
    <>
        <Overlay onClick={closeModal} />
        <Modal>
            <h2>일정 보기</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <StyledTh>내용</StyledTh>
                        <StyledTh>시작 날짜</StyledTh>
                        <StyledTh>종료 날짜</StyledTh>
                        <StyledTh>삭제</StyledTh>
                    </tr>
                </thead>
                <tbody>
                    {ganttList
                        .filter((item) => isDateInRange(selectedDate, item.startDate, item.endDate))
                        .map((item) => (
                            <tr key={item.ganttNo}>
                                <StyledTd>{item.content}</StyledTd>
                                <StyledTd>
                                    {displayTime(item.startDate)}
                                </StyledTd>
                                <StyledTd>
                                    {displayTime(item.endDate)}
                                </StyledTd>
                                <StyledTd>
                                    <button
                                        onClick={() => openEditModal(item)}
                                        style={{
                                            padding: "5px 10px",
                                            background: "#3498db",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => deleteGantt(item.ganttNo)}
                                        style={{
                                            padding: "5px 10px",
                                            background: "#e74c3c",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        삭제
                                    </button>
                                </StyledTd>
                            </tr>
                        ))}
                </tbody>
            </table>
            <button onClick={openAddModal} style={{ marginTop: "20px" }}>
                일정 추가
            </button>
            <button onClick={closeModal} style={{ marginLeft: "10px" }}>
                닫기
            </button>
        </Modal>
    </>
)}
            {isModalOpen && modalType === "edit" && (
                <>
                    <Overlay onClick={closeModal} />
                    <Modal>
                        <h2>간트 차트 설정</h2>
                        <label>
                            시작 날짜
                            <DateInput
                                type="date"
                                value={selectedStartDate ? formatDate(selectedStartDate) : ""}
                                onChange={handleStartDateChange}
                            />
                        </label>
                        <span>&nbsp;&nbsp;~&nbsp;&nbsp;</span>
                        <label>
                            종료 날짜
                            <DateInput
                                type="date"
                                value={selectedEndDate ? formatDate(selectedEndDate) : ""}
                                onChange={handleEndDateChange}
                                min={selectedStartDate ? formatDate(selectedStartDate) : ""}
                            />
                        </label>
                        <br />
                        <label>
                            일정 내용
                            <ContentInput
                                type="text"
                                value={ganttContent}
                                onChange={handleContentChange}
                            />
                        </label>
                        <br />
                        <button
                            onClick={() => {
                                if (selectedGantt) {
                                    updateGanttChart();
                                } else {
                                    submitGanttChart();
                                }
                            }}
                        >
                            {selectedGantt ? "수정 완료" : "설정 완료"}
                        </button>
                        <button onClick={closeModal} style={{ marginLeft: "10px" }}>
                            닫기
                        </button>
                    </Modal>
                </>
            )}
        </CalendarWrapper>
    );
}

export default GanttChart;
