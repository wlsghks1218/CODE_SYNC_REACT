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

  & > span {
    flex-grow: 1;
  }

  & > button {
    margin-left: 10px;
  }
`;

const FileLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const DownloadButton = styled.button`
  padding: 4px 8px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: lightblue;
  }
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
  const [columnData, setColumnData] = useState([
    { columnName: "", columnNo: null },
    { columnName: "", columnNo: null },
    { columnName: "", columnNo: null },
  ]);
  const [isEditable, setIsEditable] = useState([false, false, false]);
  const [isColumnSaved, setIsColumnSaved] = useState([false, false, false]);

  useEffect(() => {
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
        
        setColumnData(
          fetchedColumns.map((col) => ({
            columnName: col.columnName || "",
            columnNo: col.columnNo || null,
          }))
        );
        setFiles(fetchedColumns.map((col) => col.voList || []));
        console.log("파일 정보 : " + JSON.stringify(files, null, 2))
        setIsEditable(fetchedColumns.map(() => false));
        setIsColumnSaved(fetchedColumns.map(() => true));
        setColumns(fetchedColumns.map(() => true));
      } catch (error) {
        console.error("컬럼 데이터 가져오기 실패:", error);
      }
    };

    fetchProjects();
  }, [wrapperNo]);

  const handleAddColumn = (index) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = true; // 클릭된 컬럼 활성화
    setColumns(updatedColumns);

    setColumnData((prev) => {
      const updatedData = [...prev];
      if (!updatedData[index]) {
        updatedData[index] = "";
      }
      return updatedData;
    });

    setIsEditable((prev) => {
      const updatedEditable = [...prev];
      updatedEditable[index] = true; // 새로 추가된 컬럼은 수정 가능 상태로 설정
      return updatedEditable;
    });
  };

  const handleRemoveFile = async (columnIndex, fileIndex) => {
    const file = files[columnIndex][fileIndex];
    const uploadPath = file.uploadPath;
  
    if (!uploadPath) {
      alert("파일 경로를 찾을 수 없습니다.");
      return;
    }
  
    try {
      // 삭제 요청
      const response = await axios.delete("http://localhost:9090/docs/delete", {
        params: { filePath: uploadPath }, // uploadPath를 전달
      });
  
      if (response.status === 200) {
        alert("파일 삭제 성공");
        const updatedFiles = [...files];
        updatedFiles[columnIndex].splice(fileIndex, 1);
        setFiles(updatedFiles);
      } else {
        alert("파일 삭제 실패");
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error);
      alert("파일 삭제 중 오류 발생");
    }
  };
  

  const handleColumnInputChange = (index, value) => {
    const updatedColumnData = [...columnData];
    updatedColumnData[index] = { ...updatedColumnData[index], columnName: value };
    setColumnData(updatedColumnData);
  };

  const handleSaveColumn = async (index) => {
    const columnName = columnData[index]?.columnName || "";
  
    if (!columnName.trim()) {
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
        columnIndex: index,
        columnCreator: user.user.userNo,
        columnName,
      });
  
      setIsColumnSaved((prev) => {
        const updatedSaved = [...prev];
        updatedSaved[index] = true;
        return updatedSaved;
      });
  
      alert(response.data.message || "컬럼 저장 성공");
    } catch (error) {
      console.error("컬럼 저장 실패:", error);
      alert("컬럼 저장 실패");
    }
  };

  const handleEditColumn = (index) => {
    setIsEditable((prev) => {
      const updatedEditable = [...prev];
      updatedEditable[index] = true;
      return updatedEditable;
    });
  };

  const handleFileChange = async (event, columnIndex) => {
    if (!isColumnSaved[columnIndex]) {
      alert("파일을 업로드하려면 먼저 컬럼을 저장해주세요.");
      return;
    }
  
    const file = event.target.files[0];
    const uploadUserNo = user.user.userNo;
    const columnNo = columnData[columnIndex].columnNo;
  
    if (!file) return;
  
    try {
      // 서버에 파일이 존재하는지 확인
      const fileExistsResponse = await axios.get("http://localhost:9090/docs/checkFileExists", {
        params: {
          fileName: file.name,
          wrapperNo,
          columnNo,
        },
      });
  
  
      // 파일이 이미 존재하면 덮어쓰기 여부 확인
      if (fileExistsResponse.data) {
        const overwrite = window.confirm(
          "파일이 이미 존재합니다. 덮어쓰시겠습니까?"
        );
        if (!overwrite) {
          return; // 덮어쓰기 취소
        }
      }
  
      // 파일 업로드
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadUserNo", uploadUserNo);
      formData.append("columnNo", columnNo);
      formData.append("wrapperNo", wrapperNo); // 추가된 부분
  
      const response = await axios.post("http://localhost:9090/docs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("업로드 성공: " + response.data);
  
      // 파일 정보 다시 불러오기
      const updatedColumnsResponse = await axios.get(
        `http://localhost:9090/docs/getColumns?wrapperNo=${wrapperNo}`
      );
      const updatedColumns = updatedColumnsResponse.data;
  
      // 상태 업데이트
      setColumnData(
        updatedColumns.map((col) => ({
          columnName: col.columnName || "",
          columnNo: col.columnNo || null,
        }))
      );
      setFiles(updatedColumns.map((col) => col.voList || []));
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 실패");
    }
  };
  

  const handleDownloadFile = async (fileName, columnIndex, fileIndex) => {
    try {
      // 파일 정보에서 uploadPath 가져오기
      const uploadPath = files[columnIndex][fileIndex].uploadPath;
  
      if (!uploadPath) {
        alert("파일 경로를 가져오지 못했습니다.");
        return;
      }
  
      // 다운로드 요청
      const response = await axios.get("http://localhost:9090/docs/download", {
        params: { filePath: uploadPath }, // uploadPath를 filePath로 전달
        responseType: "blob", // 바이너리 데이터로 응답받기
      });
  
      // 브라우저에서 파일 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // 파일 이름 설정
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      alert("파일 다운로드 실패");
    }
  };
  
  const handleOpenFile = (columnIndex, fileIndex) => {
    const file = files[columnIndex][fileIndex];
    const uploadPath = file.uploadPath;
  
    if (!uploadPath) {
      alert("파일 경로를 찾을 수 없습니다.");
      return;
    }
  
    // 새 탭으로 파일 열기
    window.open(`http://localhost:9090/docs/view?filePath=${encodeURIComponent(uploadPath)}`, "_blank");
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
                    value={columnData[index]?.columnName || ""} // 기본값 유지
                    onChange={(e) => handleColumnInputChange(index, e.target.value)}
                    disabled={!isEditable[index]} // 수정 가능 여부에 따라 입력 비활성화
                  />
                  {isEditable[index] ? (
                    <SaveButton onClick={() => handleSaveColumn(index)}>저장</SaveButton>
                  ) : (
                    <SaveButton onClick={() => handleEditColumn(index)}>수정</SaveButton>
                  )}
                </div>
                {files[index].map((file, fileIndex) => (
                  <FileActionContainer key={fileIndex}>
                    <FileLabel
                      onClick={() => handleOpenFile(index, fileIndex)}
                      style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}
                    >
                      {file.docsName}
                    </FileLabel>
                    <DownloadButton onClick={() => handleDownloadFile(file.docsName, index, fileIndex)}>
                      다운로드
                    </DownloadButton>
                    <RemoveButton onClick={() => handleRemoveFile(index, fileIndex)}>
                      삭제
                    </RemoveButton>
                  </FileActionContainer>
                ))}
                {files[index].length < 3 && (
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
                )}
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
