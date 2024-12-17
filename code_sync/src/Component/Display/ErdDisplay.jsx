import React, { useState, useCallback, useEffect, } from "react";
import { useLocation, useParams } from 'react-router-dom';
import Toolbar from "../Erd/Toolbar";
import Canvas from "../Erd/Canvas";
import Table from "../Erd/Table";
import Memo from "../Erd/Memo";
import Arrow from "../Erd/Arrow";
import Sidebar from "../Erd/Sidebar";
import Modal from "../Erd/Modal";
import styled from "styled-components";
import LiveChat from "../Erd/LiveChat";
import History from "../Erd/History";
import '../../Erd.css';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const ErdDisplay = () => {
  const [tables, setTables] = useState([]);
  const [memos, setMemos] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isAddingArrow, setIsAddingArrow] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalType) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);
  const { erdNo } = useParams();
  const [socket, setSocket] = useState(null);  // WebSocket 연결 상태
  const [userId, setUserId] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userNo = queryParams.get('userNo');

  // 사용자 ID를 가져오는 함수
  async function getUserId() {
    try {
      const response = await axios.get(`http://localhost:9090/erd/userId?userNo=${userNo}`);
      const userId = response.data.userId;
      setUserId(userId);
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
  }

  // 테이블 정보 가져오기
  const fetchTables = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9090/erd/tables?erdNo=${erdNo}`);
      if (response.data && Array.isArray(response.data)) {
        const transformedTables = response.data.map((item) => ({
          id: item.id || "null",
          erdTableNo: item.erdtableNo,
          name: item.tableName || "Untitled",
          position: {
            x: parseFloat(item.xaxis) || 0,
            y: parseFloat(item.yaxis) || 0,
          },
          fields: item.fields || [],
        }));

        setTables(transformedTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  }, [erdNo]);

  const fetchMemos = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9090/erd/memos?erdNo=${erdNo}`);
      if (response.data && Array.isArray(response.data)) {
        const transformedMemos = response.data.map((item) => ({
          id: item.id || "null",
          memoNo: item.memoNo,
          title: item.memoTitle || "Untitled",
          content: item.content,
          position: {
            x: parseFloat(item.xaxis) || 0,
            y: parseFloat(item.yaxis) || 0,
          },
        }));
        setMemos(transformedMemos);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setMemos([]);
    }
  }, [erdNo])

  const fetchArrows = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9090/erd/arrows?erdNo=${erdNo}`);
      
      if (response.data && Array.isArray(response.data)) {
        const transformedArrows = response.data.map((item) => ({
          startId: item.startId,
          endId: item.endId,
          startPosition: {
            x: parseFloat(item.startXaxis), 
            y: parseFloat(item.startYaxis),
          },
          endPosition: {
            x: parseFloat(item.endXaxis), 
            y: parseFloat(item.endYaxis), 
          },
        }));
        setArrows(transformedArrows);
      }
    } catch (error) {
      console.error('Error fetching arrows:', error);
      setArrows([]); 
    }
  }, [erdNo]);

  useEffect(() => {
    fetchTables();
    fetchMemos();
    fetchArrows();
  }, []);

  useEffect(() => {
    if (!userId || !erdNo) return;

    const socket = new WebSocket('ws://localhost:9090/displayserver.do?erdNo=' + erdNo);
    setSocket(socket);

    socket.onopen = () => {
      console.log('Connected to Display WebSocket server');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.code) {
          case "2": // 테이블 생성
            setTables((prevTables) => [
              ...prevTables,
              {
                id: message.id,
                name: message.tableName,
                position: {
                  x: parseFloat(message.xaxis),
                  y: parseFloat(message.yaxis),
                },
                fields: [],
              },
            ]);
            break;

          case "3": // 테이 블 삭제
            setTables((prevTables) =>
              prevTables.filter((table) => table.id !== message.id)
            );
            setArrows((prevArrows) =>
              prevArrows.filter(
                (arrow) => arrow.startId !== message.id && arrow.endId !== message.id
              )
            );
            break;

          case "4": // 테이블 위치 업데이트
            setTables((prevTables) =>
              prevTables.map((table) =>
                table.id === message.id
                  ? {
                    ...table,
                    position: {
                      x: parseFloat(message.xaxis),
                      y: parseFloat(message.yaxis),
                    },
                  }
                  : table
              )
            );
            break;

          case "5": // 메모 추가
            setMemos((prevMemos) => [
              ...prevMemos,
              {
                id: message.id,
                position: {
                  x: parseFloat(message.xaxis),
                  y: parseFloat(message.yaxis),
                },
                content: message.content || "",
              },
            ]);
            break;

          case "6": // 메모 삭제
            setMemos((prevMemos) =>
              prevMemos.filter((memo) => memo.id !== message.id)
            );
            break;

          case "7": // 메모 업데이트
            setMemos((prevMemos) =>
              prevMemos.map((memo) =>
                memo.id === message.id
                  ? {
                    ...memo,
                    content: message.content || "",
                  }
                  : memo
              )
            );
            break;

          case "8": // 메모 위치 업데이트
            setMemos((prevMemos) =>
              prevMemos.map((memo) =>
                memo.id === message.id
                  ? {
                    ...memo,
                    position: {
                      x: parseFloat(message.xaxis),
                      y: parseFloat(message.yaxis),
                    },
                  }
                  : memo
              )
            );
            break;

          case "9": // 화살표 추가
            setArrows((prevArrows) => [
              ...prevArrows,
              {
                startPosition: {
                  x: parseFloat(message.startXaxis),
                  y: parseFloat(message.startYaxis),
                },
                endPosition: {
                  x: parseFloat(message.endXaxis),
                  y: parseFloat(message.endYaxis),
                },
                startId: message.startId, 
                endId: message.endId, 
              },
            ]);
            break;

          default:
            console.warn(`Unhandled WebSocket message code: ${message.code}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from Display WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, [erdNo, userId]);

  // 테이블 추가 함수
  const addTable = useCallback((position) => {
    const newTable = {
      id: uuidv4(),
      name: "Untitled",
      position,
      fields: [],
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "2",
        erdNo: erdNo,
        userNo: userNo,
        tableName: newTable.name,
        xaxis: newTable.position.x,
        yaxis: newTable.position.y,
        id: newTable.id,

      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }
  }, [erdNo, socket, tables, userNo]);

  // 테이블 업데이트
  const updateTable = useCallback((id, updatedTable) => {
    setTables((prevTables) =>
      prevTables.map((table) => (table.id === id ? updatedTable : table))
    );
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      const updateMessage = {
        code: "11", 
        erdNo: erdNo,
        userNo: userNo,
        tableName: updatedTable.name,
        fields: updatedTable.fields, 
      };
      socket.send(JSON.stringify(updateMessage));
    } else {
      console.error('WebSocket is not open');
    }
  }, [erdNo, socket, userNo]);

  // 테이블 삭제
  const deleteTable = useCallback((id) => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "3",
        erdNo: erdNo,
        id: id
      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }

    setArrows((prevArrows) => {
      const remainingArrows = prevArrows.filter(
        (arrow) => arrow.startId !== id && arrow.endId !== id
      );
  
      prevArrows.forEach((arrow) => {
        if (arrow.startId === id || arrow.endId === id) {
          const arrowMessage = {
            code: "10",         
            erdNo: erdNo,
            startId: arrow.startId,
            endId: arrow.endId,
          };
          socket.send(JSON.stringify(arrowMessage));
        }
      });
  
      return remainingArrows;
    });
  
  }, [erdNo, socket]);

  // 테이블 복사
  const copyTable = useCallback((table) => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "2",
        erdNo: erdNo,
        userNo: userNo,
        tableName: table.name,
        xaxis: table.position.x,
        yaxis: table.position.y + 100,
        id: `copy of ` + table.id,
      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }

  }, [erdNo, socket, tables, userNo]);

  // 메모 추가
  const addMemo = useCallback((position) => {
    const newMemo = {
      id: uuidv4(),
      position,
      content: "",
    };


    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "5",
        erdNo: erdNo,
        xaxis: newMemo.position.x,
        yaxis: newMemo.position.y,
        id: newMemo.id,
        content: newMemo.content || null

      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }

  }, [erdNo, socket, memos, userNo]);

  // 메모 삭제
  const deleteMemo = useCallback((id) => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      const memoMessage = {
        code: "6",
        erdNo: erdNo,
        id: id
      };
      socket.send(JSON.stringify(memoMessage));
    } else {
      console.error('WebSocket is not open');
    }

  }, [erdNo, socket]);

  // 메모 업데이트 
  const updateMemo = useCallback((id, updatedMemo) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const memoMessage = {
        code: "7",
        erdNo: erdNo,
        id: id,
        content: updatedMemo.content || null

      };
      socket.send(JSON.stringify(memoMessage));
    }

  }, [erdNo, socket]);

  // 테이블 위치 변경
  const updateTablePosition = useCallback((id, newPosition) => {

    // 화살표의 시작/끝이 이 테이블과 연결되어 있으면 화살표 위치도 업데이트
    setArrows((prevArrows) =>
      prevArrows.map((arrow) => {
        if (arrow.startId === id) {
          return { ...arrow, startPosition: newPosition };
        }
        if (arrow.endId === id) {
          return { ...arrow, endPosition: newPosition };
        }
        return arrow;
      })
    );

    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "4",
        erdNo: erdNo,
        xaxis: newPosition.x,
        yaxis: newPosition.y,
        id: id
      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }

  }, [erdNo, socket]);

  // 메모 위치 변경
  const updateMemoPosition = useCallback((id, newPosition) => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      const memoMessage = {
        code: "8",
        erdNo: erdNo,
        xaxis: newPosition.x,
        yaxis: newPosition.y,
        id: id
      };
      socket.send(JSON.stringify(memoMessage));
    } else {
      console.error('WebSocket is not open');
    }

  }, [erdNo, socket]);


  // 화살표 추가 모드 활성화 및 테이블 클릭 처리
  const handleTableClick = useCallback(
    (id) => {
      if (!isAddingArrow) return;

      if (!selectedTable) {
        setSelectedTable(id); // 시작 테이블 설정
      } else if (selectedTable !== id) {
        // 연결된 테이블 가져오기
        const startTable = tables.find((table) => table.id === selectedTable);
        const endTable = tables.find((table) => table.id === id);

        if (startTable && endTable) {
          // 이미 연결된 화살표가 있는지 확인
          const arrowExists = arrows.some(
            (arrow) =>
              (arrow.startId === selectedTable && arrow.endId === id) ||
              (arrow.startId === id && arrow.endId === selectedTable)
          );

          if (!arrowExists) {
            // 시작 테이블에서 Primary Key 찾기
            const primaryKey = startTable.fields.find((field) => field.isPrimary);

            if (primaryKey) {
              // 끝 테이블에 Foreign Key 추가
              setTables((prevTables) =>
                prevTables.map((table) =>
                  table.id === endTable.id
                    ? {
                      ...table,
                      fields: [
                        ...table.fields,
                        {
                          ...primaryKey,
                          name: `${primaryKey.name}`,
                          isPrimary: false,
                          isForeign: true, 
                        },
                      ],
                    }
                    : table
                )
              );
            }

            const arrowMessage = {
              code: "9",
              erdNo: erdNo,
              startXaxis: startTable.position.x,
              startYaxis: startTable.position.y,
              endXaxis: endTable.position.x,
              endYaxis: endTable.position.y,
              startId: selectedTable,
              endId: id,
            };

            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(arrowMessage));
            } else {
              console.error('WebSocket is not open');
            }

            // 화살표 추가
            setArrows((prevArrows) => [
              ...prevArrows,
              { startId: selectedTable, endId: id },
            ]);
          }
        }
        setSelectedTable(null); // 선택 초기화
        setIsAddingArrow(false); // 화살표 추가 모드 종료
      }
    },
    [isAddingArrow, selectedTable, tables, arrows]
  );

  // 시점 업데이트 함수
  const updateViewport = (deltaX, deltaY) => {
    setViewport((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  const startDrag = (e) => {

    // 캔버스 시점 이동을 시작하는 상태
    if (e.target.closest('.memo') || e.target.closest('.table')) {
      // 자식 요소일 경우에는 캔버스 드래그 비활성화
      setIsDragging(false);
    } else {
      setIsDragging(true);  // 캔버스 자체를 드래그할 때는 시점 이동 허용
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const onDrag = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - startDragPosition.x;
      const deltaY = e.clientY - startDragPosition.y;

      updateViewport(deltaX, deltaY);
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    getUserId();
  }, [userNo]);

  return (
    <div className="app-container">
      <div className="content">
        <Toolbar
          onAddTable={addTable}
          onAddMemo={addMemo}
          onAddArrow={() => setIsAddingArrow(true)}  // 화살표 추가 모드 활성화
        />
        <Canvas
          tables={tables}
          arrows={arrows}
          viewport={viewport}
          startDrag={startDrag}
          stopDrag={stopDrag}
          onDrag={onDrag}
          setIsDragging={setIsDragging}
        >
          {Array.isArray(tables) && tables.map((table) => (
            <Table
              key={table.id}
              table={table}
              updatePosition={updateTablePosition}
              updateTable={updateTable}
              deleteTable={deleteTable}
              copyTable={copyTable}
              handleTableClick={handleTableClick}
            />
          ))}
          {Array.isArray(memos) && memos.map((memo) => {
            return (
              <Memo
                key={memo.id}
                memo={memo}
                updateMemo={updateMemo}
                deleteMemo={deleteMemo}
                updateMemoPosition={updateMemoPosition}
              />
            );
          })}
          {arrows.map((arrow, index) => {
            const startTable = tables.find((table) => table.id === arrow.startId);
            const endTable = tables.find((table) => table.id === arrow.endId);

            if (startTable && endTable) {
              return (
                <Arrow
                  key={index}
                  startPosition={startTable.position}
                  endPosition={endTable.position}
                />
              );
            }
            return null;
          })}
        </Canvas>
        <Sidebar onButtonClick={openModal} />
        <SidePanel open={activeModal === "liveChat"}>
          <PanelHeader>
            <h3>Live Chat</h3>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </PanelHeader>
          <PanelContent>
            <LiveChat />
          </PanelContent>
        </SidePanel>
        <SidePanel open={activeModal === "history"}>
          <PanelHeader>
            <h3>History</h3>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </PanelHeader>
          <PanelContent>
            <History />
          </PanelContent>
        </SidePanel>
        <Modal isOpen={activeModal === "share"} onClose={closeModal} title="Share">
          <p>공유 기능을 여기에 구현하세요.</p>
        </Modal>
        <Modal isOpen={activeModal === "projectUsers"} onClose={closeModal} title="Project Users">
          <p>프로젝트 사용자 관리를 구현하세요.</p>
        </Modal>
      </div>
    </div>
  );
};

export default ErdDisplay;

const SidePanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: #f9f9f9;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")}; // isOpen → open으로 이름 변경
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
`;

const PanelHeader = styled.div`
  background: #007bff;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const PanelContent = styled.div`
  padding: 20px;
  height: calc(840px - 50px); /* Header 높이를 뺀 나머지 */
  overflow-y: auto;
`;
