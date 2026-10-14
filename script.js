document.addEventListener('DOMContentLoaded', async () => {
  const productsTableBody = document.getElementById('products-table-body');
  const movementList = document.getElementById('movement-list');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));

  const getStatusClass = (quantidade) => {
    if (quantidade > 20) return 'good';
    if (quantidade > 5) return 'warn';
    return 'alert';
  };

  const getStatusLabel = (quantidade) => {
    if (quantidade > 20) return 'Disponível';
    if (quantidade > 5) return 'Baixo';
    return 'Crítico';
  };

  try {
    const [produtosResponse, movimentacoesResponse] = await Promise.all([
      fetch('/api/produtos'),
      fetch('/api/movimentacoes')
    ]);

    if (!produtosResponse.ok || !movimentacoesResponse.ok) {
      throw new Error('Não foi possível carregar os dados da API.');
    }

    const produtos = await produtosResponse.json();
    const movimentacoes = await movimentacoesResponse.json();

    const estoqueTotal = produtos.reduce((total, produto) => total + Number(produto.quantidade || 0), 0);
    const valorEstoque = produtos.reduce(
      (total, produto) => total + Number(produto.valor || 0) * Number(produto.quantidade || 0),
      0
    );

    const entradas = movimentacoes.filter((mov) => String(mov.tipo).toLowerCase() === 'entrada').length;
    const saidas = movimentacoes.filter((mov) => String(mov.tipo).toLowerCase() === 'saida').length;

    document.getElementById('valor-estoque').textContent = formatCurrency(valorEstoque);
    document.getElementById('itens-ativos').textContent = produtos.length;
    document.getElementById('total-produtos').textContent = produtos.length;
    document.getElementById('total-saidas').textContent = saidas;
    document.getElementById('total-entradas').textContent = entradas;
    document.getElementById('estoque-total').textContent = estoqueTotal;

    movementList.innerHTML = movimentacoes.slice(0, 3).map((movimento) => {
      const tipo = String(movimento.tipo || '').toLowerCase();
      const tipoLabel = tipo === 'entrada' ? 'Entrada' : tipo === 'saida' ? 'Saída' : 'Ajuste';
      const tagClass = tipo === 'entrada' ? 'success' : tipo === 'saida' ? 'danger' : 'warning';
      const data = movimento.datas ? new Date(movimento.datas).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Sem data';

      return `
        <li>
          <div>
            <strong>${tipoLabel} de ${movimento.nome_produto || 'produto'}</strong>
            <span>Quantidade: ${movimento.quantidade}</span>
          </div>
          <div class="movement-meta">
            <span class="tag ${tagClass}">${tipoLabel}</span>
            <time>${data}</time>
          </div>
        </li>
      `;
    }).join('');

    productsTableBody.innerHTML = produtos.slice(0, 4).map((produto) => {
      const statusClass = getStatusClass(Number(produto.quantidade || 0));
      const statusLabel = getStatusLabel(Number(produto.quantidade || 0));

      return `
        <tr>
          <td>${produto.nome}</td>
          <td>${produto.quantidade}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    movementList.innerHTML = `
      <li>
        <div>
          <strong>Erro ao carregar dados</strong>
          <span>${error.message}</span>
        </div>
      </li>
    `;

    productsTableBody.innerHTML = `
      <tr>
        <td colspan="3">Não foi possível consultar os produtos.</td>
      </tr>
    `;
  }
});
