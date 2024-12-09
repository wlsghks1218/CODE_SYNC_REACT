import React from 'react';
import { useParams } from 'react-router-dom';

const Erd = () => {
    const {erdNo} = useParams("newErdNo")
    return (
        <div>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            erd {erdNo}번의 페이지입니다.
        </div>
    );
};

export default Erd;