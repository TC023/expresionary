"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const app = (0, express_1.default)();
// Enable CORS
app.use((0, cors_1.default)({
    origin: ['https://www.expresionary.com.mx', 'https://expresionary.com.mx', 'http://localhost:5173'], // Include all relevant origins
}));
// Middleware to parse JSON bodies
app.use(express_1.default.json());
const SECRET = 'HALLO, There once was a ship that put to sea';
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        res.status(401).json({ message: "Missing token" });
        return;
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
}
app.get('/api/test', (req, res) => {
    res.json({ msg: 'hi from backend' });
});
// simple endpoint that runs a small query against MySQL
app.get('/api/dbtest', async (req, res) => {
    try {
        // ensure pool can connect
        await (0, db_1.ping)();
        // try a trivial query
        const rows = await (0, db_1.query)('SELECT * FROM expresiones WHERE idioma = "french"');
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('DB test failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get('/api/search', async (req, res) => {
    const search = req.query.search;
    if (!search) {
        return res.status(400).json({ ok: false, error: 'Missing search query parameter' });
    }
    try {
        const rows = await (0, db_1.query)('SELECT expresion, equivalente FROM expresiones WHERE expresion LIKE ? OR equivalente LIKE ? LIMIT 5', [`%${search}%`, `%${search}%`]);
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('Search query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get('/api/expression', async (req, res) => {
    const expresion = req.query.expresion;
    if (!expresion) {
        return res.status(400).json({ ok: false, error: 'Missing expresion query parameter' });
    }
    try {
        const rows = await (0, db_1.query)(`
            SELECT 
            e.id,
            e.expresion,
            e.uso,
            e.ejemplo,
            e.idioma,
            e.categoria,
            eq.idioma AS idioma_equivalente,
            eq.texto_equivalente
        FROM expresiones e
        JOIN equivalencias eq ON eq.expresion_id = e.id
        WHERE e.expresion = ?;
            `, [expresion]);
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('Expression query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get('/api/daily', async (req, res) => {
    try {
        const rows = await (0, db_1.query)(`
SELECT 
    e.id,
    e.expresion,
    e.uso,
    e.ejemplo,
    e.idioma,
    e.categoria,
    eq.idioma AS idioma_equivalente,
    eq.texto_equivalente
FROM daily_idiom AS di
JOIN expresiones AS e 
    ON di.expresion_id = e.id
LEFT JOIN equivalencias AS eq 
    ON eq.expresion_id = e.id
WHERE di.selected_date = CURDATE();
`);
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('Daily query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get('/api/random', async (req, res) => {
    try {
        const rows = await (0, db_1.query)(`
SELECT 
    e.id,
    e.expresion,
    e.uso,
    e.ejemplo,
    e.idioma,
    e.categoria,
    eq.idioma AS idioma_equivalente,
    eq.texto_equivalente
FROM (
    SELECT * 
    FROM expresiones 
    ORDER BY RAND() 
    LIMIT 1
) AS e
LEFT JOIN equivalencias AS eq 
    ON eq.expresion_id = e.id;
`);
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('Random query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.post('/api/users/new', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Missing required fields: username, email, or password' });
    }
    try {
        const result = await (0, db_1.query)(`INSERT INTO usuario ( email, pass, role) VALUES (?, ?, 'base')`, [email, password]);
        const userId = result.insertId; // Assuming insertId is returned by the query function
        const token = jsonwebtoken_1.default.sign({ id: userId, email }, SECRET, { expiresIn: "1d" });
        res.json({ ok: true, token });
    }
    catch (err) {
        console.error('User creation failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Missing email or password' });
    }
    try {
        const rows = await (0, db_1.query)('SELECT * FROM usuario WHERE email = ? ', [email]);
        const user = rows[0];
        if (user.pass !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1d" });
        res.json({ token });
    }
    catch (err) {
        console.error('Login failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get("/api/profile", authMiddleware, async (req, res) => {
    const rows = await (0, db_1.query)("SELECT id, email, role FROM usuario WHERE id = ?", [req.user.id]);
    // console.log(rows)
    res.status(200).json(rows[0]);
});
app.get('/api/users/upgrade', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await (0, db_1.query)('UPDATE usuario SET role = ? WHERE id = ?', ['premium', userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, error: 'User not found' });
        }
        res.json({ ok: true, message: 'User role updated to premium' });
    }
    catch (err) {
        console.error('Upgrade to premium failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
app.get('/api/expressions', async (req, res) => {
    const language = req.query.language;
    if (!language) {
        return res.status(400).json({ ok: false, error: 'Missing language query parameter' });
    }
    try {
        const rows = await (0, db_1.query)(`
    SELECT 
        e.id,
        e.expresion,
        e.uso,
        e.ejemplo,
        e.idioma,
        e.categoria,
        e.equivalente,
        eq.idioma AS idioma_equivalente,
        eq.texto_equivalente
    FROM expresiones AS e
    LEFT JOIN equivalencias AS eq 
        ON eq.expresion_id = e.id
    WHERE e.idioma = ?
    ORDER BY e.expresion ASC;
    `, [language]);
        res.json({ ok: true, rows });
    }
    catch (err) {
        console.error('Expressions query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
