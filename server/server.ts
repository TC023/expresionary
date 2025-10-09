import express, { Request, Response } from 'express'
import { query, ping } from './db'

const app = express()

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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});