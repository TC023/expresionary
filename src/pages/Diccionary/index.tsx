import React from 'react';

import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Diccionary: React.FC = () => {

    const navigate = useNavigate()
    
    return (
        <div>
            <h1>Diccionary Page</h1>
            <Button 
                onClick={() => {
                    navigate('/test')
                }}
                
            >
                TEst
            </Button>
        </div>
    );
};

export default Diccionary;