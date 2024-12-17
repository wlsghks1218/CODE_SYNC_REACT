import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import styled from "styled-components";

const Table = ({ table, updatePosition, updateTable, deleteTable, copyTable, handleTableClick }) => {
  const tableRef = useRef(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(table.name);
  const [editingField, setEditingField] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  useEffect(() => {
    if (table.position) {
      setPosition(table.position);
    }
  }, [table.position]); 

  const [position, setPosition] = useState(table.position || { x: 0, y: 0 });  

  const handleTitleChange = () => setIsEditingTitle(true);

  const handleTitleSave = () => {
    updateTable(table.id, { ...table, name: title });
    setIsEditingTitle(false);
  };

  const handleFieldEdit = (fieldType, index) => {
    setEditingField(fieldType);
    setEditingFieldIndex(index); // 수정 중인 필드의 인덱스 지정
  };

  const handleFieldSave = (fieldIndex, fieldType) => {
    setEditingField(null); // 수정 상태 종료
    setEditingFieldIndex(null); // 수정 인덱스 종료
    // 변경된 값을 상태에 반영
    updateTable(table.id, {
      ...table,
      fields: table.fields.map((field, index) =>
        index === fieldIndex ? { ...field, [fieldType]: field[fieldType] } : field
      ),
    });
  };

  const handleAddField = (isPrimary = false) => {
    if (isPrimary) {
      // 이미 Primary 필드가 존재하는 경우 추가하지 않음
      const primaryExists = table.fields.some((field) => field.isPrimary);
      if (primaryExists) return;
    }

    const newField = { name: `Field`, isPrimary: isPrimary, domain: "N/A", type: "N/A" };
    const updatedFields = isPrimary
      ? [newField, ...table.fields] // Primary 필드는 맨 위에 추가
      : [...table.fields, newField]; // 일반 필드는 아래에 추가

    updateTable(table.id, { ...table, fields: updatedFields });
  };

  const handleDeleteField = (fieldIndex) => {
    const updatedFields = table.fields.filter((_, index) => index !== fieldIndex);
    updateTable(table.id, { ...table, fields: updatedFields });
  };

  const handleFieldChange = (fieldIndex, fieldType, value) => {
    const updatedFields = [...table.fields];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], [fieldType]: value };
    updateTable(table.id, { ...table, fields: updatedFields });
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
      <TableWrapper ref={tableRef} onClick={() => handleTableClick(table.id)} className="table">
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
            <Button onClick={() => handleAddField(true)}>P</Button> {/* P 버튼 */}
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
            {table.fields.map((field, index) => (
              <tr key={index}>
                <TableCell isPrimary={field.isPrimary} isForeign={field.isForeign}>
                  {field.isPrimary ? "P" : field.isForeign ? "F" : ""}
                </TableCell>
                <TableCell
                  onClick={() => handleFieldEdit("field", index)}
                  isPrimary={field.isPrimary}
                  isForeign={field.isForeign}
                >
                  {editingField === "field" && editingFieldIndex === index ? (
                    <FieldInput
                      type="text"
                      value={field.name}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      onBlur={() => handleFieldSave(index, "name")}
                      autoFocus
                    />
                  ) : (
                    <span>{field.name}</span>
                  )}
                </TableCell>
                <TableCell
                  onClick={() => handleFieldEdit("domain", index)}
                  isPrimary={field.isPrimary}
                  isForeign={field.isForeign}
                >
                  {editingField === "domain" && editingFieldIndex === index ? (
                    <FieldInput
                      type="text"
                      value={field.domain}
                      onChange={(e) => handleFieldChange(index, "domain", e.target.value)}
                      onBlur={() => handleFieldSave(index, "domain")}
                      autoFocus
                    />
                  ) : (
                    <span>{field.domain}</span>
                  )}
                </TableCell>
                <TableCell
                  onClick={() => handleFieldEdit("type", index)}
                  isPrimary={field.isPrimary}
                  isForeign={field.isForeign}
                >
                  {editingField === "type" && editingFieldIndex === index ? (
                    <FieldInput
                      type="text"
                      value={field.type}
                      onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                      onBlur={() => handleFieldSave(index, "type")}
                      autoFocus
                    />
                  ) : (
                    <span>{field.type}</span>
                  )}
                </TableCell>
                <TableCell>
                  <FieldButton onClick={() => handleDeleteField(index)}>X</FieldButton>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </TableFields>
      </TableWrapper>
    </Draggable>
  );
};

export default Table;

const TableWrapper = styled.div`

  position: absolute;
  width: 300px; /* 크기 줄임 */
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
  overflow: hidden; /* 겹친 부분 숨기기 */
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
    width: 35%; /* 폭 더 줄임 */
  }
  td:nth-child(3),
  th:nth-child(3) {
    width: 25%; /* 폭 더 줄임 */
  }
  td:nth-child(4),
  th:nth-child(4) {
    width: 15%; /* 폭 더 줄임 */
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

