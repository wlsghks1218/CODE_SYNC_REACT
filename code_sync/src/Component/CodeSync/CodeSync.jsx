import React from 'react';
import { useParams } from 'react-router-dom';

const CodeSync = () => {
    const {codeNo} = useParams("codeNo")
    return (
        <div>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            code {codeNo}번의 페이지입니다.
        </div>
    );
};

export default CodeSync;