import React, { useEffect, useState, useRef } from 'react';

import {
  Button,
  Layout,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  AutoComplete,
  type AutoCompleteProps,
  Spin,
  Skeleton,
  Input,
} from 'antd';
import "/node_modules/flag-icons/css/flag-icons.min.css";

const {Search} = Input

import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import LoginModal from './components/loginModal';
import apiClient from '../../apiClient';
import { useUser } from '../../contexts/UserContext';

import PremiumModal from './components/premiumModal';
import { useLocation, useNavigate } from 'react-router-dom';

import './index.css'
import { fetchExpressionsFull } from '../../helpers/fetchExpresionsFull';

const { Content } = Layout;

const { Title, Text, Paragraph } = Typography;

interface SearchResult {
  ok: boolean,
  rows: { expresion: string }[]
}


interface ExpressionRaw {
  categoria: string,
  ejemplo: string,
  equivalente?: string,
  expresion: string,
  id: number,
  idioma: string,
  uso: string
  idioma_equivalente: string,
  texto_equivalente: string
}

interface Expression {
  categoria: string,
  ejemplo: string,
  // equivalente: string,
  expresion: string,
  id: number,
  idioma: string,
  uso: string,
  equivalencias: {
    [lang: string]: string
  }
}

const langToCode: Record<string, string> = {
  spanish: 'mx',
  english: 'us',
  french: 'fr',
  german: 'de'
}

const Diccionary: React.FC = () => {

  const location = useLocation()
  const state = location.state
  
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [isSearching, setisSearching] = useState(false)
  const [searchTxt, setSearchTxt] = useState<string>('')
  const [expressionFound, setExpressionFound] = useState<Expression | undefined>(() => {
    if (state?.expression) {
      return state.expression;
    }
    return undefined;
  });
  const [daily, setDaily] = useState<Expression>()

  const [searchOptions, setSearchOptions] = useState<Record<string, any>>({})
  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)

  const [isFull, setIsFull] = useState(false)
  const [selectedL, setSelectedL] = useState<{
    code: string,
    name: string,
    dbLang: string
  }>()

  const { user, setUser } = useUser()
  const navigate = useNavigate()


  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShowPremium = () => {
    if (!user) {
      setShowModal(true)
    } else {
      setShowPModal(true)
    }
  }

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

  const fetchRandom = async () => {
    const randomRaw = (await apiClient.get('/random')).data.rows;
    const random = randomRaw.reduce((acc: Expression, curr: ExpressionRaw) => {
      if (!acc.id) {
      acc.id = curr.id;
      acc.expresion = curr.expresion;
      acc.uso = curr.uso;
      acc.ejemplo = curr.ejemplo;
      acc.idioma = curr.idioma;
      acc.categoria = curr.categoria;
      acc.equivalencias = {};
      }
      acc.equivalencias[curr.idioma_equivalente] = curr.texto_equivalente;
      return acc;
    }, { id: 0, expresion: '', uso: '', ejemplo: '', idioma: '', categoria: '', equivalencias: {} });
    setExpressionFound(random)
  }

  useEffect(() => {
    const fetchDaily = async () => {
      const res = await apiClient.get('/daily')
      const mergedDaily = res.data.rows.reduce((acc: Expression, curr: ExpressionRaw) => {
        if (!acc.id) {
          acc.id = curr.id;
          acc.expresion = curr.expresion;
          acc.uso = curr.uso;
          acc.ejemplo = curr.ejemplo;
          acc.idioma = curr.idioma;
          acc.categoria = curr.categoria;
          acc.equivalencias = {};
        }
        acc.equivalencias[curr.idioma_equivalente] = curr.texto_equivalente;
        return acc;
      }, { id: 0, expresion: '', uso: '', ejemplo: '', idioma: '', categoria: '', equivalencias: {} });

      setDaily(mergedDaily);
      console.log(mergedDaily)
      // setDaily(res.data.rows[0])
    }
    fetchDaily()

  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!searchTxt.trim()) {
        return;
      }

      if (searchOptions[searchTxt.toLowerCase()]) {
        const res = await apiClient.get('/expression', {
          params: { expresion: searchTxt }
        });

        if (res.status === 200) {
          const data = res.data.rows as ExpressionRaw[]
          console.log(data)

          
          
          const merged = data.reduce((acc: Expression, curr) => {
            if (!acc.id) {
              acc.id = curr.id;
              acc.expresion = curr.expresion;
              acc.uso = curr.uso;
              acc.ejemplo = curr.ejemplo;
              acc.idioma = curr.idioma;
              acc.categoria = curr.categoria;
              acc.equivalencias = {};
            }
            acc.equivalencias[curr.idioma_equivalente] = curr.texto_equivalente;
            return acc;
          }, { id: 0, expresion: '', uso: '', ejemplo: '', idioma: '', categoria: '', equivalencias: {} });
          
          console.log(merged)
          setExpressionFound(merged);
          
        }
        
        

      } else {
        setExpressionFound(undefined);
      }
    };
    fetchData();
  }, [searchTxt, searchOptions]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', padding: 0, background: '#f5f7fb' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // padding: '48px 16px',
        }}
      >
        <div className={`whiteBox${isFull ? ' fullscreen' : ''}`}
        style={{
          // backgroundColor: 'red'
        }}
        >

          {!isFull ? (<>
            <Card
              style={{
                width: '100%'
              }}
            >
              {/* Header */}
              <Row align="middle" justify="space-between" style={{ marginBottom: 18 }}>
                <Col>
                  <Space align="center">
                    <img src="Elogo_Transparent.png" alt="Elogo" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div style={{ marginBottom: 12 }}>
                      <Title level={4} style={{ margin: 0, color: '#1d216b' }}>
                        EXPRESIONARY
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Beyond speaking
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space wrap style={{ justifyContent: 'center' }}> {/* Added wrap and center alignment */}
                    {!user && (
                      <Text style={{ cursor: 'pointer', padding: '30px' }}
                        onClick={() => setShowModal(true)}
                      >Ingresar</Text>
                    )}
                    {user && (
                      <>
                        <Text>
                          {user.email}
                        </Text>
                        <Button
                          type="default"
                          style={{ borderRadius: 6 }}
                          onClick={() => {
                            // Aquí puedes añadir la lógica de logout
                            localStorage.removeItem('token')
                            setUser(null)
                            // console.log('Logout clicked');
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    )}

                    {user?.role !== 'premium' && (


                      <Button type="primary" style={{ borderRadius: 6 }}
                        onClick={handleShowPremium}
                      >
                        Hazte Premium
                      </Button>
                    )}
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
                    if (debounceTimeout.current) {
                      clearTimeout(debounceTimeout.current as ReturnType<typeof setTimeout>);
                    }
                    debounceTimeout.current = setTimeout(async () => {
                      const res = (await fetchExpressions(text)) as SearchResult;
                      // console.log(res);
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
                    }, 500) as unknown as ReturnType<typeof setTimeout>;
                  }}
                  popupRender={(e) => (isSearching ? <Spin style={{ width: "100%" }} /> : e)}
                  placeholder="Busca un idiom, jerga o proverbio"
                >
                </AutoComplete>
              </div>


              {/* Language chips */}
              <div style={{ marginBottom: 0 }}>
                <Space wrap>
                  {[
                    { code: 'us', name: 'Inglés', dbLang: 'english' },
                    { code: 'fr', name: 'Francés', dbLang: 'french' },
                    { code: 'de', name: 'Alemán', dbLang: 'german' },
                    { code: 'mx', name: 'Español', dbLang: 'spanish' }
                  ].map((lang) => (
                    <Tag
                      key={lang.code}
                      style={{
                        borderRadius: 8,
                        padding: '6px 12px',
                        backgroundColor: lang.dbLang === expressionFound?.idioma ? '#a5e7a8ff' : '',
                        cursor: 'pointer'
                      }}
                      onClick={async () => {
                        setSelectedL(lang)
                        setIsFull(true)
                        const data = await fetchExpressionsFull(lang.dbLang) as ExpressionRaw[]
                        const acc: any = {}

                        data.forEach((item) => {
                           if (!acc[item.id]) {
                              acc[item.id] = {
                                id: item.id,
                                expresion: item.expresion,
                                uso: item.uso,
                                ejemplo: item.ejemplo,
                                idioma: item.idioma,
                                categoria: item.categoria,
                                equivalente: item.equivalente,
                                equivalencias: {}
                              }
                            }
                            acc[item.id].equivalencias[item.idioma_equivalente] = item.texto_equivalente
                        })
                        console.log(Object.values(acc))
                        if (data) {
                            navigate(`/list/${lang.dbLang}`, {
                            state: {
                              expressions: (Object.values(acc) as Expression[]).sort((a: Expression, b: Expression) =>
                              a.expresion.localeCompare(b.expresion)
                              )
                            }
                            })
                        }
                        
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
                    <Title level={2} style={{ color: '#a557c6', marginBottom: 6 }}>
                      {expressionFound.expresion}
                    </Title>
                    <div>
                      {Object.entries(expressionFound.equivalencias || {}).map(([lang, translation]) => (
                      <div key={lang} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span className={`fi fi-${langToCode[lang]}`} style={{ marginRight: 8 }}></span>
                        <Title level={5} style={{ margin: 0 }}>
                        {translation}
                        </Title>
                      </div>
                      ))}
                    </div>
                    <Paragraph type="secondary" style={{ marginTop: 12 }}>
                      {expressionFound.ejemplo}
                    </Paragraph>
                  </div>

                  {user?.role !== 'premium' && (
                    <div
                      style={{
                        marginTop: 24,
                        padding: 16,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 8,
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <Title level={5} style={{ marginBottom: 8 }}>
                        ¡Conviértete en Premium!
                      </Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        Desbloquea más expresiones, ejemplos y contenido exclusivo.
                      </Text>
                      <Button
                        type="primary"
                        style={{ borderRadius: 6 }}
                        onClick={handleShowPremium}
                      >
                        Hazte Premium
                      </Button>
                    </div>
                  )}
                  {user?.role === 'premium' && (
                    <>
                      <Row style={{ marginTop: 5 }}>
                        <Col span={24}>
                          <Title level={5} style={{ marginBottom: 8, color: '#a557c6' }}>
                            Tipo de expresión:
                          </Title>
                          <Text>{expressionFound?.categoria}</Text>
                        </Col>
                      </Row>
                      <Row style={{ marginTop: 5 }}>
                        <Col span={24}>
                          <Title level={5} style={{ marginBottom: 8, color: '#a557c6' }}>
                            Uso:
                          </Title>
                          <Text>{expressionFound?.uso}</Text>
                        </Col>
                      </Row>
                    </>
                  )}


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
                <div style={{ width: 'auto', marginBottom: 16 }} // Added marginBottom for spacing when wrapped
                >
                  <Title level={5} style={{ marginBottom: 8, color: '#a557c6' }}>
                    Idiom del día
                  </Title>
                  <div
                    style={{
                      border: '1px solid #eaeaec',
                      borderRadius: 8,
                      padding: 12,
                      background: '#f9fafb',
                      width: '100%',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setExpressionFound(daily)
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>
                          {daily?.expresion}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '0.9rem' }}>
                          {daily?.equivalencias?.spanish}
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
                  flexDirection: 'column',
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
          </>) : (
            <div className="expandedContent">
                <div style={{ padding: 16 }}>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <button
                      onClick={() => window.history.back()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        color: '#1d216b',
                        cursor: 'pointer',
                        fontSize: 16,
                        padding: 0,
                      }}
                    >
                      <LeftOutlined />
                      <span>Back</span>
                    </button>
                  </div>
                  
                  {/* Header: Selected language with flag and title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`fi fi-${selectedL?.code}`} style={{ fontSize: 24 }}></span>
                      <Title level={2} style={{ margin: 0, color: '#1d216b' }}>
                        {selectedL?.name}
                      </Title>
                    </div>
                    <Skeleton.Button active size="small" />
                  </div>

                  {/* Search bar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                    <Search
                      placeholder="Buscar por expresión, traducción o ejemplo"
                      allowClear
                      size="large"
                      style={{ flex: 1 }}
                    />
                  </div>



                  {/* Loading spinner */}
                    {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, height: '100%' }}>
                    <Spin size="large" />
                    </div> */}
                  
                  <Skeleton paragraph/>
                  <Skeleton paragraph/>
                  <Skeleton paragraph/>
                  
                </div>
            </div>
          )}
        </div>

        {/* <button onClick={async () => {
          console.log((await getProfile()))
        }}>test</button> */}
      </Content>
      <LoginModal
        visible={showModal}
        onClose={() => { setShowModal(false) }}
      />

      <PremiumModal
        open={showPModal}
        handleClose={() => { setShowPModal(false) }}
      />

    </Layout>
  );
};

export default Diccionary;