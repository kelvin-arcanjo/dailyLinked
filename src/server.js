const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('src/public'));

app.get('/', (req, res) => {
    res.send({ status: 'LinkedPulse API is running ' });
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});