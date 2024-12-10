import React, { useState, useCallback, } from "react";
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

  // 테이블 추가
  const addTable = useCallback((position) => {
    setTables((prevTables) => [
      ...prevTables,
      {
        id: `table-${prevTables.length + 1}`,
        name: "Undefined",
        position,
        fields: [],
      },
    ]);
  }, []);

  // 테이블 업데이트
  const updateTable = useCallback((id, updatedTable) => {
    setTables((prevTables) =>
      prevTables.map((table) => (table.id === id ? updatedTable : table))
    );
  }, []);

  // 테이블 삭제
  const deleteTable = useCallback((id) => {
    setTables((prevTables) => prevTables.filter((table) => table.id !== id));
    setArrows((prevArrows) =>
      prevArrows.filter((arrow) => arrow.startId !== id && arrow.endId !== id)
    );
  }, []);

  // 테이블 복사
  const copyTable = useCallback((table) => {
    setTables((prevTables) => [
      ...prevTables,
      {
        ...table,
        id: `table-${prevTables.length + 1}`,
        name: `Copy of ${table.name}`,
        position: {
          x: table.position.x,
          y: table.position.y + 100,
        },
      },
    ]);
  }, []);

  // 메모 추가
  const addMemo = useCallback((position) => {
    setMemos((prevMemos) => [
      ...prevMemos,
      {
        id: `memo-${prevMemos.length + 1}`,
        position,
        text: "",
      },
    ]);
  }, []);

  const deleteMemo = useCallback((id) => {
    setMemos((prevMemos) => prevMemos.filter((memo) => memo.id !== id));
  }, []);

  const updateMemo = useCallback((id, updatedMemo) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id ? { ...memo, ...updatedMemo } : memo
      )
    );
  }, []);


  const updateTablePosition = useCallback((id, newPosition) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === id ? { ...table, position: newPosition } : table
      )
    );

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
  }, []);


  const updateMemoPosition = useCallback((id, newPosition) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) =>
        memo.id === id ? { ...memo, position: newPosition } : memo
      )
    );
  }, []);


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
                          isForeign: true, // Foreign Key로 설정
                        },
                      ],
                    }
                    : table
                )
              );
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
          viewport={viewport} // 뷰포트 상태 전달
          startDrag={startDrag}
          stopDrag={stopDrag}
          onDrag={onDrag}
          setIsDragging={setIsDragging}
        >
          {tables.map((table) => (
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
          {memos.map((memo) => (
            <Memo
              key={memo.id}
              memo={memo}
              updateMemo={updateMemo}
              deleteMemo={deleteMemo}
              updateMemoPosition={updateMemoPosition}
            />
          ))}
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
        {/* Sidebar */}
        <Sidebar onButtonClick={openModal} />

        {/* Side Panel Modals */}
        <SidePanel open={activeModal === "liveChat"}>
          <PanelHeader>
            <h3>Live Chat</h3>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </PanelHeader>
          <PanelContent>
            <LiveChat/>
          </PanelContent>
        </SidePanel>

        <SidePanel open={activeModal === "history"}>
          <PanelHeader>
            <h3>History</h3>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </PanelHeader>
          <PanelContent>
            <History/>
          </PanelContent>
        </SidePanel>

        {/* Central Modals */}
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
