import React, { useState, useEffect } from "react";
import "./ItensDetalhe.css";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiArrowLeft,
} from "react-icons/fi";
import { IMaskInput } from "react-imask";
import { useNavigate, useParams } from "react-router-dom";
import { listarProdutos } from "../../../services/produtoService";
import { formatarUnidadeMedida } from "../../../utils/unidadeMedida";
import {
  cadastrarEntradaItem,
  listarEntradaItens,
  deletarEntradaItem,
  atualizarEntradaItem,
} from "../../../services/entradaItemService";

const movimentacaoInicial = {
  idMov: "",
  idProduto: "",
  produtoNome: "",
  quantidade: "",
  unidade: "",
  valorUnitario: "",
  valorTotal: "",
};

const ItensDetalhe = () => {
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacao, setMovimentacao] = useState({ ...movimentacaoInicial });
  const [movimentacaoSalva, setMovimentacaoSalva] = useState(false);
  const [seletorProdutoAberto, setSeletorProdutoAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [paginaEntradaItensAtual, setPaginaEntradaItensAtual] = useState(1);
  const [paginaProdutoAtual, setPaginaProdutoAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [ordenacaoProduto, setOrdenacaoProduto] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const itensPorPaginaEntrada = 10;
  const itensPorPaginaProduto = 10;
  const [produtos, setProdutos] = useState([]);
  const [entradaItens, setEntradaItens] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const entradaItensFiltrados = entradaItens;

  const handleOrdenar = (coluna) => {
    setOrdenacao((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  useEffect(() => {
    carregarEntradaItens();
  }, [id]);

  const carregarEntradaItens = async () => {
    try {
      const response = await listarEntradaItens();
      const itensDaEntrada = response.data.filter((item) => {
        return item.entradaEstoqueId === Number(id);
      });
      setEntradaItens(itensDaEntrada);
    } catch (error) {
      mostrarMensagem("Erro ao listar Entrada Itens", "erro");
    }
  };

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await listarProdutos();
        setProdutos(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar produtos", "erro");
      }
    };
    buscarProdutos();
  }, []);

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

  const formatarPrecoParaInput = (preco) => {
    if (preco == null || preco === "") return "";
    return Number(preco).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatarMoeda = (valor) => {
    if (valor == null || valor === "") return "";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleSalvarMovimentacao = async () => {
    if (!movimentacao.idProduto || !movimentacao.produtoNome) {
      mostrarMensagem("Selecione um produto", "erro");
      return;
    }

    if (!movimentacao.quantidade) {
      mostrarMensagem("Informe a quantidade", "erro");
      return;
    }

    if (!movimentacao.valorUnitario) {
      mostrarMensagem("Informe o valor unitario", "erro");
      return;
    }

    const payload = {
      entradaEstoqueId: Number(id),
      produtoId: Number(movimentacao.idProduto),
      quantidade: Number(movimentacao.quantidade),
      valorUnitario: Number(
        movimentacao.valorUnitario.replace(/\./g, "").replace(",", "."),
      ),
    };

    try {
      let response;
      if (movimentacao.idMov) {
        response = await atualizarEntradaItem(movimentacao.idMov, payload);
      } else {
        response = await cadastrarEntradaItem(payload);
      }

      const itemSalvo = response.data;

      setMovimentacao((movimentacaoAtual) => ({
        ...movimentacaoAtual,
        idMov: itemSalvo.id,
        produtoNome: itemSalvo.produtoNome,
        valorTotal: formatarMoeda(itemSalvo.valorTotal),
      }));
      setMovimentacaoSalva(true);
      mostrarMensagem("Item salvo com sucesso", "sucesso");
      carregarEntradaItens();
    } catch (error) {
      mostrarMensagem(error.response?.data?.message, "erro");
    }
  };

  const handleEditarItem = (item = itemSelecionado) => {
    if (!item) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }

    setMovimentacao({
      idMov: String(item.id ?? ""),
      idProduto: String(item.produtoId ?? ""),
      produtoNome: item.produtoNome ?? "",
      quantidade: String(item.quantidade ?? ""),
      unidade: formatarUnidadeMedida(item.unidadeMedida),
      valorUnitario: formatarPrecoParaInput(item.valorUnitario),
      valorTotal: formatarMoeda(item.valorTotal),
    });

    setMovimentacaoSalva(false);
    setProdutoSelecionado(null);
    setBuscaProduto("");
    setModalAberto(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletarEntradaItem(id);

      setEntradaItens((entradaItensAtuais) =>
        entradaItensAtuais.filter((entradaItem) => entradaItem.id !== id),
      );

      mostrarMensagem("Item excluido com sucesso", "sucesso");
      setItemSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir item.";

      mostrarMensagem(mensagemErro, "erro");
      setItemSelecionado(null);
    }
  };

  const handleDeletarItem = async () => {
    if (!itemSelecionado) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }

    await handleDelete(itemSelecionado.id);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const buscaFormatada = buscaProduto.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(buscaFormatada) ||
      String(produto.id).includes(buscaFormatada)
    );
  });

  const handleOrdenarProduto = (coluna) => {
    setOrdenacaoProduto((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  const entradaItensOrdenados = [...entradaItensFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna];
    let valorB = b[ordenacao.coluna];

    if (
      ordenacao.coluna === "id" ||
      ordenacao.coluna === "produtoId" ||
      ordenacao.coluna === "quantidade" ||
      ordenacao.coluna === "valorUnitario" ||
      ordenacao.coluna === "valorTotal"
    ) {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacao.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacao.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    let valorA = a[ordenacaoProduto.coluna];
    let valorB = b[ordenacaoProduto.coluna];

    if (ordenacaoProduto.coluna === "id" || ordenacaoProduto.coluna === "preco") {
      valorA = Number(valorA);
      valorB = Number(valorB);
    } else {
      valorA = String(valorA ?? "").toLowerCase();
      valorB = String(valorB ?? "").toLowerCase();
    }

    if (valorA < valorB) {
      return ordenacaoProduto.direcao === "asc" ? -1 : 1;
    }

    if (valorA > valorB) {
      return ordenacaoProduto.direcao === "asc" ? 1 : -1;
    }

    return 0;
  });

  const indiceInicial = (paginaEntradaItensAtual - 1) * itensPorPaginaEntrada;
  const indiceInicialProduto = (paginaProdutoAtual - 1) * itensPorPaginaProduto;

  const indiceFinal = indiceInicial + itensPorPaginaEntrada;
  const indiceFinalProduto = indiceInicialProduto + itensPorPaginaProduto;

  const entradaItensPaginados = entradaItensOrdenados.slice(
    indiceInicial,
    indiceFinal,
  );
  const produtosPaginados = produtosOrdenados.slice(
    indiceInicialProduto,
    indiceFinalProduto,
  );

  const totalPaginasEntradaItens = Math.ceil(
    entradaItensOrdenados.length / itensPorPaginaEntrada,
  );
  const totalPaginasProduto = Math.ceil(
    produtosOrdenados.length / itensPorPaginaProduto,
  );

  const inicioExibidoEntrada =
    entradaItensOrdenados.length > 0 ? indiceInicial + 1 : 0;
  const inicioExibidoProduto =
    produtosOrdenados.length > 0 ? indiceInicialProduto + 1 : 0;

  const fimExibidoEntradaItens = Math.min(
    indiceFinal,
    entradaItensOrdenados.length,
  );
  const fimExibidoProduto = Math.min(
    indiceFinalProduto,
    produtosOrdenados.length,
  );

  const handlePrimeiraPaginaEntradaItens = () => {
    setPaginaEntradaItensAtual(1);
  };
  const handlePrimeiraPaginaProduto = () => {
    setPaginaProdutoAtual(1);
  };

  const handlePaginaAnteriorEntradaItens = () => {
    if (paginaEntradaItensAtual > 1) {
      setPaginaEntradaItensAtual(paginaEntradaItensAtual - 1);
    }
  };
  const handlePaginaAnteriorProduto = () => {
    if (paginaProdutoAtual > 1) {
      setPaginaProdutoAtual(paginaProdutoAtual - 1);
    }
  };

  const handleRecarregarEntradaItens = () => {
    setItemSelecionado(null);
    setPaginaEntradaItensAtual(1);
    carregarEntradaItens();
  };
  const handleRecarregarProduto = () => {
    setBuscaProduto("");
    setProdutoSelecionado(null);
    setPaginaProdutoAtual(1);
  };

  const handleProximaPaginaEntradaItens = () => {
    if (paginaEntradaItensAtual < totalPaginasEntradaItens)
      setPaginaEntradaItensAtual(paginaEntradaItensAtual + 1);
  };
  const handleProximaPaginaProduto = () => {
    if (paginaProdutoAtual < totalPaginasProduto)
      setPaginaProdutoAtual(paginaProdutoAtual + 1);
  };

  const handleUltimaPaginaEntradaItens = () => {
    setPaginaEntradaItensAtual(totalPaginasEntradaItens);
  };
  const handleUltimaPaginaProduto = () => {
    setPaginaProdutoAtual(totalPaginasProduto);
  };

  const confirmarProduto = (produto) => {
    setMovimentacao((movimentacaoAtual) => ({
      ...movimentacaoAtual,
      idProduto: produto.id,
      produtoNome: produto.nome,
      unidade: produto.unidadeMedida || "",
      valorUnitario: formatarPrecoParaInput(produto.preco),
    }));

    setSeletorProdutoAberto(false);
    setProdutoSelecionado(null);
    setBuscaProduto("");
  };

  const handleProdutoIdChange = (e) => {
    const valorDigitado = e.target.value;
    const produtoEncontrado = produtos.find(
      (produto) => String(produto.id) === valorDigitado,
    );

    setMovimentacao((movimentacaoAtual) => ({
      ...movimentacaoAtual,
      idProduto: valorDigitado,
      produtoNome: produtoEncontrado ? produtoEncontrado.nome : "",
      unidade: produtoEncontrado ? produtoEncontrado.unidadeMedida || "" : "",
      valorUnitario: produtoEncontrado
        ? formatarPrecoParaInput(produtoEncontrado.preco)
        : "",
    }));
  };

  return (
    <div className="entrada-itens-page">
      <div className="entrada-itens-header">
        <div className="entrada-itens-header-top">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/entrada/itens")}
            aria-label="Voltar para entradas"
            title="Voltar"
          >
            <FiArrowLeft />
          </button>
          <h1>Itens da Entrada</h1>
        </div>
        <p>Gerencie os itens vinculados a esta entrada</p>
      </div>
      <div className="entrada-itens-actions">
        <button
          type="button"
          className="new-item-button"
          onClick={() => {
            setMovimentacao({ ...movimentacaoInicial });
            setMovimentacaoSalva(false);
            setProdutoSelecionado(null);
            setBuscaProduto("");
            setModalAberto(true);
          }}
        >
          Novo
        </button>
        <button
          type="button"
          className="edit-item-button"
          onClick={() => handleEditarItem()}
        >
          Editar
        </button>
        <button
          type="button"
          className="delete-item-button"
          onClick={handleDeletarItem}
        >
          Deletar
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            onClick={handlePrimeiraPaginaEntradaItens}
            disabled={paginaEntradaItensAtual === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            onClick={handlePaginaAnteriorEntradaItens}
            disabled={paginaEntradaItensAtual === 1}
          >
            <FiChevronLeft />
          </button>
          <button className="refresh" onClick={handleRecarregarEntradaItens}>
            <FiRefreshCw />
          </button>
          <button
            className="next"
            onClick={handleProximaPaginaEntradaItens}
            disabled={
              totalPaginasEntradaItens === 0 ||
              paginaEntradaItensAtual === totalPaginasEntradaItens
            }
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            onClick={handleUltimaPaginaEntradaItens}
            disabled={
              totalPaginasEntradaItens === 0 ||
              paginaEntradaItensAtual === totalPaginasEntradaItens
            }
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibidoEntrada} - ${fimExibidoEntradaItens} / ${entradaItensOrdenados.length}`}
          </span>
        </div>
      </div>
      <div className="entrada-itens-card">
        <div className="entrada-itens-table-wrapper">
          <table className="entrada-itens-table">
            <thead>
              <tr>
                <th onClick={() => handleOrdenar("id")}>
                  <span className="sortable-header">
                    ID Mov.
                    {ordenacao.coluna === "id" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("produtoId")}>
                  <span className="sortable-header">
                    ID Produto
                    {ordenacao.coluna === "produtoId" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("produtoNome")}>
                  <span className="sortable-header">
                    Produto
                    {ordenacao.coluna === "produtoNome" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("quantidade")}>
                  <span className="sortable-header">
                    Quantidade
                    {ordenacao.coluna === "quantidade" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("unidadeMedida")}>
                  <span className="sortable-header">
                    Unidade
                    {ordenacao.coluna === "unidadeMedida" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("valorUnitario")}>
                  <span className="sortable-header">
                    Valor Unit.
                    {ordenacao.coluna === "valorUnitario" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("valorTotal")}>
                  <span className="sortable-header">
                    Valor Total
                    {ordenacao.coluna === "valorTotal" &&
                      (ordenacao.direcao === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entradaItensPaginados.map((item) => (
                <tr
                  key={item.id}
                  className={
                    itemSelecionado?.id === item.id ? "selected-row" : ""
                  }
                  onClick={() => {
                    setItemSelecionado(item);
                  }}
                  onDoubleClick={() => handleEditarItem(item)}
                >
                  <td>{item.id}</td>
                  <td>{item.produtoId}</td>
                  <td>{item.produtoNome}</td>
                  <td>{item.quantidade}</td>
                  <td>{formatarUnidadeMedida(item.unidadeMedida)}</td>
                  <td>{formatarMoeda(item.valorUnitario)}</td>
                  <td>{formatarMoeda(item.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalAberto && (
        <div className="overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h1>Movimentação de Produtos</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setModalAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="new-modal-btn"
                onClick={() => {
                  setMovimentacao({ ...movimentacaoInicial });
                  setMovimentacaoSalva(false);
                }}
              >
                Novo
              </button>
              <button
                className="cancel-modal-btn"
                disabled={movimentacaoSalva}
                onClick={() => {
                  setModalAberto(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="save-modal-btn"
                disabled={movimentacaoSalva}
                onClick={handleSalvarMovimentacao}
              >
                {movimentacaoSalva ? "Salvo" : "Salvar"}
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>ID Mov.</label>
                <input type="text" value={movimentacao.idMov} readOnly />
              </div>
              <div className="form-group">
                <label>Produto</label>
                <div
                  className={`lookup-field ${
                    movimentacaoSalva ? "" : "lookup-field-clickable"
                  }`}
                  onClick={(event) => {
                    if (
                      event.target.tagName === "INPUT" &&
                      !event.target.readOnly
                    ) {
                      return;
                    }

                    if (movimentacaoSalva) {
                      return;
                    }

                    setSeletorProdutoAberto(true);
                    setBuscaProduto("");
                    setProdutoSelecionado(null);
                  }}
                >
                  <input
                    type="text"
                    name="idProduto"
                    value={movimentacao.idProduto}
                    onChange={handleProdutoIdChange}
                    readOnly={movimentacaoSalva}
                  />
                  <input
                    type="text"
                    name="produtoNome"
                    value={movimentacao.produtoNome}
                    readOnly={true}
                  />
                  <button
                    name="magnifier"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSeletorProdutoAberto(true);
                      setBuscaProduto("");
                      setProdutoSelecionado(null);
                    }}
                    disabled={movimentacaoSalva}
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Unidade</label>
                <input type="text" value={movimentacao.unidade} readOnly />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <IMaskInput
                  mask={Number}
                  name="quantidade"
                  placeholder="Digite a quantidade do produto"
                  value={movimentacao.quantidade}
                  onAccept={(value) => {
                    setMovimentacao((movimentacaoAtual) => ({
                      ...movimentacaoAtual,
                      quantidade: value,
                    }));
                  }}
                  readOnly={movimentacaoSalva}
                />
              </div>
              <div className="form-group">
                <label>Valor Unitário</label>
                <div className="currency-field">
                  <span className="currency-prefix">R$</span>
                  <IMaskInput
                    mask={Number}
                    scale={2}
                    radix=","
                    thousandsSeparator="."
                    name="valorUnitario"
                    placeholder="Digite o valor unitário"
                    value={movimentacao.valorUnitario}
                    onAccept={(value) => {
                      setMovimentacao((movimentacaoAtual) => ({
                        ...movimentacaoAtual,
                        valorUnitario: value,
                      }));
                    }}
                    readOnly={movimentacaoSalva}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Valor Total</label>
                <input type="text" value={movimentacao.valorTotal} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}
      {seletorProdutoAberto && (
        <div className="produto-overlay">
          <div className="produto-box">
            <div className="produto-header">
              <h1>Produtos</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setSeletorProdutoAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="produto-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setPaginaProdutoAtual(1);
                }}
              />
              <div className="pagination-controls produto-pagination-controls">
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
                  {`${inicioExibidoProduto} - ${fimExibidoProduto} / ${produtosOrdenados.length}`}
                </span>
              </div>
            </div>
            <div className="produto-table-wrapper">
              <table className="produto-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarProduto("id")}>
                      <span className="sortable-header">
                        ID
                        {ordenacaoProduto.coluna === "id" &&
                          (ordenacaoProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarProduto("nome")}>
                      <span className="sortable-header">
                        Nome
                        {ordenacaoProduto.coluna === "nome" &&
                          (ordenacaoProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarProduto("preco")}>
                      <span className="sortable-header">
                        Preço
                        {ordenacaoProduto.coluna === "preco" &&
                          (ordenacaoProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarProduto("categoriaNome")}>
                      <span className="sortable-header">
                        Categoria
                        {ordenacaoProduto.coluna === "categoriaNome" &&
                          (ordenacaoProduto.direcao === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {produtosPaginados.map((produto) => (
                    <tr
                      key={produto.id}
                      className={
                        produtoSelecionado?.id === produto.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => {
                        produtoSelecionado?.id === produto.id
                          ? setProdutoSelecionado(null)
                          : setProdutoSelecionado(produto);
                      }}
                      onDoubleClick={() => confirmarProduto(produto)}
                    >
                      <td>{produto.id}</td>
                      <td>{produto.nome}</td>
                      <td>{formatarMoeda(produto.preco)}</td>
                      <td>{produto.categoriaNome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="produto-footer">
              <button
                onClick={() => {
                  if (produtoSelecionado) {
                    confirmarProduto(produtoSelecionado);
                  } else {
                    mostrarMensagem("Selecione um registro", "erro");
                  }
                }}
              >
                Selecionar
              </button>
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

export default ItensDetalhe;
