import React from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 20px;
    gap: 10px;
    flex: 1;
`;

const CategoryContainer = styled.div`
    width: 30%;
    min-height: 200px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
`;

const SkillItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 5px 0;
    padding: 5px;
    background-color: #ff9800;
    color: white;
    border-radius: 4px;
    cursor: ${({ draggable }) => (draggable ? 'grab' : 'default')};
`;

const SkillName = styled.span`
    flex: 1;
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

const StackBoard = ({ isMaster, stackedSkills, onDropSkill, onReturnSkill }) => {
    const handleDragStart = (e, skill, category) => {
        if (!isMaster) return;
        e.dataTransfer.setData('skillName', skill.skillName);
        e.dataTransfer.setData('imageUrl', skill.imageUrl);
        e.dataTransfer.setData('sourceCategory', category);
    };

    const handleDrop = (e, targetCategory) => {
        if (!isMaster) return;
        e.preventDefault();

        const skillName = e.dataTransfer.getData('skillName');
        const imageUrl = e.dataTransfer.getData('imageUrl');
        const sourceCategory = e.dataTransfer.getData('sourceCategory');

        if (sourceCategory !== targetCategory) {
            onDropSkill(skillName, targetCategory, sourceCategory, imageUrl);
        }
    };

    const allowDrop = (e) => e.preventDefault();

    return (
        <BoardContainer>
            {['front-end', 'back-end', 'utils'].map((category) => (
                <CategoryContainer
                key={category}
                onDrop={(e) => handleDrop(e, category)}
                onDragOver={allowDrop}
            >
                <h4>{category.toUpperCase()}</h4>
                {stackedSkills[category]?.map((skill) => (
                <SkillItem
                    key={skill.skillName}
                    draggable={isMaster}
                    onDragStart={(e) => handleDragStart(e, skill, category)}
                >
                    <SkillName>
                        <SkillImage src={skill.imageUrl} alt={skill.skillName} />
                        {skill.skillName}
                    </SkillName>
                    <RemoveButton
                        onClick={() => onReturnSkill(skill.skillName, category)}
                        disabled={!isMaster}
                    >
                        -
                    </RemoveButton>
                </SkillItem>
                ))}
            </CategoryContainer>
            ))}
        </BoardContainer>
    );
};

export default StackBoard;
