import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import StackBoard from './StackBoard';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    padding-top: 60px;
`;

const Wrapper = styled.div`
    display: flex;
    gap: 20px;
    width: 100%;
`;

const AlertMessage = styled.div`
    margin: 20px 0;
    padding: 10px 20px;
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
    border-radius: 5px;
    font-size: 14px;
    text-align: center;
`;

const Skills = () => {
    const { projectNo } = useParams();
    const defaultSkills = [
        { projectNo, skillName: 'HTML', category: '', imageUrl: 'https://i.namu.wiki/i/JzUpt3oRtItQhEChDY3hQUEi9ZbN1ruLhvhwg9OxCtDPh8BrsvgQ81kmnTJJmNt5HeDXUCh64wpTI9kamK3LnOPT7hZjKo69d3FHZQ07MXWVSxcyezNHwdiN1bblp-Lh6V6GfcrHS9tjc3T6Q9fjjg.svg' },
        { projectNo, skillName: 'CSS', category: '', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/120px-CSS3_logo_and_wordmark.svg.png' },
        { projectNo, skillName: 'Java', category: '', imageUrl: 'https://i.namu.wiki/i/UhbpviYbsZa3g3lJ83l-j3GzElJjqBM51LBTvfVyyU6FEkayxlh7yaX-I3jILBHHtrgXT5roe4SYFnXggMrQMC63wAEVKs-QMn8HghqVpnDxbfmRa-GPn62qm9DzGm5RaCe-gxds7pP6BBF26EBHQw.svg' },
    ];
    const user = useSelector((state) => state.user);
    const [isMaster, setIsMaster] = useState(false);
    const [skills, setSkills] = useState([]);
    const [stackedSkills, setStackedSkills] = useState({
        'front-end': [],
        'back-end': [],
        utils: [],
    });

    const fetchProjectInfo = async () => {
        try {
            const response = await axios.get(`http://116.121.53.142:9100/project/getProjectByProjectNo`, {
                params: { projectNo },
            });
            const project = response.data;
            setIsMaster(project.muserNo === user?.user?.userNo);
        } catch (error) {
        }
    };
    const insertDefaultSkills = async (defaultSkills) => {
        try {
            await axios.post(`http://116.121.53.142:9100/skill/insertDefaultSkills`, defaultSkills);
        } catch (error) {
        }
    };

    let isFetching = false;
    const fetchSkills = async () => {
        if (isFetching) return;
        isFetching = true;
        try {
            const response = await axios.get(`http://116.121.53.142:9100/skill/getSkillList`, {
                params: { projectNo },
            });
            const skillList = response.data;
    
            // 서버에서 가져온 스킬 리스트가 비어있는지 확인
            if (!skillList || skillList.length === 0) {
                setSkills(defaultSkills);
                await insertDefaultSkills(defaultSkills);
            } else {
                const categorizedSkills = {
                    'front-end': [],
                    'back-end': [],
                    utils: [],
                };
                const uncategorizedSkills = [];
    
                skillList.forEach((skill) => {
                    if (skill.category && categorizedSkills[skill.category]) {
                        categorizedSkills[skill.category].push(skill);
                    } else {
                        uncategorizedSkills.push(skill);
                    }
                });
    
                setStackedSkills(categorizedSkills);
                setSkills(uncategorizedSkills);
            }
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchProjectInfo();
        fetchSkills();
    }, []);

    const addSkill = async (skillName, imageUrl) => {
        // 입력값이 없는 경우 처리
        if (!skillName || !imageUrl) {
            return;
        }
    
        // 입력값의 앞뒤 공백 제거 후 확인
        const trimmedSkillName = skillName.trim();
        const trimmedImageUrl = imageUrl.trim();
    
        if (!isMaster || !trimmedSkillName || !trimmedImageUrl) {
            return;
        }
    
        // 중복 확인
        const isDuplicate = skills.some((skill) => skill.skillName === trimmedSkillName);
        if (isDuplicate) {
            return;
        }
    
        const newSkill = { projectNo, skillName: trimmedSkillName, category: '', imageUrl: trimmedImageUrl };
        setSkills((prevSkills) => [...prevSkills, newSkill]);
    
        try {
            await axios.post(`http://116.121.53.142:9100/skill/addSkill`, newSkill);
        } catch (error) {
        }
    };
    

    const removeSkill = async (skillName) => {
        if (!isMaster) return;
    
        setSkills((prevSkills) =>
            Array.isArray(prevSkills) ? prevSkills.filter((skill) => skill.skillName !== skillName) : []
        );
    
        try {
            await axios.delete(`http://116.121.53.142:9100/skill/deleteSkill`, {
                data: { projectNo, skillName },
            });
        } catch (error) {
        }
    };

    const onDropSkill = async (skillName, targetCategory, sourceCategory, imageUrl) => {
        if (!isMaster) return;
    
        try {
            const category = targetCategory === 'sidebar' ? '' : targetCategory;
    
            // 서버 업데이트
            await axios.put(`http://116.121.53.142:9100/skill/updateCategory`, {
                projectNo,
                skillName,
                category,
            });
    
            // 상태 업데이트
            if (sourceCategory === 'sidebar') {
                setSkills((prev) => prev.filter((skill) => skill.skillName !== skillName));
            } else if (sourceCategory) {
                setStackedSkills((prevStacks) => ({
                    ...prevStacks,
                    [sourceCategory]: prevStacks[sourceCategory].filter(
                        (skill) => skill.skillName !== skillName
                    ),
                }));
            }
    
            if (targetCategory === 'sidebar') {
                setSkills((prev) => [
                    ...prev,
                    { projectNo, skillName, imageUrl, category: '' },
                ]);
            } else {
                setStackedSkills((prevStacks) => ({
                    ...prevStacks,
                    [targetCategory]: [
                        ...(prevStacks[targetCategory] || []),
                        { projectNo, skillName, imageUrl, category: targetCategory },
                    ],
                }));
            }
        } catch (error) {
        }
    };
    
    
    
    const onReturnSkill = async (skillName, sourceCategory) => {
        if (!isMaster) return;
    
        try {
            // sourceCategory에서 skill 정보 찾기
            const skillToReturn = stackedSkills[sourceCategory]?.find(
                (skill) => skill.skillName === skillName
            );
    
            if (!skillToReturn) {
                return;
            }
    
            const { imageUrl } = skillToReturn;
    
            // StackBoard에서 스킬 제거
            setStackedSkills((prevStacks) => ({
                ...prevStacks,
                [sourceCategory]: prevStacks[sourceCategory].filter(
                    (skill) => skill.skillName !== skillName
                ),
            }));
    
            // Sidebar에 스킬 추가
            setSkills((prevSkills) => [
                ...prevSkills,
                { projectNo, skillName, imageUrl, category: '' },
            ]);
    
            // 서버 업데이트
            await axios.put(`http://116.121.53.142:9100/skill/updateCategory`, {
                projectNo,
                skillName,
                category: '',
            });
        } catch (error) {
        }
    };
    
    

    return (
        <Container>
            <h2>기술 스택</h2>
            {!isMaster && (
                <AlertMessage>
                    프로젝트 생성자만 기술 스택을 수정할 수 있습니다.
                </AlertMessage>
            )}
            <Wrapper>
                <Sidebar skills={skills} onAddSkill={addSkill} onRemoveSkill={removeSkill} isMaster={isMaster} onDropSkill={onDropSkill}/>
                <StackBoard
                    stackedSkills={stackedSkills}
                    onDropSkill={onDropSkill}
                    isMaster={isMaster}
                    onReturnSkill={onReturnSkill}
                />
            </Wrapper>
        </Container>
    );
};

export default Skills;
