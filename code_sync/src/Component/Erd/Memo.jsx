import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import styled from "styled-components";

const Memo = ({ memo, updateMemoPosition, updateMemo, deleteMemo, }) => {
    const [text, setText] = useState(memo.text);
    const [title, setTitle] = useState(memo.title || "Untitled");
    const [isEditingTitle, setIsEditingTitle] = useState(false); // 제목 편집 상태

    const memoRef = useRef(null);
    const contentRef = useRef(null);

    // 제목 저장 및 편집 상태 종료
    const handleTitleBlur = (e) => {
        setTitle(e.target.value || "Untitled");
        setIsEditingTitle(false); // 편집 모드 종료
    };

    // 제목을 클릭하면 편집 모드로 변경
    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    // 내용이 수정된 후, 커서가 다른 곳으로 이동하면 상태 업데이트
    const handleTextBlur = () => {
        setText(contentRef.current.innerText);
    };

    // 상태가 변경되면 updateMemo 호출
    useEffect(() => {
        if (memo.text !== text || memo.title !== title) {
            updateMemo(memo.id, { text, title });
        }
    }, [text, title, memo.id, memo.text, memo.title, updateMemo]);

    // 메모 삭제 기능
    const handleDeleteMemo = (e) => {
        e.stopPropagation(); // 클릭 이벤트 전파 방지
        deleteMemo(memo.id); // 삭제 동작
    };

    return (
        <Draggable
            nodeRef={memoRef}
            defaultPosition={memo.position}
            onStop={(e, data) => {
                updateMemoPosition(memo.id, { x: data.x, y: data.y });
            }}
        >
            <MemoText ref={memoRef} className="memo">
                {isEditingTitle ? (
                    <TitleInput
                        type="text"
                        defaultValue={title}
                        onBlur={handleTitleBlur} // 포커스 해제 시 저장
                        autoFocus
                    />
                ) : (
                    <MemoTitle onClick={handleTitleClick}>{title}</MemoTitle>
                )}
                <DeleteButton onClick={handleDeleteMemo}>X</DeleteButton>
                <MemoContent
                    ref={contentRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={handleTextBlur}
                >
                    {text}
                </MemoContent>
            </MemoText>
        </Draggable>
    );
};

export default Memo;

const MemoText = styled.div`
    position: absolute; /* 위치를 절대적으로 설정 */
    padding: 15px;
    background-color: #ffeb99;
    border: 1px solid #ffd700;
    border-radius: 6px;
    width: 100px;
    height: auto;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
    background-image: linear-gradient(135deg, #fff8b3 25%, transparent 25%) -50px 0,
                      linear-gradient(225deg, #fff8b3 25%, transparent 25%) -50px 0,
                      linear-gradient(45deg, #fff8b3 25%, transparent 25%),
                      linear-gradient(315deg, #fff8b3 25%, transparent 25%);
    background-size: 50px 50px;
    background-position: 0 0, 0 0, 0 0, 0 0;
`;

const MemoTitle = styled.div`
    font-weight: bold;
    font-size: 12px;
    min-height: 20px;
    outline: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: #4f4f4f;
    cursor: pointer;

    :empty:before {
        content: "Untitled";
        color: #bbb;
    }
`;

const TitleInput = styled.input`
    font-weight: bold;
    font-size: 12px;
    min-height: 20px;
    border: none;
    outline: none;
    background: none;
    color: #4f4f4f;
    width: 100%;
`;

const MemoContent = styled.div`
    font-size: 10px;
    min-height: 50px;
    padding: 5px;
    border-top: 1px solid #ffd700;
    margin-top: 5px;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    outline: none;
    color: #4f4f4f;

    :empty:before {
        content: "Click to edit";
        color: #bbb;
    }
`;

const DeleteButton = styled.button`
    background-color: #ffeb99;
    color: gray;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    margin-left: 10px;
    position: absolute;
    top: 10px;
    right: 10px;

    :hover {
        background-color: #ff1a1a;
    }
`;
