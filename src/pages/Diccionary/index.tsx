import React, { useState } from 'react';

import { 
  Button, 
  Layout, 
  Card, 
  Input, 
  Avatar, 
  Typography, 
  Space, 
  Tag, 
  Row, 
  Col,
  AutoComplete, 
  type AutoCompleteProps,
  Spin
} from 'antd';
import "/node_modules/flag-icons/css/flag-icons.min.css";

import apiClient from '../../apiClient';

const { Content } = Layout;

const { Title, Text, Paragraph } = Typography;

const Diccionary: React.FC = () => {

  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [isSearching, setisSearching] = useState(false)

  const fetchExpressions = async (searchQuery: string) => {
    try {
      const response = await apiClient.get('/search', {
        params: { search: searchQuery },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching expressions:', error);
      throw error;
    }
  };

  
  return (
    <Layout style={{ minHeight: '100vh', padding: 24, background: '#f5f7fb' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 16px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 980,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(30, 41, 59, 0.08)',
            overflow: 'visible',
          }}
        >
          {/* Header */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
            <Col>
              <Space align="center">
                <Avatar style={{ backgroundColor: '#5b21b6' }}>E</Avatar>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    EXPRESIONARY
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Beyond speaking
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text style={{ cursor: 'pointer' }}>Ingresar</Text>
                <Button type="primary" style={{ borderRadius: 6 }}>
                  Hazte Premium
                </Button>
              </Space>
            </Col>
          </Row>

          

          {/* Search */}
          <div style={{ marginBottom: 18 }}>
            <AutoComplete
              options={options}
              size='large'
              style={{width: '100%'}}
              onSearch={(text) => {
                setisSearching(true);
                setTimeout(() => {
                  setisSearching(false);
                }, 500);
                setOptions([{value: text}])
              }}
              placeholder="Busca un idiom, jerga o proverbio"
              popupRender={(e) => (isSearching ? <Spin style={{width: '100%'}} /> : e)}
            >

            </AutoComplete>
            <Input.Search
              placeholder="Busca un idiom, jerga o proverbio"
              enterButton={false}
              size="large"
              style={{ borderRadius: 28, background: '#f2f4f7' }}
            />
          </div>

          {/* Language chips */}
          <div style={{ marginBottom: 22 }}>
            <Space wrap>
              <Tag style={{ borderRadius: 8, padding: '6px 12px' }}><span className="fi fi-us"></span> Inglés</Tag>
              <Tag style={{ borderRadius: 8, padding: '6px 12px' }}><span className="fi fi-fr"></span> Francés</Tag>
              <Tag style={{ borderRadius: 8, padding: '6px 12px' }}><span className="fi fi-de"></span> Aleman</Tag>
            </Space>
          </div>

          {/* Main content: expression */}
          <div style={{ padding: '20px 0 8px' }}>
            <Title level={2} style={{ color: '#4c1d95', marginBottom: 6 }}>
              Kick the bucket
            </Title>
            <Title level={5} style={{ margin: 0 }}>
              Morir
            </Title>
            <Paragraph type="secondary" style={{ marginTop: 12 }}>
              The old man kicked the bucket last week.
            </Paragraph>
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <Button style={{ borderRadius: 8, background: '#f3f4f6', borderColor: '#f3f4f6' }}>
              Ver expresiones relacionadas
            </Button>
            <Button type="primary" style={{ borderRadius: 8, background: '#10b981', borderColor: '#10b981' }}>
              Hazte Premium
            </Button>
          </div>
        </Card>

        <button onClick={async () => {
          console.log(await fetchExpressions('Break'))
        }}>test</button>
      </Content>
    </Layout>
  );
};

export default Diccionary;