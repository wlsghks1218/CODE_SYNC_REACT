import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import styled from "styled-components";

const Memo = ({ memo, updateMemoPosition, updateMemo, deleteMemo }) => {
    const [content, setContent] = useState(memo.content);
    const [position, setPosition] = useState(memo.position);

    const [isEditingContent, setIsEditingContent] = useState(false);

    const memoRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        setPosition(memo.position);
        setContent(memo.content);
    }, [memo.position, memo.content]);


    const handleBlur = (field) => {
        if (field === "content" && content !== memo.content) {
            updateMemo(memo.id, { content });
            setIsEditingContent(false); 
        }
    };

    const handleContentClick = () => {
        setIsEditingContent(true); 
    };

    const handleDeleteMemo = (e) => {
        e.stopPropagation(); 
        deleteMemo(memo.id); 
    };

    return (
        <Draggable
            nodeRef={memoRef}
            position={position}
            onStop={(e, data) => {
                setPosition({ x: data.x, y: data.y });
                updateMemoPosition(memo.id, { x: data.x, y: data.y });
            }}
        >
            <MemoText ref={memoRef} className="memo">
                {isEditingContent? (
                    <ContentInput
                        ref={contentRef}
                        value={content}
                        onBlur={() => handleBlur("content")} 
                        onChange={(e) => setContent(e.target.value)} 
                        autoFocus
                    />
                ) : (
                    <MemoContent onClick={handleContentClick}>{content}</MemoContent>
                )}

                <DeleteButton onClick={handleDeleteMemo}>X</DeleteButton>
            </MemoText>
        </Draggable>
    );
};

export default Memo;


const MemoText = styled.div`
    position: absolute;
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

const MemoContent = styled.div`
    font-weight: bold;
    font-size: 12px;
    min-height: 100px;
    outline: none;
    display: flex;
    flex-direction: column; /* 자식 요소가 세로 방향으로 배치됩니다 */
    justify-content: flex-start; /* 위쪽부터 시작하도록 설정합니다 */
    align-items: flex-start; /* 왼쪽 정렬 */
    padding-top: 15px;
    color: #4f4f4f;
    cursor: pointer;
    white-space: pre-wrap; /* 텍스트의 줄 바꿈 유지 */

    :empty:before {
        content: "Untitled";
        color: #bbb;
    }
`;

const ContentInput = styled.textarea`
    font-weight: bold;
    font-size: 12px;
    min-height: 100px;
    border: none;
    outline: none;
    background: none;
    padding-top: 15px;
    color: #4f4f4f;
    width: 100%;
`;

const DeleteButton = styled.button`
    background-color: #ffeb99;
    color: gray;
    border: none;
    border-radius: 4px;
    padding: 5px 5px;
    font-size: 12px;
    cursor: pointer;
    margin-left: 10px;
    position: absolute;
    top: 5px;
    right: 5px;

    :hover {
        background-color: #ff1a1a;
    }
`;
