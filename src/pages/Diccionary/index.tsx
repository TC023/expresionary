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

  const [searchOptions, setSearchOptions] = useState<Record<string, any>>({})
  
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

  let debounceTimeout: ReturnType<typeof setTimeout>;

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
          <div style={{ padding: ' 0 ' }}>
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
          )}

          {/* Footer buttons */}
          {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <Button style={{ borderRadius: 8, background: '#f3f4f6', borderColor: '#f3f4f6' }}>
              Ver expresiones relacionadas
            </Button>
            <Button type="primary" style={{ borderRadius: 8, background: '#10b981', borderColor: '#10b981' }}>
              Hazte Premium
            </Button>
          </div> */}
        </Card>

        {/* <button onClick={async () => {
          console.log(expressionFound)
        }}>test</button> */}
      </Content>
    </Layout>
  );
};

export default Diccionary;