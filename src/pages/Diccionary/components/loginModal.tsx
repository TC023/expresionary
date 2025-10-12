import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message } from 'antd';
import { useUser } from '../../../contexts/UserContext';
import apiClient from '../../../apiClient';

const { TabPane } = Tabs;

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);

    const { setUser } = useUser();

    const handleApiCall = async (url: string, requestBody: any) => {
        try {
            const res = await apiClient.post(url, requestBody);
            localStorage.setItem("token", res.data.token);
            const token = res.data.token;

            const profileRes = await apiClient.get("/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (profileRes.data) {
                setUser(profileRes.data);
            }

            message.success(`${activeTab === 'login' ? 'Login' : 'Signup'} successful!`);
            onClose();
        } catch (error) {
            console.error('Error:', error);
            message.error(`Failed to ${activeTab === 'login' ? 'login' : 'sign up'}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = (values: any) => {
        setLoading(true);

        const requestBody = {
            email: values.email,
            password: values.password,
        };

        if (activeTab === 'signup') {
            handleApiCall('/users/new', requestBody);
        } else if (activeTab === 'login') {
            handleApiCall('/users/login', requestBody);
        }

        form.resetFields();
    };

    return (
        <Modal
            title={activeTab === 'login' ? 'Login' : 'Sign Up'}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Login" key="login">
                    <Form form={form} onFinish={handleFinish} layout="vertical">
                        <Form.Item
                            name="email"
                            label="Email"
                            id="login-email"
                            rules={[{ required: true, message: 'Please enter your email!' }]}
                        >
                            <Input type="email" placeholder="Enter your email" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Password"
                            id="login-password"
                            rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab="Sign Up" key="signup">
                    <Form form={form} onFinish={handleFinish} layout="vertical">
                        <Form.Item
                            name="email"
                            label="Email"
                            id="signup-email"
                            rules={[{ required: true, message: 'Please enter your email!' }]}
                        >
                            <Input type="email" placeholder="Enter your email" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Password"
                            id="signup-password"
                            rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            id="signup-confirm-password"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm your password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Sign Up
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default LoginModal;