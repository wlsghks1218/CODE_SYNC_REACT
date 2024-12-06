import React from 'react';
import { useParams } from 'react-router-dom';

const Project = () => {
    const { projectNo } = useParams();
    return (
        <div>
            {projectNo}
        </div>
    );
};

export default Project;