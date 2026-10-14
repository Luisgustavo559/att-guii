const express = require('express');
const router = express.Router();
const connection = require('../db');

router.get('/', (req, res) => {
  connection.query('SELECT * FROM produtos ORDER BY id', (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao consultar produtos', detalhes: err.message });
    }

    return res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  connection.query('SELECT * FROM produtos WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar produto', detalhes: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    return res.json(results[0]);
  });
});

router.post('/', (req, res) => {
  const { nome, valor, quantidade, categoria, unidade_medida } = req.body;

  if (!nome || valor === undefined || quantidade === undefined || !categoria || !unidade_medida) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
  }

  connection.query(
    'INSERT INTO produtos (nome, valor, quantidade, categoria, unidade_medida) VALUES (?, ?, ?, ?, ?)',
    [nome, Number(valor), Number(quantidade), categoria, unidade_medida],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhes: err.message });
      }

      return res.status(201).json({
        mensagem: 'Produto cadastrado com sucesso',
        id: result.insertId
      });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, valor, quantidade, categoria, unidade_medida } = req.body;

  if (!nome && valor === undefined && quantidade === undefined && !categoria && !unidade_medida) {
    return res.status(400).json({ erro: 'Informe pelo menos um campo para atualizar' });
  }

  const campos = [];
  const valores = [];

  if (nome) {
    campos.push('nome = ?');
    valores.push(nome);
  }

  if (valor !== undefined) {
    campos.push('valor = ?');
    valores.push(Number(valor));
  }

  if (quantidade !== undefined) {
    campos.push('quantidade = ?');
    valores.push(Number(quantidade));
  }

  if (categoria) {
    campos.push('categoria = ?');
    valores.push(categoria);
  }

  if (unidade_medida) {
    campos.push('unidade_medida = ?');
    valores.push(unidade_medida);
  }

  valores.push(id);

  connection.query(
    `UPDATE produtos SET ${campos.join(', ')} WHERE id = ?`,
    valores,
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao atualizar produto', detalhes: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }

      return res.json({ mensagem: 'Produto atualizado com sucesso' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM produtos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir produto', detalhes: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    return res.json({ mensagem: 'Produto removido com sucesso' });
  });
});

module.exports = router;
