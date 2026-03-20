import 'dotenv/config.js';
import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(json());

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Hello BlockChain! Backend is running with Auth setup.');
}); 

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});