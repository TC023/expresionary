import React, { useEffect, useState } from 'react';

import { 
  Button, 
  Layout, 
  Card, 
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
import { RightOutlined } from '@ant-design/icons';


const { Content } = Layout;

const { Title, Text, Paragraph } = Typography;

interface SearchResult {
  ok: boolean,
  rows: {expresion: string}[]
}

interface Expression {
  categoria: string,
  ejemplo: string,
  equivalente: string,
  expresion: string,
  id: number,
  idioma: string,
  uso: string
}


const Diccionary: React.FC = () => {

  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [isSearching, setisSearching] = useState(false)
  const [searchTxt, setSearchTxt] = useState<string>('')
  const [expressionFound, setExpressionFound] = useState<Expression>()
  const [daily, setDaily] = useState<Expression>()

  const [searchOptions, setSearchOptions] = useState<Record<string, any>>({})
  
  let debounceTimeout: ReturnType<typeof setTimeout>;

  const fetchExpressions = async (searchQuery: string) => {
    try {
      const response = await apiClient.get('/search', {
        params: { search: searchQuery },
      });
      return response.data ;
    } catch (error: any) {
      console.error('Error fetching expressions:', error);
      throw error;
    }
  };

  const fetchRandom = async () => {
    const random = (await apiClient.get('/random')).data.rows[0]
    console.log(random)
    setExpressionFound(random)
  }

  useEffect(() => {
    const fetchDaily = async () => {
      const res = await apiClient.get('/daily')
      console.log(res.data)
      setDaily(res.data.rows[0])
    }
    fetchDaily()

  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (searchOptions[searchTxt.toLowerCase()]) {
        const res = await apiClient.get('/expression', {
          params: {expresion: searchTxt}
        });

        setExpressionFound(res.data.rows[0])
        
        console.log('all', res.data)
      } else {
        setExpressionFound(undefined)
      }
    };
    fetchData();
  }, [searchTxt]);
  
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
            maxWidth: '90%',
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
                <div style={{marginBottom: 12}}>
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
                <Text style={{ cursor: 'pointer', padding: '30px' }}>Ingresar</Text>
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
              size="large"
              style={{ width: "100%" }}
              onChange={(text) => {
                setSearchTxt(text)

              }}
              onSearch={(text) => {
              if (!text.trim()) {
                setOptions([]); // Clear options if input is empty
                return;
              }
              setisSearching(true);
              if (debounceTimeout) {
                clearTimeout(debounceTimeout);
              }
              debounceTimeout = setTimeout(async () => {
                const res = (await fetchExpressions(text)) as SearchResult;
                console.log(res);
                setSearchOptions(Object.fromEntries(res.rows.map(i => [i.expresion.toLowerCase(), i])))
                setisSearching(false);
                setOptions(res.rows.map((r) => {
                    const transformed = r.expresion.replace(
                    new RegExp(`(${text})`, 'gi'),
                    (match) => `<b>${match}</b>`
                    );
                    return {
                    value: r.expresion,
                    label: <span dangerouslySetInnerHTML={{ __html: transformed }} />
                    };
                }));
              }, 500);
              }}
              popupRender={(e) => (isSearching ? <Spin style={{ width: "100%" }} /> : e)}
              placeholder="Busca un idiom, jerga o proverbio"
            >
            </AutoComplete>
          </div>


          {/* Language chips */}
          <div style={{ marginBottom: 0}}>
            <Space wrap>
              {[
              { code: 'us', name: 'Inglés', dbLang: 'english' },
              { code: 'fr', name: 'Francés', dbLang: 'french' },
              { code: 'de', name: 'Alemán', dbLang: 'german' },
              ].map((lang) => (
              <Tag
                key={lang.code}
                style={{
                borderRadius: 8,
                padding: '6px 12px',
                backgroundColor: lang.dbLang === expressionFound?.idioma ? '#a5e7a8ff' : '',
                }}
              >
                <span className={`fi fi-${lang.code}`}></span> {lang.name}
              </Tag>
              ))}
            </Space>
          </div>

          {/* Main content: expression */}
          {expressionFound && (
            <>
              <div>
                <Title level={2} style={{ color: '#4c1d95', marginBottom: 6 }}>
                  {expressionFound.expresion}
                </Title>
                <Title level={5} style={{ margin: 0 }}>
                  {expressionFound.equivalente}
                </Title>
                <Paragraph type="secondary" style={{ marginTop: 12 }}>
                  {expressionFound.ejemplo}
                </Paragraph>
              </div>

                {/* <div
                style={{
                  border: '4px solid',
                  borderImage: 'linear-gradient(45deg, #ff6ec4, #7873f5) 1',
                  padding: '16px',
                  borderRadius: '12px', // Added border radius
                }}
                >
                </div> */}
              
            </>
          )}

          {/* Footer buttons */}
              <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap', // Added to allow wrapping on small screens
              }}
              >
              <div style={{ cursor: 'pointer', width: 'auto', marginBottom: 16}} // Added marginBottom for spacing when wrapped
                onClick={() => {
                  setExpressionFound(daily)
                }}
              >
                <Title level={5} style={{ marginBottom: 8, color: '#4c1d95' }}>
                Idiom del día
                </Title>
                  <div
                  style={{
                    border: '1px solid #eaeaec',
                    borderRadius: 8,
                    padding: 12,
                    background: '#f9fafb',
                    width:'100%'
                  }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      justifyContent:'space-between',
                      alignItems: 'center',
                      padding: '1rem'
                      }}>
                      <div>
                        <Text strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>
                          {daily?.expresion}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '0.9rem' }}>
                          {daily?.equivalente}
                        </Text>
                      </div>
                        <div style={{ marginLeft: 8 }}>
                          <RightOutlined />
                        </div>
                    </div>
                  </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection:'column',
                justifyContent: 'flex-end',
                marginBottom: 16 // Added marginBottom for spacing when wrapped
                }} >
                <Button
                  style={{
                    borderRadius: 8,
                    padding: '25px 25px',
                  }}
                  type='primary'
                  onClick={() => {
                    fetchRandom()
                  }}
                  >
                  Idiom aleatorio
                </Button>
                </div>
              </div>
              
        </Card>

        {/* <button onClick={async () => {
          console.log((await apiClient.get('/random')).data)
        }}>test</button> */}
      </Content>
    </Layout>
  );
};

export default Diccionary;