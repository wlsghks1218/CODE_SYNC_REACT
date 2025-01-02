import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import DocsHistoryModal from "./DocsHistoryModal";

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
  width: 98%;
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
  text-decoration: none !important;
  font-size: 14px;
  color: black !important;
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
  width: 70%;
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
  min-width: 80px; /* 버튼 최소 너비 */
  text-align: center;

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

const DeleteButton = styled.span`
  color: #dc3545;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;

  &:hover {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #dc3545;
  }
`;
const SpanWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin-bottom: 10px;
`;

const UploadTypeSpan = styled.span`
  flex: 9; /* 90% */
  text-align: center;
`;

const DocsHistoryButton = styled.button`
  flex: 1; /* 10% */
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;

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
  const [showModal, setShowModal] = useState(false); 
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);

  const handleOpenModal = (index) => {
    setSelectedColumnIndex(index);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `http://116.121.53.142:9100/docs/getProjectByWrapperNo`, {
            params : { wrapperNo : wrapperNo }
          }
        );
        setProject(response.data);
  
        const columnsResponse = await axios.get(
          `http://116.121.53.142:9100/docs/getColumns`, {
            params : {wrapperNo : wrapperNo}
          }
        );
        const fetchedColumns = columnsResponse.data || [];
  
        const totalColumns = 3;
        const fetchedColumnData = fetchedColumns.map((col) => ({
          columnName: col.columnName || "",
          columnNo: col.columnNo || null,
          columnIndex: col.columnIndex || 0,
          voList: col.voList || [],
        }));

        const sortedColumns = Array.from({ length: totalColumns }, (_, i) =>
          fetchedColumnData.find((col) => col.columnIndex === i) || {
            columnName: "",
            columnNo: null,
            columnIndex: i,
            voList: [],
          }
        );
  
        setColumnData(sortedColumns);
        setFiles(sortedColumns.map((col) => col.voList || []));
        setIsEditable(sortedColumns.map(() => false));
        setIsColumnSaved(sortedColumns.map((col) => col.columnNo !== null));
        setColumns(sortedColumns.map((col) => col.columnNo !== null));
      } catch (error) {
        console.error("컬럼 데이터 가져오기 실패:", error);
      }
    };
  
    fetchProjects();
  }, [wrapperNo]);
  
  

  const handleAddColumn = (index) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = true;
    setColumns(updatedColumns);
  
    setColumnData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = { columnName: "", columnNo: null, columnIndex: index };
      return updatedData;
    });
  
    setIsEditable((prev) => {
      const updatedEditable = [...prev];
      updatedEditable[index] = true;
      return updatedEditable;
    });
  
    setIsColumnSaved((prev) => {
      const updatedSaved = [...prev];
      updatedSaved[index] = false;
      return updatedSaved;
    });
  };
  

  const handleRemoveFile = async (columnIndex, fileIndex) => {
    const file = files[columnIndex][fileIndex];
    const uploadPath = file.uploadPath;
    const columnName = columnData[columnIndex]?.columnName;
  
    if (!uploadPath) {
      alert("파일 경로를 찾을 수 없습니다.");
      return;
    }
  
    try {
      const response = await axios.delete("http://116.121.53.142:9100/docs/delete", {
        params: { filePath: uploadPath },
      });
  
      if (response.status === 200) {
        alert("파일 삭제 성공");
        
        const historyRes = await axios.post("http://116.121.53.142:9100/docs/deleteHistory", {
          projectNo: project.projectNo,
          fileName: file.docsName,
          userId: user.user.userId,
          columnIndex: columnIndex,
          columnName: columnName
        });

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
  
    try {
      const response = await axios.post(`http://116.121.53.142:9100/docs/saveColumn`, {
        wrapperNo: wrapperNo,
        columnIndex: index,
        columnCreator: user.user.userNo,
        columnName,
      });
  
      const newColumnNo = response.data;
  
      if (newColumnNo) {
        setColumnData((prev) =>
          prev.map((col, idx) =>
            idx === index
              ? { ...col, columnNo: newColumnNo, columnName }
              : col
          )
        );
  
        setIsColumnSaved((prev) => {
          const updatedSaved = [...prev];
          updatedSaved[index] = true;
          return updatedSaved;
        });
  
        setIsEditable((prev) => {
          const updatedEditable = [...prev];
          updatedEditable[index] = false;
          return updatedEditable;
        });
  
        alert("컬럼 저장 성공");
      } else {
        alert("컬럼 번호를 가져오지 못했습니다.");
      }
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
    const columnNo = columnData[columnIndex]?.columnNo;
    const columnName = columnData[columnIndex]?.columnName;
  
    if (!file || !columnNo) {
      alert("파일 또는 컬럼 번호를 확인할 수 없습니다.");
      return;
    }
  
    const allowedExtensions = ["txt", "pptx", "docx", "docs", "xml", "xlsx", "pdf"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
  
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`허용되지 않는 파일 형식입니다. 업로드 가능한 확장자: ${allowedExtensions.join(", ")}`);
      event.target.value = ""; // 파일 선택 초기화
      return;
    }
  
    try {
      const fileExistsResponse = await axios.get("http://116.121.53.142:9100/docs/checkFileExists", {
        params: {
          fileName: file.name,
          wrapperNo,
          columnNo,
        },
      });
  
      if (fileExistsResponse.data) {
        const overwrite = window.confirm("파일이 이미 존재합니다. 덮어쓰시겠습니까?");
        if (!overwrite) {
          return;
        }
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadUserNo", uploadUserNo);
      formData.append("columnNo", columnNo); // 제대로 매핑된 columnNo 전달
      formData.append("wrapperNo", wrapperNo);
  
      const response = await axios.post("http://116.121.53.142:9100/docs/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    alert(`응답 메시지: ${response.data}`);
    console.log("서버 응답:", response.data);
  
      if (response.status === 200) {
        alert("업로드 성공");
        const historyRes = await axios.post("http://116.121.53.142:9100/docs/uploadHIstory", {
          projectNo: project.projectNo,
          fileName: file.name,
          userId: user.user.userId,
          columnIndex: columnIndex,
          columnName: columnName
        });
      }
  
      const updatedColumnsResponse = await axios.get(
        `http://116.121.53.142:9100/docs/getColumns?wrapperNo=${wrapperNo}`
      );
      const totalColumns = 3;
      const sortedColumns = Array.from({ length: totalColumns }, (_, i) =>
        updatedColumnsResponse.data.find((col) => col.columnIndex === i) || {
          columnName: "",
          columnNo: null,
          columnIndex: i,
          voList: [],
        }
      );
      
      setColumnData(sortedColumns.map((col) => ({
        columnName: col.columnName || "",
        columnNo: col.columnNo || null,
      })));
      setFiles(sortedColumns.map((col) => col.voList || []));
      
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 실패");
    }
  };

  const handleDownloadFile = async (fileName, columnIndex, fileIndex) => {
    try {
      const uploadPath = files[columnIndex][fileIndex].uploadPath;
  
      if (!uploadPath) {
        alert("파일 경로를 가져오지 못했습니다.");
        return;
     }
  
      const response = await axios.get("http://116.121.53.142:9100/docs/download", {
        params: { filePath: uploadPath }
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      alert("파일 다운로드 실패");
    }
  };
  
  const handleDeleteColumn = async (columnIndex) => {
    const confirmDelete = window.confirm("컬럼을 정말로 삭제하시겠습니까?");
    if (!confirmDelete) {
      return;
    }
  
    try {
      const response = await axios.delete("http://116.121.53.142:9100/docs/deleteColumn", {
        params: {
          columnIndex: columnIndex,
          wrapperNo: wrapperNo,
        },
      });
  
      if (response.status === 200) {
        alert("컬럼이 삭제되었습니다.");
        
  
        // 컬럼 상태 초기화
        setColumnData((prev) =>
          prev.map((col, idx) =>
            idx === columnIndex ? { columnName: "", columnNo: null, columnIndex: idx } : col
          )
        );
  
        setFiles((prev) =>
          prev.map((fileList, idx) => (idx === columnIndex ? [] : fileList))
        );
  
        setIsEditable((prev) =>
          prev.map((editable, idx) => (idx === columnIndex ? false : editable))
        );
  
        setIsColumnSaved((prev) =>
          prev.map((saved, idx) => (idx === columnIndex ? false : saved))
        );
  
        setColumns((prev) =>
          prev.map((state, idx) => (idx === columnIndex ? false : state))
        );
      } else {
        alert("컬럼 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("컬럼 삭제 오류:", error);
      alert("컬럼 삭제 중 오류가 발생했습니다.");
    }
  };
  
  
  
  return (
    <Container>
      <h1>프로젝트 명 : {project?.projectName || "Loading..."}</h1>
      <SpanWrapper>
        <UploadTypeSpan>txt, pptx, docx, docs, xml, xlsx, pdf 문서만 업로드 가능합니다.</UploadTypeSpan>
      </SpanWrapper>
      <ColumnContainer>
        {columns.map((isEditing, index) => {
          const currentColumn = columnData[index] || { columnName: "", columnNo: null };
          const currentFiles = files[index] || [];
          return (
            <ColumnField key={index}>
              {isEditing ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <InputField
                      type="text"
                      placeholder={`컬럼 ${index + 1} 이름 입력`}
                      value={currentColumn.columnName || ""}
                      onChange={(e) => handleColumnInputChange(index, e.target.value)}
                      disabled={!isEditable[index]}
                    />
                    {isEditable[index] ? (
                      <SaveButton onClick={() => handleSaveColumn(index)}>저장</SaveButton>
                    ) : (
                      <SaveButton onClick={() => handleEditColumn(index)}>수정</SaveButton>
                    )}
                    <DocsHistoryButton onClick={() => handleOpenModal(index)}>업로드 내역</DocsHistoryButton>
                    <DeleteButton onClick={() => handleDeleteColumn(index)}> X </DeleteButton>
                  </div>
                  {currentFiles.map((file, fileIndex) => (
                    <FileActionContainer key={fileIndex}>
                      <FileLabel>{file.docsName}</FileLabel>
                      <DownloadButton
                        onClick={() => handleDownloadFile(file.docsName, index, fileIndex)}
                      >
                        다운로드
                      </DownloadButton>
                      <RemoveButton onClick={() => handleRemoveFile(index, fileIndex)}>
                        삭제
                      </RemoveButton>
                    </FileActionContainer>
                  ))}
                  {currentFiles.length < 3 && (
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
          );
        })}
      </ColumnContainer>
      {
        showModal &&
        <DocsHistoryModal
          isOpen={showModal}
          onClose={handleCloseModal}
          projectNo = {project.projectNo}
          columnIndex={selectedColumnIndex}
        />
      }
    </Container>
  );
};

export default Docs;
