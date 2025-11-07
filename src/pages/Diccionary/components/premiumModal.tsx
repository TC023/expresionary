import { Modal, Button, Alert } from 'antd';
import apiClient from '../../../apiClient';
import { useUser } from '../../../contexts/UserContext';

// const { Title, Paragraph } = Typography;

interface Props {
    open: boolean,
    handleClose: () => void
}

const PremiumModal: React.FC<Props> = ({ open, handleClose }) => {

    const { user, setUser } = useUser()
    
    const handleFinish = async () => {
        const token = localStorage.getItem('token')
        console.log(token)

        const res = await apiClient.get('users/upgrade', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        if (res.status === 200 && user) {
            setUser({
                ...user,
                id: user.id, 
                email: user.email,
                role: 'premium' 
            })
        }

        console.log(res)
        
        handleClose()
    }

    return (
        <>
            <Modal
                title="Hazte premium"
                open={open}
                onCancel={handleClose}
                footer={null}
            >
                <div style={{ marginBottom: 16 }}>
                    <Alert
                        message="Beneficios premium"
                        description={`
Al obtener premium obtendrás lenguaje técnico especializado en diferentes materias.
`}
                        type="info"
                        showIcon
                    />
                </div>
                <Button type="primary" block onClick={() => handleFinish()}>
                    Mejorar a premium ($100 MXN)
                </Button>
            </Modal>
        </>
    );
};

export default PremiumModal;