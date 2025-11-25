import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Input, Select, Tooltip, Empty, Spin, Typography } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchExpressionsFull } from '../../helpers/fetchExpresionsFull';
import { LeftOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

import './index.css'

export interface Expression {
    id: string;
    expresion: string;
    equivalente: string;
    ejemplo: string;
}

// Datos de ejemplo para desarrollo — reemplazar por fetch real en producción

/**
 * Main page component for displaying a list of expressions.
 * It manages language settings and fetches expression data.
 */
export default function ExpresionsListPage() {
    const LANGS = [
        { code: 'us', name: 'Inglés', dbLang: 'english' },
        { code: 'fr', name: 'Francés', dbLang: 'french' },
        { code: 'de', name: 'Alemán', dbLang: 'german' },
        { code: 'mx', name: 'Español', dbLang: 'spanish' }
    ];

    const params = useParams()
    const navigate = useNavigate()

    const [language, setLanguage] = useState<string>(() => {
        if (params.lang) {
            const match = LANGS.find(l => l.dbLang === params.lang);
            if (match) {
                return match.dbLang;
            }
        }
        return 'english';
    });
    const currentLang = LANGS.find((l) => l.dbLang === language) ?? LANGS[0];
    const [data, setData] = useState<Expression[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [current, setCurrent] = useState(1);
    const [size, setSize] = useState('full')
    const [selected, setSelected] = useState<Expression>()

    // If expressions were provided via location.state, avoid doing network fetches
    const fromStateRef = useRef(false);

    const location = useLocation()
    const state = location.state


    useEffect(() => {
/**
 * Async function triggered on language change to fetch new expressions data.
 */
/**
 * Async function to fetch expressions data based on the current language settings.
 * Sets data based on location state or performs an API call.
 */
        const fetchData = async () => {
            if (state?.expressions) {
                setData(state.expressions);
                fromStateRef.current = true;
            } else {
                setLoading(true);
                const res = await fetchExpressionsFull(language);
                if (res) {
                    setLoading(false);
                    setData(res);
                }
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // If expressions originated from location.state, skip fetching on language changes
        if (fromStateRef.current) return;

        const fetchData = async () => {
            setLoading(true);
            const res = await fetchExpressionsFull(language);
            if (res) {
                setData(res)
            }
            setLoading(false)
        }

        fetchData()

    }, [language]);

    useEffect(() => {
        if (selected) {

            setSize('small')
            setTimeout(() => {
                navigate('/', {
                    state: {
                        expression: selected
                    }
                })
            }, 400)
            console.log(selected)
        }
    }, [selected])


/**
 * Memoized function that filters expressions data based on search text.
 * Returns filtered rows and total count.
 */
    const filtered = useMemo(() => {
        const f = data.filter((d) => {
            if (searchText) {
                const q = searchText.toLowerCase();
                const inText = d.expresion.toLowerCase().includes(q) || (d.equivalente ?? '').toLowerCase().includes(q) || (d.ejemplo ?? '').toLowerCase().includes(q);
                if (!inText) return false;
            }
            return true;
        });
        return { total: f.length, rows: f };
    }, [data, searchText, current]);

    const columns = [
        {
            title: 'Expresión',
            dataIndex: 'expresion',
            key: 'text',
            render: (text: string, record: Expression) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#1d216b', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                            setSelected(record)
                        }}
                    >{text}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{record.equivalente}</div>
                </div>
            ),
            sorter: (a: Expression, b: Expression) => a.expresion.localeCompare(b.expresion),
        },
        {
            title: 'Ejemplo',
            dataIndex: 'ejemplo',
            key: 'example',
            render: (example: string) => (
                <Tooltip title={example}>
                    <span style={{ display: 'inline-block', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{example}</span>
                </Tooltip>
            ),
        },
    ];

    return (
        <div style={{
            display: 'flex',
            backgroundColor: '#f5f7fb',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <div style={{
                padding: 16,
            }}
                className={`contentBox ${size}`}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <button
                        onClick={() => {
                            setSize('small')
                            setTimeout(() => {
                                navigate(`/`)
                            }, 400)
                        }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`fi fi-${currentLang.code}`}></span>
                        <Title level={1} style={{ margin: 0, color: '#1d216b' }}>{currentLang.name}</Title>
                    </div>
                    <div>
                        <Select value={language} onChange={(v) => setLanguage(v)} style={{ width: 180 }}>
                            {LANGS.map((l) => (
                                <Option key={l.dbLang} value={l.dbLang}><span className={`fi fi-${l.code}`} /> {l.name}</Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                    <Search
                        placeholder="Buscar por expresión, traducción o ejemplo"
                        allowClear
                        onSearch={(v) => { setSearchText(v); setCurrent(1); }}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 420 }}
                        value={searchText}
                    />

                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                ) : filtered.total === 0 ? (
                    <Empty description="No se encontraron expresiones" />
                ) : (
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filtered.rows}
                        pagination={false}
                    />
                )}

            </div>
        </div>

    );
}
