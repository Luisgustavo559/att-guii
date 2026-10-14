DROP DATABASE IF EXISTS mydb;

CREATE DATABASE mydb
DEFAULT CHARACTER SET utf8mb4;

USE mydb;

-- ========================================
-- TABELA PRODUTOS
-- ========================================

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL
);

-- ========================================
-- TABELA MOVIMENTACOES
-- ========================================

CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    datas DATE NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    produtos_id INT NOT NULL,

    CONSTRAINT fk_movimentacoes_produtos
    FOREIGN KEY (produtos_id)
    REFERENCES produtos(id)
);

-- ========================================
-- CADASTRAR PRODUTOS
-- ========================================

INSERT INTO produtos
(nome, valor, quantidade, categoria, unidade_medida)
VALUES
('Bodysplash', 20.00, 12, 'Produto de beleza', 'Litro'),
('Moletom', 50.00, 10, 'Roupa', 'Unidade'),
('Batom', 10.00, 20, 'Produto de beleza', 'Unidade');

-- ========================================
-- CADASTRAR MOVIMENTACOES
-- ========================================

INSERT INTO movimentacoes
(datas, tipo, quantidade, produtos_id)
VALUES
('2026-05-10', 'entrada', 10, 1),
('2026-05-12', 'saida', 5, 1),
('2026-05-15', 'entrada', 20, 2),
('2026-05-20', 'saida', 10, 2),
('2026-05-22', 'saida', 4, 3);

-- ========================================
-- VIEW ESTOQUE
-- ========================================

CREATE VIEW vw_estoque AS
SELECT
    id,
    nome,
    categoria,
    quantidade,
    valor,
    quantidade * valor AS valor_total
FROM produtos;

-- ========================================
-- CONSULTAS
-- ========================================

SELECT * FROM produtos;

SELECT * FROM movimentacoes;

SELECT * FROM vw_estoque;