import express, { Request, Response } from 'express'

const app = express()

app.get('/test', (req: Request, res: Response) => {
    res.json({msg: 'hi from backend'})
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});