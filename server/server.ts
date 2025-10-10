import express, { Request, Response } from 'express'
import cors from 'cors'
import { query, ping } from './db'

const app = express()

// Enable CORS
app.use(cors({
    origin: ['https://www.expresionary.com.mx', 'http://localhost:5173'], // Replace with your frontend's origins
}))

app.get('/test', (req: Request, res: Response) => {
    res.json({msg: 'hi from backend'})
})

// simple endpoint that runs a small query against MySQL
app.get('/dbtest', async (req: Request, res: Response) => {
    try {
        // ensure pool can connect
        await ping()
        // try a trivial query
        const rows = await query('SELECT * FROM expresiones WHERE idioma = "french"')
        res.json({ok: true, rows})
    } catch (err: any) {
        console.error('DB test failed', err)
        res.status(500).json({ok: false, error: err.message || String(err)})
    }
})

app.get('/search', async (req: Request, res: Response) => {
    const search = req.query.search as string;

    if (!search) {
        return res.status(400).json({ ok: false, error: 'Missing search query parameter' });
    }

    try {
        const rows = await query('SELECT expresion FROM expresiones WHERE expresion LIKE ?', [`%${search}%`]);
        res.json({ ok: true, rows });
    } catch (err: any) {
        console.error('Search query failed', err);
        res.status(500).json({ ok: false, error: err.message || String(err) });
    }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});