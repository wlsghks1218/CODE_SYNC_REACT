import React, { useState, useCallback, useEffect, } from "react";
import { useParams } from 'react-router-dom';
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
import { useSelector } from "react-redux";

const ErdDisplay = () => {
  const [tables, setTables] = useState([]);
  const [memos, setMemos] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [isAddingArrow, setIsAddingArrow] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [activeModal, setActiveModal] = useState(null);
  const [arrowStart, setArrowStart] = useState(null);
  const openModal = (modalType) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);
  const { erdNo } = useParams();
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const user = useSelector((state) => state.user);
  const userNo = user.user.userNo;
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:9090/erd/history/${erdNo}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  // 히스토리 추가 함수
  const addHistory = useCallback(async (action) => {
    const now = Date.now();
    const newHistory = {
      erdNo: erdNo,
      action,
      userId: user.user.userId,
      erdUpdateDate: now, 
    };
    setHistory((prevHistory) => [newHistory, ...prevHistory]);

    try {
      await axios.post('http://localhost:9090/erd/addHistory', newHistory);
      fetchHistory();
    } catch (error) {
      console.error('Failed to save history to DB:', error);
    }

  }, []);

  const startConnection = (tableId, position) => {
    if (!isAddingArrow || arrowStart) return;  // arrowStart가 이미 있으면 실행되지 않게

    // 화살표 연결을 시작할 때만 state 설정
    setArrowStart({ tableId, position });
    console.log("Arrow start:", { tableId, position });
  };

  const completeConnection = (tableId, position) => {
    if (!isAddingArrow || !arrowStart) return;

    const startTable = tables.find((table) => table.id === arrowStart.tableId);
    const endTable = tables.find((table) => table.id === tableId);

    if (!startTable || !endTable) {
      console.error("Start or end table not found");
      return;
    }

    // 1. 자기 자신에게 화살표 연결 불가
    if (startTable.id === endTable.id) {
      console.warn("Cannot connect arrow to the same table.");
      return;
    }

    // 2. 테이블 간 화살표 연결 여부 확인 (양 방향 연결 체크)
    const isAlreadyConnected = arrows.some(
      (arrow) =>
        (arrow.startId === startTable.id && arrow.endId === endTable.id) ||
        (arrow.startId === endTable.id && arrow.endId === startTable.id)
    );

    if (isAlreadyConnected) {
      console.warn("These tables are already connected.");
      return;
    }

    // 화살표의 상대 좌표 계산
    const relativeStartX = arrowStart.position.x - startTable.position.x;
    const relativeStartY = arrowStart.position.y - startTable.position.y;
    const relativeEndX = position.x - endTable.position.x;
    const relativeEndY = position.y - endTable.position.y;

    console.log("Relative positions:", relativeStartX, relativeStartY, relativeEndX, relativeEndY);

    // 시작 테이블에서 Primary Key 찾기
    const primaryKey = startTable.fields.find((field) => field.isPrimary);
    if (primaryKey) {
      const newField = {
        ...primaryKey,
        isPrimary: false,
        isForeign: true,
        fieldId: primaryKey.fieldId,
      };

      // 끝 테이블에 Foreign Key 추가
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === endTable.id
            ? { ...table, fields: [...table.fields, newField] }
            : table
        )
      );

      // WebSocket을 통한 외래 키 데이터 전송
      if (socket && socket.readyState === WebSocket.OPEN) {
        const foreignKeyField = {
          code: "12",
          userNo: userNo,
          id: endTable.id,
          fieldId: newField.fieldId,
          isPrimary: 2,
          isForeign: true,
          field: newField.name,
          type: newField.type,
          domain: newField.domain || "N/A",
        };
        socket.send(JSON.stringify(foreignKeyField));
      } else {
        console.error("WebSocket is not open");
      }
    }

    // 화살표 추가
    setArrows((prevArrows) => [
      ...prevArrows,
      {
        erdArrowNo: `temp-${Date.now()}`,
        startId: arrowStart.tableId,
        startPosition: {
          x: arrowStart.position.x,
          y: arrowStart.position.y,
          relativeX: relativeStartX,
          relativeY: relativeStartY,
        },
        endId: tableId,
        endPosition: {
          x: position.x,
          y: position.y,
          relativeX: relativeEndX,
          relativeY: relativeEndY,
        },
      },
    ]);

    // WebSocket을 통한 화살표 데이터 전송
    if (socket && socket.readyState === WebSocket.OPEN) {
      const arrowMessage = {
        code: "9",
        erdNo: erdNo,
        startXaxis: arrowStart.position.x,
        startYaxis: arrowStart.position.y,
        endXaxis: position.x,
        endYaxis: position.y,
        startId: arrowStart.tableId,
        endId: tableId,
        relativeStartX,
        relativeStartY,
        relativeEndX,
        relativeEndY,
      };
      socket.send(JSON.stringify(arrowMessage));
    } else {
      console.error("WebSocket is not open");
    }

    // 연결 완료 후 상태 초기화
    setArrowStart(null);
    setIsAddingArrow(false);
  };

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

      console.log(response.data);

      if (response.data && Array.isArray(response.data)) {
        const transformedArrows = response.data.map((item) => ({
          erdArrowNo: item.erdArrowNo,
          startId: item.startId,
          endId: item.endId,
          startPosition: {
            x: parseFloat(item.startXaxis),
            y: parseFloat(item.startYaxis),
            relativeX: parseFloat(item.relativeStartX),
            relativeY: parseFloat(item.relativeStartY),
          },
          endPosition: {
            x: parseFloat(item.endXaxis),
            y: parseFloat(item.endYaxis),
            relativeX: parseFloat(item.relativeEndX),
            relativeY: parseFloat(item.relativeEndY),
          },
        }));

        console.log('Transformed Arrows:', transformedArrows);
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
    fetchHistory();
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

          case "11": // 테이블 업데이트
            setTables((prevTables) =>
              prevTables.map((table) =>
                table.id === message.id
                  ? { ...table, name: message.tableName }
                  : table
              )
            );
            break;

          default:
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

    addHistory(`${userId}가 테이블을 추가하였습니다`);

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
  const updateTable = useCallback((id, updatedTable, operationType, fieldId = null) => {

    setTables((prevTables) =>
      prevTables.map((table) => (table.id === id ? updatedTable : table))
    );

    addHistory(`${userId}가 ${updateTable.name} 테이블을 수정하였습니다`);

    if (socket && socket.readyState === WebSocket.OPEN) {
      const updateMessage = {
        code: "11",
        erdNo: erdNo,
        id: updatedTable.id,
        userNo: userNo,
        tableName: updatedTable.name,
      };
      socket.send(JSON.stringify(updateMessage));

      const targetField = fieldId
        ? updatedTable.fields.find((field) => field.fieldId === fieldId)
        : null;

      const newFields = {
        code: null,
        userNo: userNo,
        id: updatedTable.id,
        fieldId: targetField?.fieldId || null,
        isPrimary: targetField?.isPrimary || null,
        domain: targetField?.domain || null,
        field: targetField?.name || null,
        type: targetField?.type || null,
      };

      if (newFields.isPrimary === true) {
        newFields.isPrimary = 1;
      } else if (newFields.isPrimary === false) {
        newFields.isPrimary = 0;
      } else if (newFields.isForeign === true) {
        newFields.isPrimary = 2;
      }

      // 작업 유형 처리
      switch (operationType) {
        case "add":
          newFields.code = "12";
          break;

        case "delete":
          newFields.code = "13";
          break;

        case "edit":
          newFields.code = "14";
          break;

        case "deletePrimary":
          newFields.code = "15";
          break;
        default:
          return;
      }

      socket.send(JSON.stringify(newFields));
    } else {
      console.error("WebSocket is not open");
    }
  }, [erdNo, socket, userNo]);

  // 테이블 삭제
  const deleteTable = useCallback((id) => {

    const table = tables.find((table) => table.id === id);

    addHistory(`${userId}가 ${table.name} 테이블을 삭제하였습니다`);

    if (socket && socket.readyState === WebSocket.OPEN) {
      const tableMessage = {
        code: "3",
        erdNo: erdNo,
        id: id,
      };
      socket.send(JSON.stringify(tableMessage));
    } else {
      console.error('WebSocket is not open');
    }

    // 화살표 상태 업데이트
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
  }, [erdNo, socket, tables]);

  // 테이블 복사
  const copyTable = useCallback((table) => {

    addHistory(`${userId}가 ${table.name} 테이블을 복사하였습니다`);

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

    addHistory(`${userId}가 메모를 추가하였습니다`);

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

    addHistory(`${userId}가 메모를 삭제하였습니다`);

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

    addHistory(`${userId}가 메모를 수정하였습니다`);

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

  const updateTablePosition = useCallback((id, newPosition) => {

    if (id && newPosition) {
      // 화살표의 시작과 끝 위치 업데이트
      setArrows((prevArrows) => {
        const updatedArrows = prevArrows.map((arrow) => {
          let updatedArrow = { ...arrow };

          // 화살표 시작 위치 업데이트
          if (arrow.startId === id) {
            const newStartPosition = {
              x: newPosition.x + arrow.startPosition.relativeX,
              y: newPosition.y + arrow.startPosition.relativeY,
            };
            updatedArrow.startPosition = newStartPosition;
          }

          // 화살표 끝 위치 업데이트
          if (arrow.endId === id) {
            const newEndPosition = {
              x: newPosition.x + arrow.endPosition.relativeX,
              y: newPosition.y + arrow.endPosition.relativeY,
            };
            updatedArrow.endPosition = newEndPosition;
          }

          return updatedArrow;
        });

        return updatedArrows; // `setArrows`가 이 값을 설정
      });

      // WebSocket으로 서버에 테이블의 새로운 위치 전송
      if (socket && socket.readyState === WebSocket.OPEN) {
        const tableMessage = {
          code: "4",
          erdNo: erdNo,
          xaxis: newPosition.x,
          yaxis: newPosition.y,
          id: id,
        };
        socket.send(JSON.stringify(tableMessage));

        // 화살표 위치 업데이트
        arrows.forEach((arrow) => {
          if (arrow.startId === id || arrow.endId === id) {
            const arrowMessage = {
              code: "16",
              erdNo: erdNo,
              startXaxis: arrow.startPosition.x,
              startYaxis: arrow.startPosition.y,
              endXaxis: arrow.endPosition.x,
              endYaxis: arrow.endPosition.y,
              startId: arrow.startId,
              endId: arrow.endId,
              relativeStartX: arrow.startPosition.relativeX,
              relativeStartY: arrow.startPosition.relativeY,
              relativeEndX: arrow.endPosition.relativeX,
              relativeEndY: arrow.endPosition.relativeY,
            };

            console.log("Arrow update message:", arrowMessage);
            socket.send(JSON.stringify(arrowMessage));
          }
        });
      } else {
        console.error("WebSocket is not open");
      }
    }
  }, [erdNo, socket, arrows]);

  // 메모 위치 변경
  const updateMemoPosition = useCallback((id, newPosition) => {

    addHistory(`${userId}가 메모 위치를 변경하였습니다`);

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

  // 시점 업데이트 함수
  const updateViewport = (deltaX, deltaY) => {
    setViewport((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  };

  const startDrag = (e) => {

    if (e.target.closest('.memo') || e.target.closest('.table')) {
      setIsDragging(false);
    } else {
      setIsDragging(true);
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
              id={table.id}
              startConnection={startConnection}
              completeConnection={completeConnection}
              isAddingArrow={isAddingArrow}
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
            <History history={history} setHistory={setHistory} />
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