import React, { useEffect, useState } from "react";
import "./VisualizarEstoque.css";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import { listarAlmoxarifadosEstoque } from "../../../services/almoxarifadoEstoqueService";
import { listarProdutos } from "../../../services/produtoService";
import { formatarUnidadeMedida } from "../../../utils/unidadeMedida";

const VisualizarEstoque = () => {
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [almoxarifadosEstoque, setAlmoxarifadosEstoque] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [paginaProdutoAtual, setPaginaProdutoAtual] = useState(1);
  const itensPorPaginaProduto = 10;
  const [estoqueAberto, setEstoqueAberto] = useState(false);
  const [somenteComSaldo, setSomenteComSaldo] = useState(false);

  const mostrarMensagem = (texto, tipo) => {
    const id = `${Date.now()}-${Math.random()}`;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      { id, texto, tipo },
    ]);

    setTimeout(() => {
      setMensagens((mensagensAtuais) =>
        mensagensAtuais.filter((mensagem) => mensagem.id !== id),
      );
    }, 3000);
  };

  useEffect(() => {
    const carregarAlmoxarifados = async () => {
      try {
        const response = await listarAlmoxarifados();
        setAlmoxarifados(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar almoxarifados", "erro");
      }
    };

    carregarAlmoxarifados();
  }, []);

  useEffect(() => {
    const carregarAlmoxarifadosEstoque = async () => {
      try {
        const response = await listarAlmoxarifadosEstoque();
        setAlmoxarifadosEstoque(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar estoque", "erro");
      }
    };

    carregarAlmoxarifadosEstoque();
  }, []);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const response = await listarProdutos();
        setProdutos(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar produtos", "erro");
      }
    };

    carregarProdutos();
  }, []);

  const almoxarifadosFiltrados = almoxarifados.filter((almoxarifado) => {
    const buscaFormatada = busca.toLowerCase();

    return (
      almoxarifado.nome.toLowerCase().includes(buscaFormatada) ||
      String(almoxarifado.id).includes(buscaFormatada)
    );
  });

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;

  const almoxarifadosPaginados = almoxarifadosFiltrados.slice(
    indiceInicial,
    indiceFinal,
  );

  const totalPaginas = Math.ceil(
    almoxarifadosFiltrados.length / itensPorPagina,
  );
  const inicioExibido =
    almoxarifadosFiltrados.length > 0 ? indiceInicial + 1 : 0;
  const fimExibido = Math.min(indiceFinal, almoxarifadosFiltrados.length);

  const handlePrimeiraPagina = () => {
    setPaginaAtual(1);
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleRecarregar = () => {
    setBusca("");
    setAlmoxarifadoSelecionado(null);
    setPaginaAtual(1);
  };

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const handleUltimaPagina = () => {
    setPaginaAtual(totalPaginas);
  };

  const handleVisualizarAlmoxarifado = (
    almoxarifado = almoxarifadoSelecionado,
  ) => {
    if (!almoxarifado) {
      mostrarMensagem("Selecione um almoxarifado", "erro");
      return;
    }

    setAlmoxarifadoSelecionado(almoxarifado);
    setBuscaProduto("");
    setPaginaProdutoAtual(1);
    setEstoqueAberto(true);
  };

  const produtosDoAlmoxarifado = almoxarifadosEstoque.filter((item) => {
    return item.almoxarifadoId === almoxarifadoSelecionado?.id;
  });

  const produtosComUnidadeFormatada = produtosDoAlmoxarifado.map((item) => {
    const produtoRelacionado = produtos.find(
      (produto) => produto.id === item.produtoId,
    );

    return {
      ...item,
      unidadeFormatada: formatarUnidadeMedida(
        item.unidadeMedida || produtoRelacionado?.unidadeMedida,
      ),
    };
  });

  const produtosFiltrados = produtosComUnidadeFormatada.filter((item) => {
    const buscaFormatada = buscaProduto.toLowerCase();

    return (
      String(item.produtoNome || item.nome || "")
        .toLowerCase()
        .includes(buscaFormatada) ||
      String(item.produtoId || item.id).includes(buscaFormatada)
    );
  });

  const produtosExibidos = somenteComSaldo
  ? produtosFiltrados.filter((item) => (item.saldo ?? item.quantidade ?? 0) > 0)
  : produtosFiltrados;

  const indiceInicialProduto = (paginaProdutoAtual - 1) * itensPorPaginaProduto;
  const indiceFinalProduto = indiceInicialProduto + itensPorPaginaProduto;

  const produtosPaginados = produtosExibidos.slice(
    indiceInicialProduto,
    indiceFinalProduto,
  );

  const totalPaginasProduto = Math.ceil(
    produtosExibidos.length / itensPorPaginaProduto,
  );
  const inicioExibidoProduto =
    produtosExibidos.length > 0 ? indiceInicialProduto + 1 : 0;
  const fimExibidoProduto = Math.min(
    indiceFinalProduto,
    produtosExibidos.length,
  );

  const handlePrimeiraPaginaProduto = () => {
    setPaginaProdutoAtual(1);
  };

  const handlePaginaAnteriorProduto = () => {
    if (paginaProdutoAtual > 1) {
      setPaginaProdutoAtual(paginaProdutoAtual - 1);
    }
  };

  const handleRecarregarProduto = () => {
    setBuscaProduto("");
    setPaginaProdutoAtual(1);
  };

  const handleProximaPaginaProduto = () => {
    if (paginaProdutoAtual < totalPaginasProduto) {
      setPaginaProdutoAtual(paginaProdutoAtual + 1);
    }
  };

  const handleUltimaPaginaProduto = () => {
    setPaginaProdutoAtual(totalPaginasProduto);
  };

  return (
    <div className="estoque-view">
      <div className="estoque-view-header">
        <h1>Visualizar Estoque</h1>
        <p>Visualize os almoxarifados vinculados ao sistema</p>
      </div>

      <div className="estoque-view-actions">
        <input
          type="text"
          placeholder="Buscar por ID ou Nome..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
        <button
          className="select"
          onClick={() => handleVisualizarAlmoxarifado()}
        >
          Selecionar
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            onClick={handlePrimeiraPagina}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
          >
            <FiChevronLeft />
          </button>
          <button className="refresh" onClick={handleRecarregar}>
            <FiRefreshCw />
          </button>
          <button
            className="next"
            onClick={handleProximaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            onClick={handleUltimaPagina}
            disabled={totalPaginas === 0 || paginaAtual === totalPaginas}
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibido} - ${fimExibido} / ${almoxarifadosFiltrados.length}`}
          </span>
        </div>
      </div>

      <div className="estoque-view-card">
        <div className="estoque-view-table-wrapper">
          <table className="estoque-view-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {almoxarifadosPaginados.map((almoxarifado) => (
                <tr
                  key={almoxarifado.id}
                  className={
                    almoxarifadoSelecionado?.id === almoxarifado.id
                      ? "selected-row"
                      : ""
                  }
                  onClick={() => setAlmoxarifadoSelecionado(almoxarifado)}
                  onDoubleClick={() =>
                    handleVisualizarAlmoxarifado(almoxarifado)
                  }
                >
                  <td>{almoxarifado.id}</td>
                  <td>{almoxarifado.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {estoqueAberto && almoxarifadoSelecionado && (
        <div className="estoque-overlay">
          <div className="estoque-modal-box">
            <div className="estoque-modal-header">
              <h2>{almoxarifadoSelecionado.nome}</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setEstoqueAberto(false)}
              >
                X
              </button>
            </div>

            <div className="estoque-view-actions estoque-view-products-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome do produto..."
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setPaginaProdutoAtual(1);
                }}
              />
              <label className="saldo-checkbox saldo-checkbox-inline">
                <input
                  type="checkbox"
                  checked={!somenteComSaldo}
                  onChange={(e) => {
                    setSomenteComSaldo(!e.target.checked);
                    setPaginaProdutoAtual(1);
                  }}
                />
                <span>Exibir saldo zero</span>
              </label>
              <div className="pagination-controls">
                <button
                  className="first"
                  onClick={handlePrimeiraPaginaProduto}
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  className="previous"
                  onClick={handlePaginaAnteriorProduto}
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button className="refresh" onClick={handleRecarregarProduto}>
                  <FiRefreshCw />
                </button>
                <button
                  className="next"
                  onClick={handleProximaPaginaProduto}
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  className="last"
                  onClick={handleUltimaPaginaProduto}
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoProduto} - ${fimExibidoProduto} / ${produtosExibidos.length}`}
                </span>
              </div>
            </div>

            <div className="estoque-view-table-wrapper">
              <table className="estoque-view-table estoque-products-table">
                <thead>
                  <tr>
                    <th>ID Produto</th>
                    <th>Produto</th>
                    <th>Unidade</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosPaginados.length > 0 ? (
                    produtosPaginados.map((item, index) => (
                      <tr key={`${item.produtoId || item.id}-${index}`}>
                        <td>{item.produtoId || item.id}</td>
                        <td>{item.produtoNome || item.nome}</td>
                        <td>{item.unidadeFormatada || "-"}</td>
                        <td>{item.saldo ?? item.quantidade ?? 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        Nenhum produto encontrado para este almoxarifado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualizarEstoque;
