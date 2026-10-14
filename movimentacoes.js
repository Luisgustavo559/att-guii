const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT m.*, p.nome AS nome_produto
    FROM movimentacoes m
    INNER JOIN produtos p ON p.id = m.produtos_id
    ORDER BY m.id DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao consultar movimentações', detalhes: err.message });
    }

    return res.json(results);
  });
});

router.post('/', (req, res) => {
  const { datas, tipo, quantidade, produtos_id } = req.body;

  if (!datas || !tipo || quantidade === undefined || !produtos_id) {
    return res.status(400).json({ erro: 'Preencha datas, tipo, quantidade e produtos_id' });
  }

  connection.query('SELECT * FROM produtos WHERE id = ?', [produtos_id], (err, produtoResultado) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao validar produto', detalhes: err.message });
    }

    if (produtoResultado.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    const produto = produtoResultado[0];
    const quantidadeMovimentada = Number(quantidade);
    const novoEstoque = tipo === 'entrada' ? produto.quantidade + quantidadeMovimentada : produto.quantidade - quantidadeMovimentada;

    if (novoEstoque < 0) {
      return res.status(400).json({ erro: 'Estoque insuficiente para essa saída' });
    }

    connection.query(
      'INSERT INTO movimentacoes (datas, tipo, quantidade, produtos_id) VALUES (?, ?, ?, ?)',
      [datas, tipo, quantidadeMovimentada, produtos_id],
      (erroInsert, result) => {
        if (erroInsert) {
          return res.status(500).json({ erro: 'Erro ao registrar movimentação', detalhes: erroInsert.message });
        }

        connection.query(
          'UPDATE produtos SET quantidade = ? WHERE id = ?',
          [novoEstoque, produtos_id],
          (erroUpdate) => {
            if (erroUpdate) {
              return res.status(500).json({ erro: 'Erro ao atualizar estoque', detalhes: erroUpdate.message });
            }

            return res.status(201).json({
              mensagem: 'Movimentação registrada com sucesso',
              id: result.insertId,
              estoqueAtual: novoEstoque
            });
          }
        );
      }
    );
  });
});

module.exports = router;
