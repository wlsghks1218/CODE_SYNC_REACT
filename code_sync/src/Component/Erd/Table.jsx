import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import styled from "styled-components";

const Table = ({ table, updatePosition, updateTable, deleteTable,
  copyTable, id, startConnection,
  completeConnection, isAddingArrow
}) => {
  const tableRef = useRef(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(table.name);
  const [editingField, setEditingField] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [tableFields, setTableFields] = useState([]);
  const [isConnectionInProgress, setIsConnectionInProgress] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [position, setPosition] = useState(table.position || { x: 0, y: 0 });

  useEffect(() => {
    if (table.position) {
      setPosition(table.position);
    }
  }, [table.position]);

  useEffect(() => {
    console.log("isAddingArrow changed:", isAddingArrow); 
  }, [isAddingArrow]);

  // 필드 데이터 불러오기
  const fetchTableFields = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:9090/erd/tableFields?id=${id}`);
      if (response.data && Array.isArray(response.data)) {
        const transformedTableFields = response.data.map((item) => ({
          erdTableNo: item.erdTableNo,
          id: item.id,
          fieldId: item.fieldId,
          name: item.field,
          type: item.type,
          isPrimary: item.isPrimary === "1",
          isForeign: item.isPrimary === "2",
          domain: item.domain || "N/A",
        }));

        const sortedFields = transformedTableFields.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (b.isPrimary && !a.isPrimary) return 1;
          if (a.isForeign && !b.isForeign) return -1;
          if (b.isForeign && !a.isForeign) return 1;
        });

        setTableFields(sortedFields);
      }
    } catch (error) {
      console.error("Error fetching table fields:", error);
    }
  }, [id]);

  useEffect(() => {
    if (isUpdating || editingField !== null) {
      return;
    }
    const interval = setInterval(fetchTableFields, 1000);
    return () => clearInterval(interval);
  }, [isUpdating, fetchTableFields, editingField]);
  

  // 제목 변경
  const handleTitleChange = () => setIsEditingTitle(true);
  const handleTitleSave = () => { 
    updateTable(table.id, { ...table, name: title });
    setIsEditingTitle(false);
  };

  // 필드 추가
  const handleAddField = (isPrimary = false) => {
    setIsUpdating(true);
    if (isPrimary && tableFields.some((field) => field.isPrimary)) {
      return;
    }

    const newField = {
      id: id,
      fieldId: Date.now(),
      name: `Field`,
      isPrimary: isPrimary,
      domain: "N/A",
      type: "N/A",
    };

    const updatedFields = isPrimary ? [newField, ...tableFields] : [...tableFields, newField];
    setTableFields(updatedFields);
    updateTable(
      table.id,
      { ...table, fields: updatedFields },
      "add",
      newField.fieldId
    )
    setIsUpdating(false);
  };

  // 필드 변경
  const handleFieldChange = (fieldIndex, fieldType, value) => {
    setIsUpdating(true);
    const updatedFields = tableFields.map((field, index) =>
      index === fieldIndex ? { ...field, [fieldType]: value } : field
    );
    setTableFields(updatedFields);
    setIsUpdating(false);
  };

  // 필드 삭제
  const handleDeleteField = (fieldIndex) => {
    setIsUpdating(true);
    const deletedField = tableFields[fieldIndex];

    if (deletedField.isPrimary) {
      updateTable(
        table.id,
        { ...table, fields: tableFields },
        "deletePrimary",
        deletedField.fieldId
      );
    } else {
      updateTable(
        table.id,
        { ...table, fields: tableFields },
        "delete",
        deletedField.fieldId
      );
    }

    const updatedFields = tableFields.filter((_, index) => index !== fieldIndex);
    setTableFields(updatedFields);
    setIsUpdating(false);
  };

  const handleFieldEdit = (fieldType, index) => {
    setEditingField(fieldType);
    setEditingFieldIndex(index);
  };

  // 필드 저장
  const handleFieldSave = () => {
    setIsUpdating(true);
    if (editingFieldIndex === null) return;

    const updatedTable = {
      ...table,
      fields: tableFields,
    };

    const targetField = tableFields[editingFieldIndex];
    updateTable(
      table.id,
      updatedTable,
      "edit",
      targetField.fieldId
    );

    setEditingField(null);
    setEditingFieldIndex(null);
    setIsUpdating(false);
  };

  const handleConnection = (e, position) => {
    if (!isAddingArrow) return;  // 화살표 추가 상태일 때만 실행
  
    if (!isConnectionInProgress) {
      // 연결 시작
      startConnection(table.id, position);
      setIsConnectionInProgress(true);
    } else {
      // 연결 완료
      completeConnection(table.id, position);
      setIsConnectionInProgress(false);
    }
  };

  return (
    <Draggable
      nodeRef={tableRef}
      position={position}
      onStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        updatePosition(table.id, newPosition);
      }}
    >
      <TableWrapper ref={tableRef} className="table">
        <div
          style={{ display: isAddingArrow ? 'block' : 'none' }}
        >
          <TopPoint
            onClick={(e) => {
              e.stopPropagation();
              const position = { x: e.clientX, y: e.clientY };
              handleConnection(e, position);
            }}
          />
          <RightPoint
            onClick={(e) => {
              e.stopPropagation();
              const position = { x: e.clientX, y: e.clientY };
              handleConnection(e, position);
            }}
          />
          <BottomPoint
            onClick={(e) => {
              e.stopPropagation();
              const position = { x: e.clientX, y: e.clientY };
              handleConnection(e, position);
            }}
          />
          <LeftPoint
            onClick={(e) => {
              e.stopPropagation();
              const position = { x: e.clientX, y: e.clientY };
              handleConnection(e, position);
            }}
          />
          </div>
          <TableHeader>
            <TableTitleWrapper>
              {isEditingTitle ? (
                <TitleInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  autoFocus
                />
              ) : (
                <Title onClick={handleTitleChange}>{title}</Title>
              )}
            </TableTitleWrapper>
            <TableActions>
              <Button onClick={() => handleAddField()}>+</Button>
              <Button onClick={() => handleAddField(true)}>P</Button>
              <Button onClick={() => copyTable(table)}>C</Button>
              <Button onClick={() => deleteTable(table.id)}>X</Button>
            </TableActions>
          </TableHeader>
          <TableFields>
            <thead>
              <tr>
                <th>Key</th>
                <th>Field</th>
                <th>Domain</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(tableFields) && tableFields.length > 0 ? (
                tableFields.map((field, index) => (
                  <tr key={field.fieldId || index}>
                    <TableCell isPrimary={field.isPrimary} isForeign={field.isForeign}>
                      {field.isPrimary ? "P" : field.isForeign ? "F" : ""}
                    </TableCell>
                    {["name", "domain", "type"].map((fieldType) => (
                      <TableCell
                        key={`${field.fieldId || index}-${fieldType}`}
                        onClick={() => handleFieldEdit(fieldType, index)}
                        isPrimary={field.isPrimary}
                        isForeign={field.isForeign}
                      >
                        {editingField === fieldType && editingFieldIndex === index ? (
                          <FieldInput
                            type="text"
                            value={field[fieldType]}
                            onChange={(e) => handleFieldChange(index, fieldType, e.target.value)}
                            onBlur={handleFieldSave}
                            autoFocus
                          />
                        ) : (
                          <span>{field[fieldType]}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <FieldButton onClick={() => handleDeleteField(index)}>X</FieldButton>
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No fields available</td>
                </tr>
              )}
            </tbody>
          </TableFields>
      </TableWrapper>
    </Draggable>
  );
};

export default Table;

const ConnectionPoint = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: gray;
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    background-color: darkred;
  }
`;

const TopPoint = styled(ConnectionPoint)`
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
`;

const RightPoint = styled(ConnectionPoint)`
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
`;

const BottomPoint = styled(ConnectionPoint)`
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
`;

const LeftPoint = styled(ConnectionPoint)`
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
`;

const TableWrapper = styled.div`

  position: absolute;
  width: 400px; /* 크기 줄임 */
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  padding: 10px; /* padding 줄임 */
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: grab;
  height: auto; 
  z-index: 10; /* 테이블을 화살표 위로 올리기 */
  overflow: visible; /* 겹친 부분 숨기기 */
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px; /* gap 줄임 */
  width: 100%;
`;

const TableTitleWrapper = styled.div`
  flex-grow: 1;
`;

const Title = styled.h4`
  font-size: 13px; /* 글자 크기 줄임 */
  font-weight: 600;
  margin: 0;
  cursor: pointer;
`;

const TitleInput = styled.input`
  font-size: 13px; /* 글자 크기 줄임 */
  padding: 4px; /* padding 줄임 */
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 30%;
`;

const TableActions = styled.div`
  display: flex;
  gap: 4px; /* gap 줄임 */
`;

const Button = styled.button`
  padding: 4px 8px; /* padding 줄임 */
  font-size: 10px; /* 글자 크기 줄임 */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #0056b3;
  }
`;

const TableFields = styled.table`
  margin-top: 4px; /* margin 더 줄임 */
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0; /* margin 더 줄임 */
  font-size: 12px; /* 글자 크기 더 줄임 */
  text-align: center;
  th,
  td {
    border: 1px solid #ccc;
    padding: 3px; /* padding 더 줄임 */
  }
  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  tr:hover {
    background-color: #f1f1f1;
  }
  td {
    text-align: center;
  }
  td:first-child,
  th:first-child {
    width: 8%; /* 폭 더 줄임 */
  }
  td:nth-child(2),
  th:nth-child(2) {
    width: 30%; /* 폭 더 줄임 */
  }
  td:nth-child(3),
  th:nth-child(3) {
    width: 25%; /* 폭 더 줄임 */
  }
  td:nth-child(4),
  th:nth-child(4) {
    width: 20%; /* 폭 더 줄임 */
  }
`;

const FieldInput = styled.input`
  width: 80%;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FieldButton = styled.button`
padding: 4px 8px; /* padding 줄임 */
  font-size: 8px; /* 글자 크기 줄임 */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #0056b3;
  }
`
const TableCell = styled.td`
  background-color: ${({ isPrimary, isForeign }) =>
    isPrimary ? "#fffacd" : isForeign ? "#add8e6" : "white"}; /* 노란색(P), 파란색(F), 기본(흰색) */
  color: #333;
  border: 1px solid #ccc;
  padding: 3px;
  text-align: center;
  &:hover {
    background-color: ${({ isPrimary, isForeign }) =>
      isPrimary ? "#ffeeba" : isForeign ? "#87ceeb" : "#f1f1f1"}; /* 강조된 색 */
  }
`;