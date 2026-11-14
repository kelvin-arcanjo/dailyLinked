const express = require('express');
require('dotenv').config();
const { redirectToLinkedIn, handleLinkedInCallback } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('src/public'));

app.get('/', (req, res) => {
    res.send({ status: 'dailyLinked API is running ' });
});

// Auth Routes...
app.get('/auth/linkedin', redirectToLinkedIn);
app.get('/auth/linkedin/callback', handleLinkedInCallback);

// Server entry point...
app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
});
    
