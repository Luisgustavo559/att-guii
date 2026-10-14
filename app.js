const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const produtosRoutes = require('./routes/produtos');
const movimentacoesRoutes = require('./routes/movimentacoes');

app.use('/produtos', produtosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/movimentacoes', movimentacoesRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);

module.exports = app;