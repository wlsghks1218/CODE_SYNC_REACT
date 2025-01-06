import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
    width: 200px;
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: auto;
`;

const AddSkillContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`;

const Input = styled.input`
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-bottom: 5px;
    &:disabled {
        background-color: #eaeaea;
    }
`;

const AddButton = styled.button`
    padding: 5px 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:disabled {
        background-color: #9e9e9e;
        cursor: not-allowed;
    }
`;

const SkillsList = styled.div`
    margin-top: 10px;
`;

const SkillItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;
    padding: 6px 12px;
    background-color: #4caf50;
    color: white;
    border-radius: 4px;
    cursor: ${({ draggable }) => (draggable ? 'grab' : 'default')};
`;

const SkillName = styled.div`
    flex: 1;
    user-select: none;
`;

const SkillImage = styled.img`
    width: 24px;
    height: 24px;
    margin-right: 8px;
    border-radius: 4px;
    object-fit: cover;
`;

const RemoveButton = styled.button`
    margin-left: 10px;
    padding: 2px 6px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:disabled {
        background-color: #9e9e9e;
        cursor: not-allowed;
    }
`;

const Sidebar = ({ isMaster, skills, onAddSkill, onRemoveSkill, onDropSkill }) => {
    const [newSkill, setNewSkill] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // 드래그 시작 이벤트
    const handleDragStart = (e, skill) => {
        if (!isMaster) return;
        e.dataTransfer.setData('skillName', skill.skillName);
        e.dataTransfer.setData('imageUrl', skill.imageUrl);
        e.dataTransfer.setData('sourceCategory', 'sidebar');
    };

    // 드롭 이벤트 처리
    const handleDrop = (e) => {
        if (!isMaster) return;
        e.preventDefault();
    
        const skillName = e.dataTransfer.getData('skillName');
        const imageUrl = e.dataTransfer.getData('imageUrl');
        const sourceCategory = e.dataTransfer.getData('sourceCategory');
    
        if (sourceCategory !== 'sidebar') {
            onDropSkill(skillName, 'sidebar', sourceCategory, imageUrl);
        }
    };
    // 드래그 허용
    const allowDrop = (e) => e.preventDefault();

    // 스킬 추가
    const handleAddSkill = () => {
        if (!isMaster || !newSkill.trim()) return;
        onAddSkill(newSkill, imageUrl);
        setNewSkill('');
        setImageUrl('');
    };

    return (
        <SidebarContainer onDrop={handleDrop} onDragOver={allowDrop}>
            <h3>Skill List</h3>
            <AddSkillContainer>
                <Input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    disabled={!isMaster}
                />
                <Input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    disabled={!isMaster}
                />
                <AddButton onClick={handleAddSkill} disabled={!isMaster}>
                    +
                </AddButton>
            </AddSkillContainer>
            <SkillsList>
                {skills.map((skill) => (
                    <SkillItem key={skill.skillName} draggable={isMaster} onDragStart={(e) => handleDragStart(e, skill)} >
                        <SkillName>
                            <SkillImage src={skill.imageUrl} alt={skill.skillName} />
                            {skill.skillName}
                        </SkillName>
                        <RemoveButton
                            onClick={() => onRemoveSkill(skill.skillName)}
                            disabled={!isMaster}
                        >
                            -
                        </RemoveButton>
                    </SkillItem>
                ))}
            </SkillsList>
        </SidebarContainer>
    );
};

export default Sidebar;
