import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-top: 60px;
  margin-bottom: 60px;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  width: 1000px;
`;

const ColumnField = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: auto;
`;

const AddButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #007bff;
  border-radius: 8px;
  color: #007bff;
  cursor: pointer;
  font-size: 16px;
  height: 100px;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: #e8f0fe;
  }
`;

const FileActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
`;

const FileLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const RemoveButton = styled.button`
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const InputField = styled.input`
  width: 90%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const AddFileButton = styled.button`
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Docs = () => {
  const { wrapperNo } = useParams();
  const user = useSelector((state) => state.user);
  const [project, setProject] = useState({});
  const [columns, setColumns] = useState([false, false, false]);
  const [files, setFiles] = useState([[], [], []]);
  const [columnData, setColumnData] = useState(["", "", ""]);
  const [isEditable, setIsEditable] = useState([false, false, false]);
  const [isColumnSaved, setIsColumnSaved] = useState([false, false, false]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9090/docs/getProjectByWrapperNo?wrapperNo=${wrapperNo}`
      );
      setProject(response.data);

      const columnsResponse = await axios.get(
        `http://localhost:9090/docs/getColumns?wrapperNo=${wrapperNo}`
      );
      const fetchedColumns = columnsResponse.data;

      setColumnData(fetchedColumns.map((col) => col.name || ""));
      setIsEditable(fetchedColumns.map(() => false));
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [wrapperNo]);

  const handleAddColumn = (index) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = true; // 클릭된 컬럼 활성화
    setColumns(updatedColumns);
    setIsEditable((prev) => {
      const updatedEditable = [...prev];
      updatedEditable[index] = true; // 새로 추가된 컬럼은 바로 수정 가능
      return updatedEditable;
    });

    setColumnData((prev) => {
      const updatedData = [...prev];
      if (!updatedData[index]) {
        updatedData[index] = "";
      }
      return updatedData;
    });
  };

  const handleRemoveFile = (columnIndex, fileIndex) => {
    const updatedFiles = [...files];
    updatedFiles[columnIndex].splice(fileIndex, 1);
    setFiles(updatedFiles);
  };

  const handleColumnInputChange = (index, value) => {
    const updatedColumnData = [...columnData];
    updatedColumnData[index] = value;
    setColumnData(updatedColumnData);
  };

  const handleSaveColumn = async (index) => {
    if (!columnData[index].trim()) {
      alert("컬럼명을 입력해주세요.");
      return;
    }

    setIsEditable((prev) => {
      const updatedEditable = [...prev];
      updatedEditable[index] = false; // 저장 후 수정 불가능 상태로 변경
      return updatedEditable;
    });

    try {
      const response = await axios.post(`http://localhost:9090/docs/saveColumn`, {
        wrapperNo: wrapperNo,
        columnNo: index,
        userNo: user.userNo,
        columnName: columnData[index],
      });

      setIsColumnSaved((prev) => {
        const updatedSaved = [...prev];
        updatedSaved[index] = true; // 저장 상태로 변경
        return updatedSaved;
      });

      alert(response.data.message || "컬럼 저장 성공");
    } catch (error) {
      console.error("컬럼 저장 실패:", error);
      alert("컬럼 저장 실패");
    }
  };

  const handleFileChange = async (event, columnIndex) => {
    if (!isColumnSaved[columnIndex]) {
      alert("파일을 업로드하려면 먼저 컬럼을 저장해주세요.");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:9090/docs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("업로드 성공: " + response.data);

      const updatedFiles = [...files];
      updatedFiles[columnIndex].push(file);
      setFiles(updatedFiles);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 실패");
    }
  };

  return (
    <Container>
      <h1>프로젝트 명 : {project?.projectName || "Loading..."}</h1>
      <ColumnContainer>
        {columns.map((isEditing, index) => (
          <ColumnField key={index}>
            {isEditing ? (
              <>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <InputField
                    type="text"
                    placeholder={`컬럼 ${index + 1} 이름 입력`}
                    value={columnData[index]}
                    onChange={(e) => handleColumnInputChange(index, e.target.value)}
                    disabled={!isEditable[index]} // 수정 가능 여부에 따라 입력 비활성화
                  />
                  {isEditable[index] ? (
                    <SaveButton onClick={() => handleSaveColumn(index)}>저장</SaveButton>
                  ) : (
                    <SaveButton onClick={() => setIsEditable(isEditable.map((editable, i) => (i === index ? true : editable)))}>
                      수정
                    </SaveButton>
                  )}
                </div>
                {files[index].map((file, fileIndex) => (
                  <FileActionContainer key={fileIndex}>
                    <FileLabel>{file.name}</FileLabel>
                    <RemoveButton onClick={() => handleRemoveFile(index, fileIndex)}>
                      삭제
                    </RemoveButton>
                  </FileActionContainer>
                ))}
                <AddFileButton>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id={`file-upload-${index}`}
                    onChange={(e) => handleFileChange(e, index)}
                  />
                  <label htmlFor={`file-upload-${index}`} style={{ cursor: "pointer" }}>
                    [+ 파일 추가하기]
                  </label>
                </AddFileButton>
              </>
            ) : (
              <AddButton onClick={() => handleAddColumn(index)}>
                컬럼 {index + 1} 추가
              </AddButton>
            )}
          </ColumnField>
        ))}
      </ColumnContainer>
    </Container>
  );
};

export default Docs;
