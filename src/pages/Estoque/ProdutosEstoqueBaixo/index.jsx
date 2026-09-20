import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { listarEstoquesBaixos } from "../../../services/almoxarifadoEstoqueService";
import "./ProdutosEstoqueBaixo.css";

const ProdutosEstoqueBaixo = () => {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregarProdutos = async () => {
    setCarregando(true);

    try {
      const response = await listarEstoquesBaixos();
      setProdutos(response.data);
      setMensagemErro("");
    } catch (error) {
      setProdutos([]);
      setMensagemErro(
        error.response?.data?.message ||
          "Não foi possível carregar os produtos com estoque baixo.",
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase();

    return (
      produto.produtoNome.toLowerCase().includes(termo) ||
      String(produto.produtoId).includes(termo) ||
      produto.almoxarifadoNome.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="produtos-estoque-baixo-page">
      <div className="produtos-estoque-baixo-header">
        <div>
          <h1>Produtos com estoque baixo</h1>
          <p>
            Consulte os produtos abaixo ou no limite do estoque mínimo.
          </p>
        </div>

        <button
          type="button"
          className="produtos-estoque-baixo-refresh"
          onClick={carregarProdutos}
          disabled={carregando}
        >
          <FiRefreshCw />
          Atualizar
        </button>
      </div>

      <div className="produtos-estoque-baixo-card">
        <div className="produtos-estoque-baixo-toolbar">
          <input
            type="text"
            placeholder="Buscar por produto, ID ou almoxarifado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <span>{produtosFiltrados.length} produto(s)</span>
        </div>

        {mensagemErro ? (
          <p className="estoque-baixo-message estoque-baixo-message-error">
            {mensagemErro}
          </p>
        ) : carregando ? (
          <p className="estoque-baixo-message">Carregando estoque baixo...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="estoque-baixo-message">
            Nenhum produto com estoque baixo.
          </p>
        ) : (
          <div className="produtos-estoque-baixo-table-wrapper">
            <table className="produtos-estoque-baixo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Quantidade atual</th>
                  <th>Estoque mínimo</th>
                  <th>Almoxarifado principal</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={`${produto.produtoId}-${produto.almoxarifadoId}`}>
                    <td>{produto.produtoId}</td>
                    <td>{produto.produtoNome}</td>
                    <td>{produto.quantidadeAtual}</td>
                    <td>{produto.estoqueMinimo}</td>
                    <td>{produto.almoxarifadoNome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutosEstoqueBaixo;